import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import create_schema, get_db
from .models import (
    AlertRecord,
    Base,
    DoseRecord,
    InterventionRecord,
    PatientRecord,
    TelemetryRecord,
)
from .schemas import (
    AlertData,
    AlertResolution,
    BootstrapData,
    DeviceEvent,
    DoseData,
    DoseScheduleUpdate,
    InterventionData,
    PatientData,
    StateResponse,
)


def _record(model: type[Base], data: Any) -> Base:
    return model(**data.model_dump())


def _state(session: Session) -> StateResponse:
    return StateResponse(
        patients=session.scalars(select(PatientRecord).order_by(PatientRecord.id)).all(),
        doses=session.scalars(
            select(DoseRecord).order_by(DoseRecord.date, DoseRecord.id)
        ).all(),
        alerts=session.scalars(
            select(AlertRecord).order_by(AlertRecord.created_at.desc())
        ).all(),
        telemetry=session.scalars(
            select(TelemetryRecord).order_by(TelemetryRecord.received_at.desc())
        ).all(),
        interventions=session.scalars(
            select(InterventionRecord).order_by(InterventionRecord.logged_at.desc())
        ).all(),
    )


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_schema()
    yield


app = FastAPI(
    title="Smart Pill Box API",
    version="1.0.0",
    description="Persistence API for the Smart Pill Box React application.",
    lifespan=lifespan,
)

origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:4173"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/state", response_model=StateResponse)
def read_state(session: Session = Depends(get_db)) -> StateResponse:
    return _state(session)


@app.post("/api/bootstrap", response_model=StateResponse)
def bootstrap(data: BootstrapData, session: Session = Depends(get_db)) -> StateResponse:
    if session.bind and session.bind.dialect.name == "postgresql":
        session.execute(text("SELECT pg_advisory_xact_lock(7319042201)"))

    if session.scalar(select(PatientRecord.id).limit(1)) is None:
        for model, items in (
            (PatientRecord, data.patients),
            (DoseRecord, data.doses),
            (AlertRecord, data.alerts),
            (TelemetryRecord, data.telemetry),
            (InterventionRecord, data.interventions),
        ):
            session.add_all(_record(model, item) for item in items)
        try:
            session.commit()
        except IntegrityError as exc:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Initial data conflicts with existing database records.",
            ) from exc
    return _state(session)


@app.post("/api/patients", response_model=PatientData, status_code=201)
def create_patient(data: PatientData, session: Session = Depends(get_db)) -> PatientRecord:
    patient = _record(PatientRecord, data)
    session.add(patient)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Patient ID or smart-box ID already exists.",
        ) from exc
    return patient


@app.patch("/api/patients/{patient_id}", response_model=PatientData)
def update_patient(
    patient_id: str,
    update: DoseScheduleUpdate,
    session: Session = Depends(get_db),
) -> PatientRecord:
    patient = session.get(PatientRecord, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found.")
    values = update.model_dump(exclude_unset=True)
    for field, value in values.items():
        setattr(patient, field, value)
    if "dose_times" in values:
        patient.dose_time = values["dose_times"][0]
    elif "dose_time" in values:
        patient.dose_times = [values["dose_time"]]
    session.commit()
    return patient


@app.put("/api/doses/{patient_id}/{date}", response_model=DoseData)
def upsert_dose(
    patient_id: str,
    date: str,
    data: DoseData,
    session: Session = Depends(get_db),
) -> DoseRecord:
    if data.patient_id != patient_id or data.date != date:
        raise HTTPException(status_code=422, detail="Dose path and body must match.")
    if session.get(PatientRecord, patient_id) is None:
        raise HTTPException(status_code=404, detail="Patient not found.")
    dose = session.get(DoseRecord, data.id)
    if dose is None:
        dose = _record(DoseRecord, data)
        session.add(dose)
    else:
        for field, value in data.model_dump().items():
            setattr(dose, field, value)
    session.commit()
    return dose


@app.post("/api/events", status_code=201)
def record_device_event(
    event: DeviceEvent, session: Session = Depends(get_db)
) -> dict[str, str]:
    if session.get(PatientRecord, event.telemetry.patient_id) is None:
        raise HTTPException(status_code=404, detail="Patient not found.")
    session.add(_record(TelemetryRecord, event.telemetry))
    if event.dose is not None:
        if event.dose.patient_id != event.telemetry.patient_id:
            raise HTTPException(status_code=422, detail="Event dose patient must match.")
        dose = session.get(DoseRecord, event.dose.id)
        if dose is None:
            session.add(_record(DoseRecord, event.dose))
        else:
            for field, value in event.dose.model_dump().items():
                setattr(dose, field, value)
    if event.alert is not None:
        if event.alert.patient_id != event.telemetry.patient_id:
            raise HTTPException(status_code=422, detail="Event alert patient must match.")
        session.add(_record(AlertRecord, event.alert))
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Device event contains a duplicate record ID.",
        ) from exc
    return {"status": "stored"}


@app.post("/api/alerts", response_model=AlertData, status_code=201)
def create_alert(data: AlertData, session: Session = Depends(get_db)) -> AlertRecord:
    if session.get(PatientRecord, data.patient_id) is None:
        raise HTTPException(status_code=404, detail="Patient not found.")
    alert = _record(AlertRecord, data)
    session.add(alert)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Alert ID already exists."
        ) from exc
    return alert


@app.patch("/api/alerts/{alert_id}", response_model=AlertData)
def resolve_alert(
    alert_id: str,
    update: AlertResolution,
    session: Session = Depends(get_db),
) -> AlertRecord:
    alert = session.get(AlertRecord, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.resolved = update.resolved
    session.commit()
    return alert


@app.post("/api/interventions", response_model=InterventionData, status_code=201)
def create_intervention(
    data: InterventionData, session: Session = Depends(get_db)
) -> InterventionRecord:
    if session.get(PatientRecord, data.patient_id) is None:
        raise HTTPException(status_code=404, detail="Patient not found.")
    intervention = _record(InterventionRecord, data)
    session.add(intervention)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Intervention ID already exists.",
        ) from exc
    return intervention
