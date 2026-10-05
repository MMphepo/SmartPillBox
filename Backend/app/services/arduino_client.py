import os
import logging
import httpx
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import AlertRecord, DoseRecord, PatientRecord, TelemetryRecord

logger = logging.getLogger("arduino_client")

ARDUINO_SERVER_URL = os.getenv("ARDUINO_SERVER_URL", "http://localhost:8001").rstrip("/")


def fetch_arduino_events(device_id: str | None = None, limit: int = 50) -> list[dict]:
    """Fetch raw events from the Arduino Server REST API."""
    url = f"{ARDUINO_SERVER_URL}/api/events"
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(url)
            if resp.status_code != 200:
                logger.warning(f"Arduino server returned {resp.status_code}")
                return []
            data = resp.json()
            events = data.get("events", [])
            if device_id:
                events = [e for e in events if e.get("device_id") == device_id]
            if limit:
                events = events[:limit]
            return events
    except Exception as exc:
        logger.warning(f"Could not connect to Arduino Server at {url}: {exc}")
        return []


def sync_device_events(box_id: str, session: Session) -> list[TelemetryRecord]:
    """
    On-demand sync: fetches events from Arduino Server for box_id,
    maps them to patient, and creates missing TelemetryRecord / DoseRecord / AlertRecord.
    """
    patient = session.scalar(select(PatientRecord).where(PatientRecord.box_id == box_id))
    if not patient:
        return []

    raw_events = fetch_arduino_events(device_id=box_id)
    created_telemetry: list[TelemetryRecord] = []

    for evt in reversed(raw_events):  # process oldest to newest
        evt_id = str(evt.get("id"))
        telemetry_id = f"ard-{box_id}-{evt_id}"

        # Check if already synced
        existing = session.get(TelemetryRecord, telemetry_id)
        if existing:
            continue

        event_name = evt.get("event", "UNKNOWN")
        status_name = evt.get("status", "")
        ts = evt.get("timestamp") or datetime.utcnow().isoformat()
        if isinstance(ts, datetime):
            ts = ts.isoformat()

        raw_str = f"SB|{box_id}|EVT:{event_name}|STAT:{status_name}|ID:{evt_id}"

        telemetry = TelemetryRecord(
            id=telemetry_id,
            box_id=box_id,
            patient_id=patient.id,
            event=event_name,
            raw=raw_str,
            received_at=str(ts),
        )
        session.add(telemetry)
        created_telemetry.append(telemetry)

        # Interpret event into dose / alert
        date_str = ts.split("T")[0] if "T" in str(ts) else str(ts)[:10]
        time_str = ts.split("T")[1][:5] if "T" in str(ts) and len(str(ts).split("T")[1]) >= 5 else "12:00"

        if event_name == "DOSE_TAKEN":
            dose_id = f"{patient.id}-{date_str}"
            dose = session.get(DoseRecord, dose_id)
            if not dose:
                dose = DoseRecord(
                    id=dose_id,
                    patient_id=patient.id,
                    date=date_str,
                    status="taken",
                    source="smartbox",
                    time=time_str,
                )
                session.add(dose)
            else:
                dose.status = "taken"
                dose.source = "smartbox"
                dose.time = time_str

        elif event_name == "MISSED_DOSE":
            dose_id = f"{patient.id}-{date_str}"
            dose = session.get(DoseRecord, dose_id)
            if not dose:
                dose = DoseRecord(
                    id=dose_id,
                    patient_id=patient.id,
                    date=date_str,
                    status="missed",
                    source="none",
                    time="--:--",
                )
                session.add(dose)
            alert_id = f"alert-missed-{patient.id}-{evt_id}"
            if not session.get(AlertRecord, alert_id):
                session.add(
                    AlertRecord(
                        id=alert_id,
                        patient_id=patient.id,
                        kind="MISSED_DOSE_ALERT",
                        message=f"No dose opening detected by {box_id} in the scheduled window.",
                        created_at=str(ts),
                        severity="high",
                        resolved=False,
                    )
                )

        elif event_name == "LOW_BATTERY":
            alert_id = f"alert-bat-{patient.id}-{evt_id}"
            if not session.get(AlertRecord, alert_id):
                session.add(
                    AlertRecord(
                        id=alert_id,
                        patient_id=patient.id,
                        kind="LOW_BATTERY_WARNING",
                        message=f"{box_id} reported low battery level.",
                        created_at=str(ts),
                        severity="medium",
                        resolved=False,
                    )
                )

    if created_telemetry:
        session.commit()

    return created_telemetry
