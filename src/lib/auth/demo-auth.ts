import { User, UserRole } from "./auth-types";

export const USER_CREDENTIALS: Record<string, { user: User; passwordHash: string }> = {
  healthworker: {
    user: {
      id: "usr-hw-1",
      username: "healthworker",
      name: "HSA John Phiri",
      role: "health_worker",
      title: "TB Assistant / Health Surveillance Assistant",
      facility: "Zomba Central Hospital",
    },
    passwordHash: "moh123",
  },
  patient: {
    user: {
      id: "usr-pat-1",
      username: "patient",
      name: "Chifundo Banda",
      role: "patient",
      patientId: "pat-1",
      facility: "Zomba Central Hospital",
    },
    passwordHash: "moh123",
  },
  admin: {
    user: {
      id: "usr-adm-1",
      username: "admin",
      name: "Dr. Mary Chisale",
      role: "admin",
      title: "National TB Programme Administrator",
      facility: "Ministry of Health HQ, Lilongwe",
    },
    passwordHash: "moh123",
  },
};

export const PORTAL_CREDENTIALS_INFO = [
  {
    role: "patient" as UserRole,
    title: "Patient Portal",
    username: "patient",
    password: "moh123",
    description: "Track medication schedules, adherence records, and care team contacts",
  },
  {
    role: "health_worker" as UserRole,
    title: "Health Worker Portal",
    username: "healthworker",
    password: "moh123",
    description: "Manage patient cohorts, triage missed dose alerts, and log field visits",
  },
  {
    role: "admin" as UserRole,
    title: "Administrator Portal",
    username: "admin",
    password: "moh123",
    description: "Oversee system users, smart pill box hardware deployment, and telemetry logs",
  },
];
