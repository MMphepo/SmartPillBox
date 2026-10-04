import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

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
    schedule: { doseTime: string; regimen?: string; phase?: Patient["phase"] },
  ) => void;
  patientDoses: (patientId: string) => DoseEntry[];
  adherenceRate: (patientId: string) => number;
  streak: (patientId: string) => number;
  patientById: (id: string) => Patient;
}

const TBContext = createContext<TBContextValue | null>(null);

let counter = 10;
const nextId = (prefix: string) => `${prefix}-${++counter}`;

export function TBProvider({ children }: { children: ReactNode }) {
  const [now] = useState(() => new Date());
  const today = useMemo(() => toISODate(now), [now]);

  const [patientList, setPatientList] = useState<Patient[]>(initialPatients);
  const [doses, setDoses] = useState<DoseEntry[]>(() => buildInitialHistory(now));
  const [alerts, setAlerts] = useState<AlertItem[]>(() => buildInitialAlerts(now));
  const [telemetry, setTelemetry] = useState<TelemetryLog[]>(() => buildInitialTelemetry(now));
  const [interventions, setInterventions] = useState<Intervention[]>(() =>
    buildInitialInterventions(now),
  );
  const [activePatientId, setActivePatientId] = useState("pat-1");
  const [language, setLanguage] = useState<Language>("en");
  const [discreetMode, setDiscreetMode] = useState(false);

  const upsertDose = useCallback(
    (patientId: string, date: string, status: DoseStatus, source: DoseSource, time: string) => {
      setDoses((prev) => {
        const idx = prev.findIndex((d) => d.patientId === patientId && d.date === date);
        const entry: DoseEntry = {
          id: `${patientId}-${date}`,
          patientId,
          date,
          status,
          source,
          time,
        };
        if (idx === -1) return [...prev, entry];
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      });
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
    return created;
  }, []);

  const updateDoseSchedule = useCallback(
    (
      patientId: string,
      schedule: { doseTime: string; regimen?: string; phase?: Patient["phase"] },
    ) => {
      setPatientList((prev) => prev.map((p) => (p.id === patientId ? { ...p, ...schedule } : p)));
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

      setTelemetry((prev) => [
        {
          id: nextId("tel"),
          boxId: patient.boxId,
          patientId,
          event,
          raw: `SB|${patient.boxId}|EVT:${event}|T:${clock}|BAT:${patient.battery}|SIG:4`,
          receivedAt: stamp.toISOString(),
        },
        ...prev,
      ]);

      if (event === "DOSE_TAKEN_ON_TIME") upsertDose(patientId, date, "taken", "smartbox", clock);
      if (event === "DOSE_TAKEN_LATE") upsertDose(patientId, date, "late", "smartbox", clock);
      if (event === "MISSED_DOSE_ALERT") upsertDose(patientId, date, "missed", "none", "--:--");

      if (
        event === "MISSED_DOSE_ALERT" ||
        event === "LOW_BATTERY_WARNING" ||
        event === "DOSE_TAKEN_LATE"
      ) {
        setAlerts((prev) => [
          {
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
          },
          ...prev,
        ]);
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
        prev.map((a) =>
          a.patientId === patientId && a.kind === "MISSED_DOSE_ALERT" && !a.resolved
            ? { ...a, resolved: true }
            : a,
        ),
      );
    },
    [upsertDose],
  );

  const logIntervention = useCallback((input: Omit<Intervention, "id" | "loggedAt">) => {
    setInterventions((prev) => [
      { ...input, id: nextId("int"), loggedAt: toISODate(new Date()) },
      ...prev,
    ]);
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  }, []);

  const raisePatientRequest = useCallback(
    (patientId: string, kind: "SUPPORT_REQUEST" | "BOX_ISSUE") => {
      const patient = patientList.find((p) => p.id === patientId)!;
      if (!patient) return;
      setAlerts((prev) => [
        {
          id: nextId("alert"),
          patientId,
          kind,
          message:
            kind === "SUPPORT_REQUEST"
              ? `${patient.name} requested a visit or call from their HSA.`
              : `${patient.name} reported a fault with ${patient.boxId}.`,
          createdAt: new Date().toISOString(),
          severity: kind === "SUPPORT_REQUEST" ? "medium" : "high",
          resolved: false,
        },
        ...prev,
      ]);
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
    (id: string) => patientList.find((p) => p.id === id) || patientList[0],
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
  return guardians.find((g) => g.patientId === patientId)!;
}

export function hsaForPatient(patientId: string) {
  return healthWorkers[0];
}
