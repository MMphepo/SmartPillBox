from pydantic import BaseModel, ConfigDict, Field


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class UserRegister(ApiModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=100)
    name: str = Field(min_length=1, max_length=200)
    role: str = Field(default="patient")
    facility: str | None = None
    district: str | None = None
    zone: str | None = None
    patient_id: str | None = None


class UserLogin(ApiModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)
    role: str | None = None


class UserResponse(ApiModel):
    id: str
    username: str
    name: str
    role: str
    facility: str | None = None
    district: str | None = None
    zone: str | None = None
    patient_id: str | None = None


class TokenResponse(ApiModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PatientData(ApiModel):
    id: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=200)
    age: int = Field(ge=0, le=130)
    sex: str = Field(min_length=1, max_length=20)
    facility: str = Field(min_length=1, max_length=200)
    phase: str = Field(min_length=1, max_length=30)
    treatment_day: int = Field(ge=0)
    box_id: str = Field(min_length=1, max_length=100)
    battery: int = Field(ge=0, le=100)
    guardian_id: str = Field(min_length=1, max_length=100)
    hsa_id: str = Field(min_length=1, max_length=100)
    phone: str = Field(max_length=50)
    regimen: str = Field(min_length=1, max_length=200)
    dose_time: str = Field(min_length=5, max_length=5)
    dose_times: list[str] = Field(min_length=1)


class DoseData(ApiModel):
    id: str = Field(min_length=1, max_length=160)
    patient_id: str = Field(min_length=1, max_length=100)
    date: str = Field(min_length=10, max_length=10)
    status: str = Field(min_length=1, max_length=20)
    source: str = Field(min_length=1, max_length=20)
    time: str = Field(min_length=1, max_length=5)


class AlertData(ApiModel):
    id: str = Field(min_length=1, max_length=160)
    patient_id: str = Field(min_length=1, max_length=100)
    kind: str = Field(min_length=1, max_length=50)
    message: str = Field(min_length=1, max_length=1000)
    created_at: str = Field(min_length=1, max_length=40)
    severity: str = Field(min_length=1, max_length=20)
    resolved: bool = False


class TelemetryData(ApiModel):
    id: str = Field(min_length=1, max_length=160)
    box_id: str = Field(min_length=1, max_length=100)
    patient_id: str = Field(min_length=1, max_length=100)
    event: str = Field(min_length=1, max_length=100)
    raw: str = Field(min_length=1, max_length=2000)
    received_at: str = Field(min_length=1, max_length=40)


class InterventionData(ApiModel):
    id: str = Field(min_length=1, max_length=160)
    patient_id: str = Field(min_length=1, max_length=100)
    hsa_id: str = Field(min_length=1, max_length=100)
    type: str = Field(min_length=1, max_length=50)
    notes: str = Field(max_length=4000)
    logged_at: str = Field(min_length=1, max_length=10)


class BootstrapData(ApiModel):
    patients: list[PatientData] = Field(default_factory=list)
    doses: list[DoseData] = Field(default_factory=list)
    alerts: list[AlertData] = Field(default_factory=list)
    telemetry: list[TelemetryData] = Field(default_factory=list)
    interventions: list[InterventionData] = Field(default_factory=list)


class DoseScheduleUpdate(ApiModel):
    dose_time: str | None = Field(default=None, min_length=5, max_length=5)
    dose_times: list[str] | None = Field(default=None, min_length=1)
    regimen: str | None = Field(default=None, min_length=1, max_length=200)
    phase: str | None = Field(default=None, min_length=1, max_length=30)


class AlertResolution(ApiModel):
    resolved: bool


class DeviceEvent(ApiModel):
    telemetry: TelemetryData
    dose: DoseData | None = None
    alert: AlertData | None = None


class StateResponse(ApiModel):
    patients: list[PatientData]
    doses: list[DoseData]
    alerts: list[AlertData]
    telemetry: list[TelemetryData]
    interventions: list[InterventionData]
