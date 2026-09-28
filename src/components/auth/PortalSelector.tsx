import { Link } from "@tanstack/react-router";
import { ShieldCheck, Stethoscope, User, ArrowRight, Activity, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/lib/auth/auth-types";

const PORTALS = [
  {
    role: "health_worker" as UserRole,
    loginPath: "/login/health-worker",
    appPath: "/health-worker/dashboard",
    icon: Stethoscope,
    title: "Health Worker Portal",
    subtitle: "Health Surveillance Assistants & Clinicians",
    description:
      "Manage patient cohorts, triage missed-dose alerts, monitor SMS telemetry, and log field interventions.",
    features: [
      "Cohort Dashboard & Alert Triage",
      "Smart Pill Box Telemetry Log",
      "Field Visit & Contact Tracker",
    ],
  },
  {
    role: "patient" as UserRole,
    loginPath: "/login/patient",
    appPath: "/patient/dashboard",
    icon: User,
    title: "Patient Portal",
    subtitle: "Persons Enrolled in TB Regimen",
    description:
      "View daily dose schedule, track 180-day treatment progress, monitor streak, and request HSA support.",
    features: [
      "Next Dose Countdown & Reminders",
      "180-Day Regimen Calendar",
      "Direct HSA Assistance Request",
    ],
  },
  {
    role: "guardian" as UserRole,
    loginPath: "/login/guardian",
    appPath: "/guardian/patient",
    icon: ShieldCheck,
    title: "Guardian Portal",
    subtitle: "Treatment Supporters & Family Guardians",
    description:
      "Monitor supported relative's adherence, confirm assisted doses, and stay in contact with health workers.",
    features: [
      "Daily Dose Verification Feed",
      "1-Tap Assisted Dose Logger",
      "Direct HSA Communication",
    ],
  },
];

export function PortalSelector() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      {/* Institutional Header Banner */}
      <section className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary font-bold">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Government of Malawi · Ministry of Health
              </span>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                National TB Control Programme
              </h1>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span>Smart Pill Box Telemetry Network</span>
          </div>
        </div>

        <div className="mt-6 max-w-3xl space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Digital TB Adherence Information System
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A centralized digital health platform integrating smart pill box SMS telemetry, clinical
            missed-dose triage, and community treatment supporter verification across Zomba Central,
            Bwaila, and Machinga facilities.
          </p>
        </div>
      </section>

      {/* Role Portal Entry Cards */}
      <section>
        <div className="mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Select Portal Module
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose your designated role portal to sign in to your operational dashboard.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PORTALS.map((portal) => {
            const isCurrentRoleLoggedIn = isAuthenticated && user?.role === portal.role;
            const targetPath = isCurrentRoleLoggedIn ? portal.appPath : portal.loginPath;

            return (
              <div
                key={portal.role}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                      <portal.icon className="h-5 w-5" />
                    </span>
                    {isCurrentRoleLoggedIn && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Active Session
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                    {portal.title}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground">{portal.subtitle}</p>

                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {portal.description}
                  </p>

                  <ul className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
                    {portal.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/70 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <Link
                    to={targetPath}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    <span>{isCurrentRoleLoggedIn ? "Open Portal Dashboard" : "Enter Portal"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Information & Support Note */}
      <section className="rounded-lg border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            <strong>Official System:</strong> Ministry of Health Malawi · Digital Health Division
          </span>
          <span>Technical Support: support@health.gov.mw</span>
        </div>
      </section>
    </div>
  );
}
