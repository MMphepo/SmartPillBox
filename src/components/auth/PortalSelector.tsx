import { Link } from "@tanstack/react-router";
import { Building2, Stethoscope, User, ArrowRight, Activity, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/lib/auth/auth-types";

const PORTALS = [
  {
    role: "health_worker" as UserRole,
    loginPath: "/login/health-worker",
    appPath: "/health-worker/dashboard",
    icon: Stethoscope,
    title: "Health Worker Portal",
    subtitle: "Clinicians & Health Surveillance Assistants",
    accentColor: "border-primary/30 hover:border-primary",
    badgeBg: "bg-primary/10 text-primary border-primary/20",
  },
  {
    role: "patient" as UserRole,
    loginPath: "/login/patient",
    appPath: "/patient/dashboard",
    icon: User,
    title: "Patient Portal",
    subtitle: "Patients Enrolled in Anti-TB Regimen",
    accentColor: "border-emerald-500/30 hover:border-emerald-500",
    badgeBg:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
  },
];

export function PortalSelector() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6 sm:py-12">
      {/* Official Government Banner Header */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xs relative overflow-hidden text-center sm:text-left">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-2xs">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Government of Malawi · Ministry of Health
              </p>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-0.5">
                Digital TB Adherence System
              </h1>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shrink-0 self-center sm:self-auto">
            <Activity className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>Smart Pill Box Network Active</span>
          </div>
        </div>
      </section>

      {/* Role Module Cards Section */}
      <section className="space-y-4">
        <div className="grid gap-6 sm:grid-cols-2">
          {PORTALS.map((portal) => {
            const isCurrentRoleLoggedIn = isAuthenticated && user?.role === portal.role;
            const targetPath = isCurrentRoleLoggedIn ? portal.appPath : portal.loginPath;
            const Icon = portal.icon;

            return (
              <div
                key={portal.role}
                className={`flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-2xs transition-all ${portal.accentColor}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-xl border ${portal.badgeBg}`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    {isCurrentRoleLoggedIn && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active Session
                      </span>
                    )}
                  </div>

                  <h2 className="mt-5 font-display text-lg font-bold text-foreground">
                    {portal.title}
                  </h2>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">
                    {portal.subtitle}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border">
                  <Link
                    to={targetPath}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-2xs hover:bg-primary/90 transition-colors"
                  >
                    <span>{isCurrentRoleLoggedIn ? "Open Dashboard" : "Sign In"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
