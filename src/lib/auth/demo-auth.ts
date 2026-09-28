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
    },
    passwordHash: "demo123",
  },
  patient: {
    user: {
      id: "usr-pat-1",
      username: "patient",
      name: "Chifundo Banda",
      role: "patient",
      patientId: "pat-1", // Fixed demo patient profile (Chifundo Banda)
      facility: "Zomba Central Hospital",
    },
    passwordHash: "demo123",
  },
  guardian: {
    user: {
      id: "usr-grd-1",
      username: "guardian",
      name: "Mary Banda",
      role: "guardian",
      patientId: "pat-1", // Linked relative: Chifundo Banda
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
    role: "guardian" as UserRole,
    title: "Guardian Portal",
    username: "guardian",
    password: "demo123",
    description: "Monitor relative's adherence & log assisted doses",
  },
];
