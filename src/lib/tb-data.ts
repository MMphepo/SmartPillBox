export type Facility = "Zomba Central Hospital" | "Bwaila Hospital" | "Machinga Clinic";
export type Phase = "Intensive" | "Continuation";

export type DoseSource = "smartbox" | "guardian" | "hsa" | "none";
export type DoseStatus = "taken" | "late" | "missed";

export interface DoseEntry {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  status: DoseStatus;
  source: DoseSource;
  time: string; // HH:MM
}

export interface HealthWorker {
  id: string;
  name: string;
  role: string;
  facility: Facility;
  phone: string;
}

export interface Guardian {
  id: string;
  name: string;
  relation: string;
  phone: string;
  patientId: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: "Male" | "Female";
  facility: Facility;
  phase: Phase;
  treatmentDay: number;
  boxId: string;
  battery: number;
  guardianId: string;
  hsaId: string;
  phone: string;
  regimen: string;
  doseTime: string;
}

export interface AlertItem {
  id: string;
  patientId: string;
  kind: "MISSED_DOSE_ALERT" | "LOW_BATTERY_WARNING" | "DOSE_TAKEN_LATE" | "SUPPORT_REQUEST" | "BOX_ISSUE";
  message: string;
  createdAt: string;
  severity: "high" | "medium" | "low";
  resolved: boolean;
}

export interface TelemetryLog {
  id: string;
  boxId: string;
  patientId: string;
  event: string;
  raw: string;
  receivedAt: string;
}

export interface Intervention {
  id: string;
  patientId: string;
  hsaId: string;
  type: "Home visit" | "Phone check-in" | "Pill resupply" | "Counselling";
  notes: string;
  loggedAt: string;
}

export const healthWorkers: HealthWorker[] = [
  {
    id: "hsa-1",
    name: "HSA John Phiri",
    role: "TB Assistant / HSA",
    facility: "Zomba Central Hospital",
    phone: "+265 991 204 118",
  },
  {
    id: "hsa-2",
    name: "HSA Sarah Chisale",
    role: "TB Assistant / HSA",
    facility: "Bwaila Hospital",
    phone: "+265 888 663 042",
  },
  {
    id: "hsa-3",
    name: "HSA Grace Mwale",
    role: "Community HSA",
    facility: "Machinga Clinic",
    phone: "+265 999 771 530",
  },
];

export const patients: Patient[] = [
  {
    id: "pat-1",
    name: "Chifundo Banda",
    age: 34,
    sex: "Male",
    facility: "Zomba Central Hospital",
    phase: "Continuation",
    treatmentDay: 96,
    boxId: "BOX-ZOMBA-042",
    battery: 78,
    guardianId: "grd-1",
    hsaId: "hsa-1",
    phone: "+265 992 118 774",
    regimen: "2HRZE / 4HR",
    doseTime: "08:00",
  },
  {
    id: "pat-2",
    name: "Kondwani Phiri",
    age: 27,
    sex: "Male",
    facility: "Bwaila Hospital",
    phase: "Intensive",
    treatmentDay: 21,
    boxId: "BOX-BWAILA-017",
    battery: 22,
    guardianId: "grd-2",
    hsaId: "hsa-2",
    phone: "+265 884 220 619",
    regimen: "2HRZE / 4HR",
    doseTime: "07:30",
  },
  {
    id: "pat-3",
    name: "Tadala Nkhoma",
    age: 41,
    sex: "Female",
    facility: "Machinga Clinic",
    phase: "Intensive",
    treatmentDay: 38,
    boxId: "BOX-MACHINGA-009",
    battery: 54,
    guardianId: "grd-3",
    hsaId: "hsa-3",
    phone: "+265 997 402 331",
    regimen: "2HRZE / 4HR",
    doseTime: "08:30",
  },
  {
    id: "pat-4",
    name: "Limbani Gondwe",
    age: 52,
    sex: "Male",
    facility: "Zomba Central Hospital",
    phase: "Continuation",
    treatmentDay: 142,
    boxId: "BOX-ZOMBA-088",
    battery: 91,
    guardianId: "grd-4",
    hsaId: "hsa-1",
    phone: "+265 991 883 267",
    regimen: "2HRZE / 4HR",
    doseTime: "09:00",
  },
];

export const guardians: Guardian[] = [
  { id: "grd-1", name: "Mary Banda", relation: "Mother", phone: "+265 991 662 004", patientId: "pat-1" },
  { id: "grd-2", name: "Blessings Phiri", relation: "Brother", phone: "+265 886 117 290", patientId: "pat-2" },
  { id: "grd-3", name: "Eliza Nkhoma", relation: "Sister", phone: "+265 998 330 145", patientId: "pat-3" },
  { id: "grd-4", name: "Patrick Gondwe", relation: "Son", phone: "+265 993 550 812", patientId: "pat-4" },
];

/** Deterministic PRNG so server and client render identical demo history. */
function mulberry32(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/** Per-patient adherence profile for the seeded 30-day history. */
const adherenceProfile: Record<string, { missRate: number; lateRate: number; seed: number }> = {
  "pat-1": { missRate: 0.03, lateRate: 0.1, seed: 11 },
  "pat-2": { missRate: 0.27, lateRate: 0.17, seed: 23 },
  "pat-3": { missRate: 0.14, lateRate: 0.14, seed: 37 },
  "pat-4": { missRate: 0.05, lateRate: 0.07, seed: 59 },
};

export function buildInitialHistory(today: Date): DoseEntry[] {
  const entries: DoseEntry[] = [];
  for (const patient of patients) {
    const profile = adherenceProfile[patient.id];
    const rand = mulberry32(profile.seed);
    for (let i = 29; i >= 1; i--) {
      const date = toISODate(addDays(today, -i));
      const roll = rand();
      let status: DoseStatus = "taken";
      let source: DoseSource = "smartbox";
      if (roll < profile.missRate) {
        status = "missed";
        source = "none";
      } else if (roll < profile.missRate + profile.lateRate) {
        status = "late";
        source = rand() > 0.55 ? "guardian" : "smartbox";
      } else if (rand() < 0.12) {
        source = "hsa";
      } else if (rand() < 0.18) {
        source = "guardian";
      }
      const hour = Number(patient.doseTime.slice(0, 2)) + (status === "late" ? 5 : 0);
      entries.push({
        id: `${patient.id}-${date}`,
        patientId: patient.id,
        date,
        status,
        source,
        time: status === "missed" ? "--:--" : `${String(hour).padStart(2, "0")}:${patient.doseTime.slice(3)}`,
      });
    }
  }
  return entries;
}

export function buildInitialAlerts(today: Date): AlertItem[] {
  const stamp = (h: number, m: number) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: "alert-1",
      patientId: "pat-2",
      kind: "MISSED_DOSE_ALERT",
      message: "No dose opening detected by BOX-BWAILA-017 within the 3-hour window.",
      createdAt: stamp(10, 42),
      severity: "high",
      resolved: false,
    },
    {
      id: "alert-2",
      patientId: "pat-2",
      kind: "LOW_BATTERY_WARNING",
      message: "Smart box battery at 22% — schedule a battery swap on the next home visit.",
      createdAt: stamp(6, 15),
      severity: "medium",
      resolved: false,
    },
    {
      id: "alert-3",
      patientId: "pat-3",
      kind: "DOSE_TAKEN_LATE",
      message: "Dose logged 4h 20m after the scheduled 08:30 window.",
      createdAt: stamp(12, 50),
      severity: "low",
      resolved: false,
    },
  ];
}

export function buildInitialTelemetry(today: Date): TelemetryLog[] {
  const stamp = (h: number, m: number) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: "tel-1",
      boxId: "BOX-ZOMBA-042",
      patientId: "pat-1",
      event: "DOSE_TAKEN_ON_TIME",
      raw: "SB|BOX-ZOMBA-042|EVT:OPEN|T:08:03|BAT:78|SIG:4",
      receivedAt: stamp(8, 3),
    },
    {
      id: "tel-2",
      boxId: "BOX-BWAILA-017",
      patientId: "pat-2",
      event: "MISSED_DOSE_ALERT",
      raw: "SB|BOX-BWAILA-017|EVT:NO_OPEN|WIN:07:30-10:30|BAT:22|SIG:2",
      receivedAt: stamp(10, 42),
    },
    {
      id: "tel-3",
      boxId: "BOX-MACHINGA-009",
      patientId: "pat-3",
      event: "DOSE_TAKEN_LATE",
      raw: "SB|BOX-MACHINGA-009|EVT:OPEN|T:12:50|BAT:54|SIG:3",
      receivedAt: stamp(12, 50),
    },
  ];
}

export function buildInitialInterventions(today: Date): Intervention[] {
  return [
    {
      id: "int-1",
      patientId: "pat-2",
      hsaId: "hsa-2",
      type: "Home visit",
      notes: "Patient travelled to Lilongwe market. Counselled on carrying the box during travel.",
      loggedAt: toISODate(addDays(today, -4)),
    },
    {
      id: "int-2",
      patientId: "pat-1",
      hsaId: "hsa-1",
      type: "Pill resupply",
      notes: "Refilled 30-day continuation phase supply. Box battery healthy.",
      loggedAt: toISODate(addDays(today, -9)),
    },
  ];
}

export const facilities: Facility[] = [
  "Zomba Central Hospital",
  "Bwaila Hospital",
  "Machinga Clinic",
];

export const PHASE_BOUNDARY_DAY = 60;
export const REGIMEN_DAYS = 180;
