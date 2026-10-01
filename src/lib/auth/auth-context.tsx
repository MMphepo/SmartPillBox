import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthSession, LoginCredentials, User } from "./auth-types";
import { USER_CREDENTIALS } from "./demo-auth";

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
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthSession;
        if (parsed && parsed.user && parsed.token) {
          setSession(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to restore session", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async ({ username, password, role }: LoginCredentials) => {
    const normalizedUsername = username.trim().toLowerCase();
    const entry = USER_CREDENTIALS[normalizedUsername];

    if (!entry) {
      return { success: false, error: "Invalid username or password." };
    }

    if (password && entry.passwordHash !== password) {
      return { success: false, error: "Invalid username or password." };
    }

    if (role && entry.user.role !== role) {
      return {
        success: false,
        error: `Account '${username}' is not authorized for the ${role} portal.`,
      };
    }

    const newSession: AuthSession = {
      user: entry.user,
      token: `auth-session-${entry.user.id}-${Date.now()}`,
    };

    setSession(newSession);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    } catch (e) {
      console.error("Failed to save session", e);
    }

    return { success: true, session: newSession };
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
