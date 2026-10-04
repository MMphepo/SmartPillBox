export type UserRole = "health_worker" | "patient" | "district_officer";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  title?: string;
  facility?: string;
  district?: string;
  zone?: string;
  patientId?: string; // For patient role
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
