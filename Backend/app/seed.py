import os
import sys
from datetime import datetime, timedelta

# Ensure parent path is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.auth import hash_password
from app.database import create_schema, get_session_factory
from app.models import (
    AlertRecord,
    DoseRecord,
    InterventionRecord,
    PatientRecord,
    TelemetryRecord,
    UserRecord,
)


def seed_database(drop_existing: bool = False) -> None:
    create_schema()
    session_factory = get_session_factory()

    with session_factory() as session:
        if drop_existing:
            session.query(InterventionRecord).delete()
            session.query(TelemetryRecord).delete()
            session.query(AlertRecord).delete()
            session.query(DoseRecord).delete()
            session.query(PatientRecord).delete()
            session.query(UserRecord).delete()
            session.commit()

        print("Seeding database with Malawian test data...")

        # ----------------------------------------------------
        # USERS
        # ----------------------------------------------------
        users_data = [
            # Health Workers
            {
                "id": "usr-hsa-01",
                "username": "hsa.chimwemwe",
                "name": "Chimwemwe Phiri",
                "role": "health_worker",
                "facility": "Zomba Central Hospital",
                "district": "Zomba",
                "zone": "South East",
            },
            {
                "id": "usr-hsa-02",
                "username": "hsa.kondwani",
                "name": "Kondwani Banda",
                "role": "health_worker",
                "facility": "Bwaila Hospital",
                "district": "Lilongwe",
                "zone": "Central West",
            },
            {
                "id": "usr-hsa-03",
                "username": "hsa.yamikani",
                "name": "Yamikani Mvula",
                "role": "health_worker",
                "facility": "Queen Elizabeth Central Hospital",
                "district": "Blantyre",
                "zone": "South West",
            },
            # District Officers
            {
                "id": "usr-do-01",
                "username": "do.memory",
                "name": "Dr. Memory Chisale",
                "role": "district_officer",
                "facility": "Zomba DHO",
                "district": "Zomba",
                "zone": "South East",
            },
            {
                "id": "usr-do-02",
                "username": "do.blessings",
                "name": "Dr. Blessings Kamanga",
                "role": "district_officer",
                "facility": "Lilongwe DHO",
                "district": "Lilongwe",
                "zone": "Central West",
            },
            # Patients
            {
                "id": "usr-pat-01",
                "username": "pat.grace",
                "name": "Grace Banda",
                "role": "patient",
                "facility": "Zomba Central Hospital",
                "district": "Zomba",
                "zone": "South East",
                "patient_id": "pat-1",
            },
            {
                "id": "usr-pat-02",
                "username": "pat.tadala",
                "name": "Tadala Tembo",
                "role": "patient",
                "facility": "Bwaila Hospital",
                "district": "Lilongwe",
                "zone": "Central West",
                "patient_id": "pat-2",
            },
            {
                "id": "usr-pat-03",
                "username": "pat.chisomo",
                "name": "Chisomo Nyirenda",
                "role": "patient",
                "facility": "Queen Elizabeth Central Hospital",
                "district": "Blantyre",
                "zone": "South West",
                "patient_id": "pat-3",
            },
            {
                "id": "usr-pat-04",
                "username": "pat.limbani",
                "name": "Limbani Moyo",
                "role": "patient",
                "facility": "Mzuzu Central Hospital",
                "district": "Mzimba",
                "zone": "North",
                "patient_id": "pat-4",
            },
        ]

        for u in users_data:
            existing = session.scalar(
                select(UserRecord).where(UserRecord.username == u["username"])
            )
            if not existing:
                session.add(
                    UserRecord(
                        id=u["id"],
                        username=u["username"],
                        name=u["name"],
                        password_hash=hash_password("password123"),
                        role=u["role"],
                        facility=u["facility"],
                        district=u["district"],
                        zone=u["zone"],
                        patient_id=u.get("patient_id"),
                    )
                )

        # ----------------------------------------------------
        # PATIENTS
        # ----------------------------------------------------
        patients_data = [
            {
                "id": "pat-1",
                "name": "Grace Banda",
                "age": 28,
                "sex": "Female",
                "facility": "Zomba Central Hospital",
                "phase": "Intensive",
                "treatment_day": 24,
                "box_id": "ZOMBA-042",
                "battery": 88,
                "guardian_id": "g-01",
                "hsa_id": "usr-hsa-01",
                "phone": "+265999123456",
                "regimen": "2RHZE/4RH",
                "dose_time": "08:00",
                "dose_times": ["08:00"],
            },
            {
                "id": "pat-2",
                "name": "Tadala Tembo",
                "age": 34,
                "sex": "Female",
                "facility": "Bwaila Hospital",
                "phase": "Continuation",
                "treatment_day": 72,
                "box_id": "BWAILA-108",
                "battery": 92,
                "guardian_id": "g-02",
                "hsa_id": "usr-hsa-02",
                "phone": "+265888234567",
                "regimen": "2RHZE/4RH",
                "dose_time": "07:30",
                "dose_times": ["07:30", "19:30"],
            },
            {
                "id": "pat-3",
                "name": "Chisomo Nyirenda",
                "age": 42,
                "sex": "Male",
                "facility": "Queen Elizabeth Central Hospital",
                "phase": "Intensive",
                "treatment_day": 14,
                "box_id": "QECH-214",
                "battery": 65,
                "guardian_id": "g-03",
                "hsa_id": "usr-hsa-03",
                "phone": "+265999345678",
                "regimen": "2RHZE/4RH",
                "dose_time": "08:00",
                "dose_times": ["08:00"],
            },
            {
                "id": "pat-4",
                "name": "Limbani Moyo",
                "age": 51,
                "sex": "Male",
                "facility": "Mzuzu Central Hospital",
                "phase": "Continuation",
                "treatment_day": 110,
                "box_id": "MZUZU-305",
                "battery": 45,
                "guardian_id": "g-04",
                "hsa_id": "usr-hsa-01",
                "phone": "+265888456789",
                "regimen": "2RHZE/4RH",
                "dose_time": "09:00",
                "dose_times": ["09:00"],
            },
            {
                "id": "pat-5",
                "name": "Mayamiko Kanyinji",
                "age": 22,
                "sex": "Female",
                "facility": "Karonga District Hospital",
                "phase": "Intensive",
                "treatment_day": 8,
                "box_id": "KARONGA-412",
                "battery": 98,
                "guardian_id": "g-05",
                "hsa_id": "usr-hsa-02",
                "phone": "+265999567890",
                "regimen": "2RHZE/4RH",
                "dose_time": "08:00",
                "dose_times": ["08:00"],
            },
            {
                "id": "pat-6",
                "name": "Mphatso Chawinga",
                "age": 39,
                "sex": "Male",
                "facility": "Mangochi District Hospital",
                "phase": "Continuation",
                "treatment_day": 85,
                "box_id": "MANGOCHI-520",
                "battery": 78,
                "guardian_id": "g-06",
                "hsa_id": "usr-hsa-03",
                "phone": "+265888678901",
                "regimen": "2RHZE/4RH",
                "dose_time": "07:00",
                "dose_times": ["07:00"],
            },
        ]

        for p in patients_data:
            existing = session.get(PatientRecord, p["id"])
            if not existing:
                session.add(PatientRecord(**p))

        # ----------------------------------------------------
        # DOSES (Generate 30 days history for patients)
        # ----------------------------------------------------
        today = datetime.now()
        for p in patients_data:
            p_id = p["id"]
            for i in range(30):
                d_date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
                dose_id = f"{p_id}-{d_date}"
                if session.get(DoseRecord, dose_id):
                    continue

                status = "taken" if i % 7 != 0 else "missed"
                source = "smartbox" if status == "taken" else "none"
                time_str = p["dose_time"] if status == "taken" else "--:--"

                session.add(
                    DoseRecord(
                        id=dose_id,
                        patient_id=p_id,
                        date=d_date,
                        status=status,
                        source=source,
                        time=time_str,
                    )
                )

        # ----------------------------------------------------
        # ALERTS
        # ----------------------------------------------------
        alerts_data = [
            {
                "id": "alert-m-1",
                "patient_id": "pat-1",
                "kind": "MISSED_DOSE_ALERT",
                "message": "No dose opening detected by ZOMBA-042 in the scheduled window.",
                "created_at": (today - timedelta(days=1)).isoformat(),
                "severity": "high",
                "resolved": False,
            },
            {
                "id": "alert-b-1",
                "patient_id": "pat-4",
                "kind": "LOW_BATTERY_WARNING",
                "message": "MZUZU-305 reported battery at 45%. Schedule battery replacement.",
                "created_at": (today - timedelta(hours=4)).isoformat(),
                "severity": "medium",
                "resolved": False,
            },
            {
                "id": "alert-s-1",
                "patient_id": "pat-3",
                "kind": "SUPPORT_REQUEST",
                "message": "Chisomo Nyirenda requested an HSA home visit.",
                "created_at": (today - timedelta(hours=12)).isoformat(),
                "severity": "medium",
                "resolved": False,
            },
        ]

        for a in alerts_data:
            if not session.get(AlertRecord, a["id"]):
                session.add(AlertRecord(**a))

        # ----------------------------------------------------
        # INTERVENTIONS
        # ----------------------------------------------------
        interventions_data = [
            {
                "id": "int-01",
                "patient_id": "pat-1",
                "hsa_id": "usr-hsa-01",
                "type": "Home visit",
                "notes": "Visited Grace Banda in Zomba. Checked smart box functionality and provided adherence counseling.",
                "logged_at": (today - timedelta(days=2)).strftime("%Y-%m-%d"),
            },
            {
                "id": "int-02",
                "patient_id": "pat-3",
                "hsa_id": "usr-hsa-03",
                "type": "Phone check-in",
                "notes": "Called Chisomo Nyirenda following a missed dose. Patient reported feeling unwell, advised on medication timing.",
                "logged_at": (today - timedelta(days=5)).strftime("%Y-%m-%d"),
            },
        ]

        for item in interventions_data:
            if not session.get(InterventionRecord, item["id"]):
                session.add(InterventionRecord(**item))

        session.commit()
        print("Database successfully seeded with Malawian test data!")


if __name__ == "__main__":
    drop = "--reset" in sys.argv or "--drop" in sys.argv
    seed_database(drop_existing=drop)
