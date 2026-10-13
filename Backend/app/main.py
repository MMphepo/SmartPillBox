import os
import re
from contextlib import asynccontextmanager
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .auth import (
    create_access_token,
    get_current_user,
    get_current_user_optional,
    hash_password,
    user_record_to_response,
    verify_password,
)
from .database import create_schema, get_db
from .models import (
    AlertRecord,
    Base,
    DoseRecord,
    InterventionRecord,
    PatientRecord,
    TelemetryRecord,
    UserRecord,
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
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from .services.arduino_client import fetch_arduino_events, sync_device_events


def _record(model: type[Base], data: Any) -> Base:
    return model(**data.model_dump())


def _seed_users(session: Session) -> None:
    seed_data = [
        {
            "id": "usr-hsa-1",
            "username": "hsa.chimwemwe",
            "name": "Chimwemwe Phiri (HSA)",
            "role": "health_worker",
            "facility": "Zomba Central Hospital",
            "district": "Zomba",
            "zone": "South East",
            "password_hash": hash_password("password123"),
        },
        {
            "id": "usr-do-1",
            "username": "do.manda",
            "name": "Dr. Manda (District TB Officer)",
            "role": "district_officer",
            "facility": "Zomba DHO",
            "district": "Zomba",
            "zone": "South East",
            "password_hash": hash_password("password123"),
        },
        {
            "id": "usr-pat-1",
            "username": "pat.grace",
            "name": "Grace Banda",
            "role": "patient",
            "facility": "Zomba Central Hospital",
            "district": "Zomba",
            "zone": "South East",
            "patient_id": "pat-1",
            "password_hash": hash_password("password123"),
        },
    ]

    for user_info in seed_data:
        existing = session.scalar(
            select(UserRecord).where(UserRecord.username == user_info["username"])
        )
        if not existing:
            session.add(UserRecord(**user_info))
    session.commit()


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
    # Seed users if database is empty or missing initial accounts
    from .database import get_session_factory
    with get_session_factory()() as session:
        _seed_users(session)
    yield


app = FastAPI(
    title="Smart Pill Box API",
    version="1.0.0",
    description="Persistence API for the Smart Pill Box React application.",
    lifespan=lifespan,
)

configured_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:4173"
    ).split(",")
    if origin.strip()
]
origins = [origin for origin in configured_origins if "*" not in origin]
origin_patterns = [
    re.escape(origin).replace(r"\*", "[^/]+")
    for origin in configured_origins
    if "*" in origin
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=f"^(?:{'|'.join(origin_patterns)})$" if origin_patterns else None,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "OPTIONS", "DELETE"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/api/auth/register", response_model=TokenResponse, status_code=201)
def register_user(
    data: UserRegister,
    session: Session = Depends(get_db),
    current_user: UserRecord | None = Depends(get_current_user_optional),
) -> TokenResponse:
    # Restrict privileged role self-registration unless an admin user calls it
    if data.role in ["health_worker", "district_officer"]:
        if not current_user or current_user.role != "district_officer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Self-registration is restricted to patients. Privileged roles require administrative account creation.",
            )

    normalized_username = data.username.strip().lower()
    existing = session.scalar(
        select(UserRecord).where(UserRecord.username == normalized_username)
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists.",
        )

    user_count = session.scalar(select(UserRecord.id).execution_options(autocommit=False))
    user_id = f"usr-{data.role[:3]}-{int(session.query(UserRecord).count()) + 100}"
    user = UserRecord(
        id=user_id,
        username=normalized_username,
        name=data.name,
        password_hash=hash_password(data.password),
        role=data.role,
        facility=data.facility or "Zomba Central Hospital",
        district=data.district or "Zomba",
        zone=data.zone or "South East",
        patient_id=data.patient_id,
    )
    session.add(user)
    session.commit()

    user_resp = user_record_to_response(user)
    token = create_access_token({"sub": user.id, "role": user.role})
    return TokenResponse(access_token=token, token_type="bearer", user=user_resp)

@app.post("/api/auth/login", response_model=TokenResponse)
def login_user(data: UserLogin, session: Session = Depends(get_db)) -> TokenResponse:
    print('login: reached')
    normalized_username = data.username.strip().lower()
    print('login: normalized username', normalized_username)
    user = session.scalar(
        select(UserRecord).where(UserRecord.username == normalized_username)
    )
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    if data.role and user.role != data.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account '{data.username}' does not have the '{data.role}' role.",
        )

    token = create_access_token({"sub": user.id, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_record_to_response(user),
    )


@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: UserRecord = Depends(get_current_user)) -> UserResponse:
    return user_record_to_response(current_user)


# ==================== PATIENTS & DATA ENDPOINTS ====================

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


@app.get("/api/patients", response_model=list[PatientData])
def list_patients(
    facility: str | None = None,
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
) -> list[PatientRecord]:
    stmt = select(PatientRecord)
    if current_user.role == "patient":
        if not current_user.patient_id:
            return []
        stmt = stmt.where(PatientRecord.id == current_user.patient_id)
    elif facility:
        stmt = stmt.where(PatientRecord.facility == facility)
    return session.scalars(stmt.order_by(PatientRecord.id)).all()


@app.get("/api/patients/{patient_id}", response_model=PatientData)
def get_patient(
    patient_id: str,
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
) -> PatientRecord:
    if current_user.role == "patient" and current_user.patient_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Patients can only view their own record.",
        )
    patient = session.get(PatientRecord, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found.")

    # Trigger Arduino sync for this patient's box if box_id exists
    if patient.box_id:
        sync_device_events(patient.box_id, session)

    return patient


@app.post("/api/patients", response_model=PatientData, status_code=201)
def create_patient(
    data: PatientData,
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
) -> PatientRecord:
    if current_user.role not in ["health_worker", "district_officer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only health workers or district officers can enrol patients.",
        )
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
    current_user: UserRecord = Depends(get_current_user),
) -> PatientRecord:
    if current_user.role not in ["health_worker", "district_officer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only health workers or district officers can update dose schedules.",
        )
    patient = session.get(PatientRecord, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found.")
    values = update.model_dump(exclude_unset=True)
    for field, value in values.items():
        setattr(patient, field, value)
    if "dose_times" in values and values["dose_times"]:
        patient.dose_time = values["dose_times"][0]
    elif "dose_time" in values and values["dose_time"]:
        patient.dose_times = [values["dose_time"]]
    session.commit()
    return patient


@app.get("/api/doses/{patient_id}", response_model=list[DoseData])
def get_patient_doses(
    patient_id: str,
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
) -> list[DoseRecord]:
    if current_user.role == "patient" and current_user.patient_id != patient_id:
        raise HTTPException(status_code=403, detail="Unauthorized access.")
    return session.scalars(
        select(DoseRecord)
        .where(DoseRecord.patient_id == patient_id)
        .order_by(DoseRecord.date)
    ).all()


@app.put("/api/doses/{patient_id}/{date}", response_model=DoseData)
def upsert_dose(
    patient_id: str,
    date: str,
    data: DoseData,
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
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


@app.get("/api/alerts", response_model=list[AlertData])
def list_alerts(
    patient_id: str | None = None,
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
) -> list[AlertRecord]:
    stmt = select(AlertRecord)
    if current_user.role == "patient":
        stmt = stmt.where(AlertRecord.patient_id == (current_user.patient_id or ""))
    elif patient_id:
        stmt = stmt.where(AlertRecord.patient_id == patient_id)
    return session.scalars(stmt.order_by(AlertRecord.created_at.desc())).all()


@app.post("/api/alerts", response_model=AlertData, status_code=201)
def create_alert(
    data: AlertData,
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
) -> AlertRecord:
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
    current_user: UserRecord = Depends(get_current_user),
) -> AlertRecord:
    alert = session.get(AlertRecord, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.resolved = update.resolved
    session.commit()
    return alert


@app.post("/api/interventions", response_model=InterventionData, status_code=201)
def create_intervention(
    data: InterventionData,
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
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


# ==================== ARDUINO INTEGRATION ENDPOINTS ====================

@app.get("/api/devices/{device_id}/events")
def get_device_events(
    device_id: str,
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
) -> dict:
    """Main Backend queries Arduino Server via HTTP, syncs events to DB, and returns them."""
    synced = sync_device_events(device_id, session)
    events = fetch_arduino_events(device_id=device_id)
    return {
        "device_id": device_id,
        "synced_count": len(synced),
        "events": events,
    }


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


# ==================== PATIENT PORTAL API ====================

@app.get("/api/patients/me/requests")
@app.get("/api/patients/me")
def get_patient_me(
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    if current_user.role != "patient" or not current_user.patient_id:
        patient = session.scalars(select(PatientRecord)).first()
        if not patient:
            raise HTTPException(status_code=404, detail="No patient record found.")
        return patient

    patient = session.get(PatientRecord, current_user.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found.")

    if patient.box_id:
        sync_device_events(patient.box_id, session)

    return patient


@app.post("/api/patients/me/requests", status_code=201)
def create_patient_request(
    data: dict,
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    patient_id = current_user.patient_id or data.get("patientId")
    if not patient_id:
        raise HTTPException(status_code=400, detail="Patient ID missing.")

    patient = session.get(PatientRecord, patient_id)
    kind = data.get("kind", "SUPPORT_REQUEST")

    alert_id = f"req-{patient_id}-{int(session.query(AlertRecord).count()) + 1000}"
    msg = (
        f"{patient.name if patient else 'Patient'} requested a visit or call from their HSA."
        if kind == "SUPPORT_REQUEST"
        else f"{patient.name if patient else 'Patient'} reported a fault with {patient.box_id if patient else 'box'}."
    )

    alert = AlertRecord(
        id=alert_id,
        patient_id=patient_id,
        kind=kind,
        message=msg,
        created_at=data.get("createdAt") or os.getenv("CURRENT_TIME", "2025-05-15T10:00:00Z"),
        severity="medium" if kind == "SUPPORT_REQUEST" else "high",
        resolved=False,
    )
    session.add(alert)
    session.commit()
    return alert


# ==================== DISTRICT OFFICER AGGREGATION ENDPOINTS ====================

@app.get("/api/district/dashboard")
def get_district_dashboard(
    session: Session = Depends(get_db),
    current_user: UserRecord = Depends(get_current_user),
):
    if current_user.role not in ["district_officer", "health_worker"]:
        raise HTTPException(status_code=403, detail="Unauthorized access.")

    patients = session.scalars(select(PatientRecord)).all()
    doses = session.scalars(select(DoseRecord)).all()
    alerts = session.scalars(select(AlertRecord)).all()

    total_patients = len(patients)
    missed_doses = len([d for d in doses if d.status == "missed"])
    active_alerts = len([a for a in alerts if not a.resolved])

    # Adherence rate calculation
    total_doses = len(doses)
    adherence_rate = (
        round(((total_doses - missed_doses) / total_doses) * 100) if total_doses > 0 else 92
    )

    return {
        "district": current_user.district or "Zomba",
        "totalPatients": total_patients,
        "activeAlerts": active_alerts,
        "missedDoses": missed_doses,
        "adherenceRate": adherence_rate,
        "facilitiesCount": 12,
    }
