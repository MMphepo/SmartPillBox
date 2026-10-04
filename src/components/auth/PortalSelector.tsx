import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/lib/auth/auth-types";

const PORTALS = [
  {
    role: "health_worker" as UserRole,
    loginPath: "/login/health-worker",
    appPath: "/health-worker/dashboard",
    title: "Health Worker Portal",
    subtitle: "Clinicians and Health Surveillance Assistants",
    description:
      "Access patient cohort monitoring, triage alerts, telemetry logs, and field interventions.",
  },
  {
    role: "patient" as UserRole,
    loginPath: "/login/patient",
    appPath: "/patient/dashboard",
    title: "Patient Portal",
    subtitle: "Patients Enrolled in TB Treatment",
    description:
      "View scheduled medication windows, daily adherence records, and treatment regimen progress.",
  },
];

export function PortalSelector() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-6 sm:py-12">
      {/* Institutional Header Block */}
      <div className="border-b border-border pb-6 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ministry of Health · Republic of Malawi
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
          Digital TB Adherence System
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
          Operational information portal for anti-tuberculosis regimen monitoring and treatment
          adherence management. Select your system portal to continue.
        </p>
      </div>

      {/* Role Module Sections */}
      <div className="space-y-4">
        {PORTALS.map((portal) => {
          const isCurrentRoleLoggedIn = isAuthenticated && user?.role === portal.role;
          const targetPath = isCurrentRoleLoggedIn ? portal.appPath : portal.loginPath;

          return (
            <div
              key={portal.role}
              className="border border-border bg-card p-5 sm:p-6 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 max-w-lg">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-bold text-foreground">
                    {portal.title}
                  </h2>
                  {isCurrentRoleLoggedIn && (
                    <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground border border-border">
                      <Check className="h-3 w-3 text-primary" /> Active Session
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-foreground/80">{portal.subtitle}</p>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  {portal.description}
                </p>
              </div>

              <div className="shrink-0 pt-2 sm:pt-0">
                <Link
                  to={targetPath}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors w-full sm:w-auto"
                >
                  <span>{isCurrentRoleLoggedIn ? "Open Workspace" : "Sign In"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
