import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthSession, LoginCredentials, User } from "./auth-types";
import { getMeApi, loginApi } from "../tb-api";

const STORAGE_KEY = "malawi_tb_portal_session";

interface AuthContextType {
  session: AuthSession | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: LoginCredentials,
  ) => Promise<{ success: boolean; error?: string; session?: AuthSession }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuthSession;
          if (parsed && parsed.token) {
            // Validate token against Main Backend
            try {
              const user = await getMeApi(parsed.token);
              const restoredSession: AuthSession = { user, token: parsed.token };
              setSession(restoredSession);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(restoredSession));
            } catch (e) {
              console.warn("Session token expired or invalid, clearing session.");
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        }
      } catch (e) {
        console.error("Failed to restore session from localStorage", e);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async ({ username, password, role }: LoginCredentials) => {
    try {
      const res = await loginApi({ username, password, role });
      const newSession: AuthSession = {
        user: res.user,
        token: res.accessToken,
      };

      setSession(newSession);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      } catch (e) {
        console.error("Failed to save session", e);
      }

      return { success: true, session: newSession };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Invalid credentials or server unavailable.",
      };
    }
  };

  const logout = () => {
    setSession(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Failed to remove session", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
