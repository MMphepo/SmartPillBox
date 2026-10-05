from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import (
    SessionLocal,
    Event,
    init_db,
)


# ==========================================
# APPLICATION
# ==========================================

app = FastAPI(
    title="Smart Pill Box IoT Server",
    version="1.0.0",
)


# ==========================================
# STARTUP
# ==========================================

@app.on_event("startup")
def startup():

    init_db()


# ==========================================
# DATABASE SESSION
# ==========================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# ==========================================
# EVENT REQUEST
# ==========================================

class EventRequest(BaseModel):

    device_id: str

    event: str

    status: str | None = None

    details: str | None = None


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():

    return {
        "system": "Smart Pill Box IoT Server",
        "status": "running",
        "database": "Neon PostgreSQL",
    }


# ==========================================
# RECEIVE EVENT
# ==========================================

@app.post("/api/events")
def receive_event(
    event_data: EventRequest,
    db: Session = Depends(get_db),
):

    event = Event(

        device_id=event_data.device_id,

        event=event_data.event,

        status=event_data.status,

        details=event_data.details,
    )


    db.add(event)

    db.commit()

    db.refresh(event)


    print()

    print("==========================================")

    print("       EVENT SAVED TO NEON")

    print("==========================================")

    print(f"ID       : {event.id}")

    print(f"Device   : {event.device_id}")

    print(f"Event    : {event.event}")

    print(f"Status   : {event.status}")

    print(f"Timestamp: {event.timestamp}")

    print("==========================================")


    return {

        "success": True,

        "message": "Event saved",

        "data": {

            "id": event.id,

            "device_id": event.device_id,

            "event": event.event,

            "status": event.status,

            "timestamp": event.timestamp,

        },
    }


# ==========================================
# GET EVENTS
# ==========================================

@app.get("/api/events")
def get_events(
    device_id: str | None = None,
    limit: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Event)
    if device_id:
        query = query.filter(Event.device_id == device_id)
    query = query.order_by(Event.timestamp.desc())
    if limit:
        query = query.limit(limit)

    events = query.all()


    return {

        "count": len(events),

        "events": [

            {
                "id": event.id,

                "device_id": event.device_id,

                "event": event.event,

                "status": event.status,

                "timestamp": event.timestamp,

            }

            for event in events
        ],
    }