import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/lib/auth/auth-types";

interface AuthGuardProps {
  allowedRole: UserRole;
  children: ReactNode;
}

export function AuthGuard({ allowedRole, children }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        navigate({
          to: "/login/$role",
          params: { role: allowedRole },
          replace: true,
        });
      } else if (user.role !== allowedRole) {
        navigate({
          to: "/login/$role",
          params: { role: allowedRole },
          replace: true,
        });
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRole, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground font-medium">Verifying authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
