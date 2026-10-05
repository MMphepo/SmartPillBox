import type {
  AlertItem,
  DoseEntry,
  Intervention,
  Patient,
  TelemetryLog,
} from "./tb-data";

export interface TBState {
  patients: Patient[];
  doses: DoseEntry[];
  alerts: AlertItem[];
  telemetry: TelemetryLog[];
  interventions: Intervention[];
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api").replace(
  /\/$/,
  "",
);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // Keep the HTTP status as the useful error when the response is not JSON.
    }
    throw new Error(detail);
  }
  return (await response.json()) as T;
}

export function bootstrap(state: TBState): Promise<TBState> {
  return request<TBState>("/bootstrap", {
    method: "POST",
    body: JSON.stringify(state),
  });
}

export function createPatient(patient: Patient): Promise<Patient> {
  return request<Patient>("/patients", {
    method: "POST",
    body: JSON.stringify(patient),
  });
}

export function updatePatient(
  patientId: string,
  schedule: {
    doseTime?: string;
    doseTimes?: string[];
    regimen?: string;
    phase?: Patient["phase"];
  },
): Promise<Patient> {
  return request<Patient>(`/patients/${encodeURIComponent(patientId)}`, {
    method: "PATCH",
    body: JSON.stringify(schedule),
  });
}

export function saveDose(dose: DoseEntry): Promise<DoseEntry> {
  return request<DoseEntry>(
    `/doses/${encodeURIComponent(dose.patientId)}/${encodeURIComponent(dose.date)}`,
    { method: "PUT", body: JSON.stringify(dose) },
  );
}

export function saveDeviceEvent(event: {
  telemetry: TelemetryLog;
  dose?: DoseEntry;
  alert?: AlertItem;
}): Promise<{ status: string }> {
  return request<{ status: string }>("/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

export function createAlert(alert: AlertItem): Promise<AlertItem> {
  return request<AlertItem>("/alerts", {
    method: "POST",
    body: JSON.stringify(alert),
  });
}

export function updateAlert(alertId: string, resolved: boolean): Promise<AlertItem> {
  return request<AlertItem>(`/alerts/${encodeURIComponent(alertId)}`, {
    method: "PATCH",
    body: JSON.stringify({ resolved }),
  });
}

export function createIntervention(intervention: Intervention): Promise<Intervention> {
  return request<Intervention>("/interventions", {
    method: "POST",
    body: JSON.stringify(intervention),
  });
}
