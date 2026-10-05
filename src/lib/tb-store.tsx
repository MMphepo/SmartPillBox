import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  buildInitialAlerts,
  buildInitialHistory,
  buildInitialInterventions,
  buildInitialTelemetry,
  guardians,
  healthWorkers,
  patients as initialPatients,
  toISODate,
  type AlertItem,
  type DoseEntry,
  type DoseSource,
  type DoseStatus,
  type Intervention,
  type Patient,
  type TelemetryLog,
} from "./tb-data";

import {
  bootstrap,
  createAlert,
  createIntervention,
  createPatient,
  getState,
  raisePatientRequestApi,
  saveDose,
  updateAlert,
  updatePatient,
} from "./tb-api";
import { useAuth } from "./auth/auth-context";

export type Role = "health-worker" | "patient" | "guardian";
export type Language = "en" | "ny";

export type SimEvent =
  "DOSE_TAKEN_ON_TIME" | "DOSE_TAKEN_LATE" | "MISSED_DOSE_ALERT" | "LOW_BATTERY_WARNING";

interface TBContextValue {
  today: string;
  patientList: Patient[];
  doses: DoseEntry[];
  alerts: AlertItem[];
  telemetry: TelemetryLog[];
  interventions: Intervention[];
  activePatientId: string;
  setActivePatientId: (id: string) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  discreetMode: boolean;
  setDiscreetMode: (v: boolean) => void;
  simulate: (patientId: string, event: SimEvent) => void;
  markAssistedDose: (patientId: string) => void;
  recordPatientDose: (patientId: string, date: string, time: string) => void;
  logIntervention: (input: Omit<Intervention, "id" | "loggedAt">) => void;
  resolveAlert: (id: string) => void;
  raisePatientRequest: (patientId: string, kind: "SUPPORT_REQUEST" | "BOX_ISSUE") => void;
  enrolPatient: (patient: Omit<Patient, "id">) => Patient;
  updateDoseSchedule: (
    patientId: string,
    schedule: {
      doseTime?: string;
      doseTimes?: string[];
      regimen?: string;
      phase?: Patient["phase"];
    },
  ) => void;
  patientDoses: (patientId: string) => DoseEntry[];
  adherenceRate: (patientId: string) => number;
  streak: (patientId: string) => number;
  patientById: (id: string) => Patient;
}

const TBContext = createContext<TBContextValue | null>(null);

let counter = 100;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

export function TBProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, session } = useAuth();
  const [now] = useState(() => new Date());
  const today = useMemo(() => toISODate(now), [now]);

  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [doses, setDoses] = useState<DoseEntry[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryLog[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [activePatientId, setActivePatientId] = useState("pat-1");
  const [language, setLanguage] = useState<Language>("en");
  const [discreetMode, setDiscreetMode] = useState(false);

  // Sync state with Main Backend
  useEffect(() => {
    async function syncBackendState() {
      try {
        let state = await getState();
        if (!state.patients || state.patients.length === 0) {
          // Bootstrap backend with initial dataset if backend is completely empty
          const seedData = {
            patients: initialPatients,
            doses: buildInitialHistory(now),
            alerts: buildInitialAlerts(now),
            telemetry: buildInitialTelemetry(now),
            interventions: buildInitialInterventions(now),
          };
          state = await bootstrap(seedData);
        }
        setPatientList(state.patients || []);
        setDoses(state.doses || []);
        setAlerts(state.alerts || []);
        setTelemetry(state.telemetry || []);
        setInterventions(state.interventions || []);
        if (state.patients && state.patients.length > 0) {
          if (session?.user?.role === "patient" && session.user.patient_id) {
            setActivePatientId(session.user.patient_id);
          } else if (!state.patients.some((p) => p.id === activePatientId)) {
            setActivePatientId(state.patients[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch state from Main Backend API:", err);
      }
    }

    if (isAuthenticated) {
      syncBackendState();
    }
  }, [isAuthenticated, session?.user?.role, session?.user?.patient_id]);

  const upsertDose = useCallback(
    (patientId: string, date: string, status: DoseStatus, source: DoseSource, time: string) => {
      const entry: DoseEntry = {
        id: `${patientId}-${date}`,
        patientId,
        date,
        status,
        source,
        time,
      };
      setDoses((prev) => {
        const idx = prev.findIndex((d) => d.patientId === patientId && d.date === date);
        if (idx === -1) return [...prev, entry];
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      });
      // Persist to backend
      saveDose(entry).catch((err) => console.error("Failed to persist dose to backend:", err));
    },
    [],
  );

  const recordPatientDose = useCallback(
    (patientId: string, date: string, time: string) => {
      upsertDose(patientId, date, "taken", "smartbox", time);
    },
    [upsertDose],
  );

  const enrolPatient = useCallback((newPatientInput: Omit<Patient, "id">): Patient => {
    const id = nextId("pat");
    const created: Patient = { ...newPatientInput, id };
    setPatientList((prev) => [created, ...prev]);
    // Persist to backend
    createPatient(created).catch((err) =>
      console.error("Failed to persist created patient to backend:", err),
    );
    return created;
  }, []);

  const updateDoseSchedule = useCallback(
    (
      patientId: string,
      schedule: {
        doseTime?: string;
        doseTimes?: string[];
        regimen?: string;
        phase?: Patient["phase"];
      },
    ) => {
      setPatientList((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;
          const newDoseTimes =
            schedule.doseTimes || (schedule.doseTime ? [schedule.doseTime] : p.doseTimes);
          const primaryDoseTime = newDoseTimes[0] || p.doseTime;
          return {
            ...p,
            ...schedule,
            doseTimes: newDoseTimes,
            doseTime: primaryDoseTime,
          };
        }),
      );
      // Persist to backend
      updatePatient(patientId, schedule).catch((err) =>
        console.error("Failed to persist patient schedule to backend:", err),
      );
    },
    [],
  );

  const simulate = useCallback(
    (patientId: string, event: SimEvent) => {
      const patient = patientList.find((p) => p.id === patientId)!;
      if (!patient) return;
      const stamp = new Date();
      const clock = `${String(stamp.getHours()).padStart(2, "0")}:${String(stamp.getMinutes()).padStart(2, "0")}`;
      const date = toISODate(stamp);

      const telItem: TelemetryLog = {
        id: nextId("tel"),
        boxId: patient.boxId,
        patientId,
        event,
        raw: `SB|${patient.boxId}|EVT:${event}|T:${clock}|BAT:${patient.battery}|SIG:4`,
        receivedAt: stamp.toISOString(),
      };

      setTelemetry((prev) => [telItem, ...prev]);

      if (event === "DOSE_TAKEN_ON_TIME") upsertDose(patientId, date, "taken", "smartbox", clock);
      if (event === "DOSE_TAKEN_LATE") upsertDose(patientId, date, "late", "smartbox", clock);
      if (event === "MISSED_DOSE_ALERT") upsertDose(patientId, date, "missed", "none", "--:--");

      if (
        event === "MISSED_DOSE_ALERT" ||
        event === "LOW_BATTERY_WARNING" ||
        event === "DOSE_TAKEN_LATE"
      ) {
        const alertItem: AlertItem = {
          id: nextId("alert"),
          patientId,
          kind: event,
          message:
            event === "MISSED_DOSE_ALERT"
              ? `No dose opening detected by ${patient.boxId} in the scheduled window.`
              : event === "LOW_BATTERY_WARNING"
                ? `${patient.boxId} reported a low battery. Schedule a swap.`
                : `Dose logged late at ${clock} (scheduled ${patient.doseTime}).`,
          createdAt: stamp.toISOString(),
          severity:
            event === "MISSED_DOSE_ALERT"
              ? "high"
              : event === "LOW_BATTERY_WARNING"
                ? "medium"
                : "low",
          resolved: false,
        };
        setAlerts((prev) => [alertItem, ...prev]);
        createAlert(alertItem).catch((err) =>
          console.error("Failed to persist alert to backend:", err),
        );
      }
    },
    [patientList, upsertDose],
  );

  const markAssistedDose = useCallback(
    (patientId: string) => {
      const stamp = new Date();
      const clock = `${String(stamp.getHours()).padStart(2, "0")}:${String(stamp.getMinutes()).padStart(2, "0")}`;
      upsertDose(patientId, toISODate(stamp), "taken", "guardian", clock);
      setAlerts((prev) =>
        prev.map((a) => {
          if (a.patientId === patientId && a.kind === "MISSED_DOSE_ALERT" && !a.resolved) {
            updateAlert(a.id, true).catch(() => {});
            return { ...a, resolved: true };
          }
          return a;
        }),
      );
    },
    [upsertDose],
  );

  const logIntervention = useCallback((input: Omit<Intervention, "id" | "loggedAt">) => {
    const item: Intervention = {
      ...input,
      id: nextId("int"),
      loggedAt: toISODate(new Date()),
    };
    setInterventions((prev) => [item, ...prev]);
    createIntervention(item).catch((err) =>
      console.error("Failed to persist intervention to backend:", err),
    );
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
    updateAlert(id, true).catch((err) =>
      console.error("Failed to resolve alert on backend:", err),
    );
  }, []);

  const raisePatientRequest = useCallback(
    (patientId: string, kind: "SUPPORT_REQUEST" | "BOX_ISSUE") => {
      const patient = patientList.find((p) => p.id === patientId)!;
      const alertItem: AlertItem = {
        id: nextId("alert"),
        patientId,
        kind,
        message:
          kind === "SUPPORT_REQUEST"
            ? `${patient?.name || "Patient"} requested a visit or call from their HSA.`
            : `${patient?.name || "Patient"} reported a fault with ${patient?.boxId || "smartbox"}.`,
        createdAt: new Date().toISOString(),
        severity: kind === "SUPPORT_REQUEST" ? "medium" : "high",
        resolved: false,
      };
      setAlerts((prev) => [alertItem, ...prev]);
      raisePatientRequestApi(patientId, kind).catch((err) =>
        console.error("Failed to raise patient request on backend:", err),
      );
    },
    [patientList],
  );

  const patientDoses = useCallback(
    (patientId: string) =>
      doses.filter((d) => d.patientId === patientId).sort((a, b) => a.date.localeCompare(b.date)),
    [doses],
  );

  const adherenceRate = useCallback(
    (patientId: string) => {
      const list = doses.filter((d) => d.patientId === patientId);
      if (!list.length) return 0;
      const good = list.filter((d) => d.status !== "missed").length;
      return Math.round((good / list.length) * 100);
    },
    [doses],
  );

  const streak = useCallback(
    (patientId: string) => {
      const list = patientDoses(patientId);
      let count = 0;
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].status === "missed") break;
        count++;
      }
      return count;
    },
    [patientDoses],
  );

  const patientById = useCallback(
    (id: string) =>
      patientList.find((p) => p.id === id) ||
      patientList[0] || {
        id: "pat-1",
        name: "Loading...",
        age: 0,
        sex: "F",
        facility: "",
        phase: "Intensive",
        treatmentDay: 1,
        boxId: "",
        battery: 100,
        guardianId: "",
        hsaId: "",
        phone: "",
        regimen: "",
        doseTime: "08:00",
        doseTimes: ["08:00"],
      },
    [patientList],
  );

  const value: TBContextValue = {
    today,
    patientList,
    doses,
    alerts,
    telemetry,
    interventions,
    activePatientId,
    setActivePatientId,
    language,
    setLanguage,
    discreetMode,
    setDiscreetMode,
    simulate,
    markAssistedDose,
    recordPatientDose,
    logIntervention,
    resolveAlert,
    raisePatientRequest,
    enrolPatient,
    updateDoseSchedule,
    patientDoses,
    adherenceRate,
    streak,
    patientById,
  };

  return <TBContext.Provider value={value}>{children}</TBContext.Provider>;
}

export function useTB() {
  const ctx = useContext(TBContext);
  if (!ctx) throw new Error("useTB must be used inside TBProvider");
  return ctx;
}

export function guardianForPatient(patientId: string) {
  return guardians.find((g) => g.patientId === patientId) || guardians[0];
}

export function hsaForPatient(patientId: string) {
  return healthWorkers[0];
}
