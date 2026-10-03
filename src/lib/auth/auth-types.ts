export type UserRole = "health_worker" | "patient";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  title?: string;
  facility?: string;
  patientId?: string; // For patient role, bound to specific demo patient
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface LoginCredentials {
  username: string;
  password?: string;
  role?: UserRole;
}
