import { User, UserRole } from "./auth-types";

export const DEMO_USERS: Record<string, { user: User; passwordHash: string }> = {
  healthworker: {
    user: {
      id: "usr-hw-1",
      username: "healthworker",
      name: "HSA John Phiri",
      role: "health_worker",
      title: "TB Assistant / HSA",
      facility: "Zomba Central Hospital",
      district: "Zomba",
      zone: "Southern Zone",
    },
    passwordHash: "demo123",
  },
  patient: {
    user: {
      id: "usr-pat-1",
      username: "patient",
      name: "Chifundo Banda",
      role: "patient",
      patientId: "pat-1",
      facility: "Zomba Central Hospital",
      district: "Zomba",
      zone: "Southern Zone",
    },
    passwordHash: "demo123",
  },
  districtofficer: {
    user: {
      id: "usr-dto-1",
      username: "districtofficer",
      name: "Dr. Emmanuel Moyo",
      role: "district_officer",
      title: "District TB Officer",
      facility: "Lilongwe DHO",
      district: "Lilongwe",
      zone: "Central Zone",
    },
    passwordHash: "demo123",
  },
};

export const DEMO_CREDENTIALS_INFO = [
  {
    role: "health_worker" as UserRole,
    title: "Health Worker Portal",
    username: "healthworker",
    password: "demo123",
    description: "Manage cohort, triage missed doses & log field visits",
  },
  {
    role: "patient" as UserRole,
    title: "Patient Portal",
    username: "patient",
    password: "demo123",
    description: "View dose schedule, streak, 180-day regimen & request support",
  },
  {
    role: "district_officer" as UserRole,
    title: "District & Zone Portal",
    username: "districtofficer",
    password: "demo123",
    description: "Aggregated programme summary, facility comparisons & reports",
  },
];
