from sqlalchemy import Boolean, Integer, JSON, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class PatientRecord(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    sex: Mapped[str] = mapped_column(String(20), nullable=False)
    facility: Mapped[str] = mapped_column(String(200), nullable=False)
    phase: Mapped[str] = mapped_column(String(30), nullable=False)
    treatment_day: Mapped[int] = mapped_column(Integer, nullable=False)
    box_id: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    battery: Mapped[int] = mapped_column(Integer, nullable=False)
    guardian_id: Mapped[str] = mapped_column(String(100), nullable=False)
    hsa_id: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    regimen: Mapped[str] = mapped_column(String(200), nullable=False)
    dose_time: Mapped[str] = mapped_column(String(5), nullable=False)
    dose_times: Mapped[list[str]] = mapped_column(JSON, nullable=False)


class DoseRecord(Base):
    __tablename__ = "doses"

    id: Mapped[str] = mapped_column(String(160), primary_key=True)
    patient_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    date: Mapped[str] = mapped_column(String(10), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    source: Mapped[str] = mapped_column(String(20), nullable=False)
    time: Mapped[str] = mapped_column(String(5), nullable=False)


class AlertRecord(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(160), primary_key=True)
    patient_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    kind: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str] = mapped_column(String(1000), nullable=False)
    created_at: Mapped[str] = mapped_column(String(40), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class TelemetryRecord(Base):
    __tablename__ = "telemetry"

    id: Mapped[str] = mapped_column(String(160), primary_key=True)
    box_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    patient_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    event: Mapped[str] = mapped_column(String(100), nullable=False)
    raw: Mapped[str] = mapped_column(String(2000), nullable=False)
    received_at: Mapped[str] = mapped_column(String(40), nullable=False)


class InterventionRecord(Base):
    __tablename__ = "interventions"

    id: Mapped[str] = mapped_column(String(160), primary_key=True)
    patient_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    hsa_id: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str] = mapped_column(String(4000), nullable=False)
    logged_at: Mapped[str] = mapped_column(String(10), nullable=False)
