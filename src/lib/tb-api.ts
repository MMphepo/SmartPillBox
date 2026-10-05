import type {
  AlertItem,
  DoseEntry,
  Intervention,
  Patient,
  TelemetryLog,
} from "./tb-data";
import type { AuthSession, LoginCredentials, User } from "./auth/auth-types";

export interface TBState {
  patients: Patient[];
  doses: DoseEntry[];
  alerts: AlertItem[];
  telemetry: TelemetryLog[];
  interventions: Intervention[];
}

const STORAGE_KEY = "malawi_tb_portal_session";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api").replace(
  /\/$/,
  "",
);

function getStoredToken(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as AuthSession;
      return parsed?.token ?? null;
    }
  } catch {
    // Ignore parse error
  }
  return null;
}

async function request<T>(path: string, init?: RequestInit, tokenOverride?: string): Promise<T> {
  const token = tokenOverride ?? getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // Keep HTTP status
    }
    throw new Error(detail);
  }
  return (await response.json()) as T;
}

export async function loginApi(credentials: LoginCredentials): Promise<{
  accessToken: string;
  tokenType: string;
  user: User;
}> {
  const res = await request<{
    accessToken: string;
    tokenType: string;
    user: User;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return res;
}

export async function registerApi(data: {
  username: string;
  password: string;
  name: string;
  role: string;
  facility?: string;
  district?: string;
  zone?: string;
}): Promise<{
  accessToken: string;
  tokenType: string;
  user: User;
}> {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMeApi(token: string): Promise<User> {
  return request<User>("/auth/me", { method: "GET" }, token);
}

export function getState(): Promise<TBState> {
  return request<TBState>("/state", { method: "GET" });
}

export function bootstrap(state: TBState): Promise<TBState> {
  return request<TBState>("/bootstrap", {
    method: "POST",
    body: JSON.stringify(state),
  });
}

export function fetchPatients(): Promise<Patient[]> {
  return request<Patient[]>("/patients", { method: "GET" });
}

export function fetchPatient(patientId: string): Promise<Patient> {
  return request<Patient>(`/patients/${encodeURIComponent(patientId)}`, { method: "GET" });
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

export function fetchAlerts(patientId?: string): Promise<AlertItem[]> {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : "";
  return request<AlertItem[]>(`/alerts${query}`, { method: "GET" });
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

export function fetchDeviceEvents(deviceId: string): Promise<any> {
  return request(`/devices/${encodeURIComponent(deviceId)}/events`, { method: "GET" });
}

export function raisePatientRequestApi(patientId: string, kind: "SUPPORT_REQUEST" | "BOX_ISSUE"): Promise<AlertItem> {
  return request<AlertItem>("/patients/me/requests", {
    method: "POST",
    body: JSON.stringify({ patientId, kind }),
  });
}

export function fetchDistrictDashboard(): Promise<any> {
  return request("/district/dashboard", { method: "GET" });
}
