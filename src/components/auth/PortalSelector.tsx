import { Link } from "@tanstack/react-router";
import {
  Building2,
  Stethoscope,
  User,
  ShieldCheck,
  ArrowRight,
  Activity,
  CheckCircle2,
  Server,
  HeartPulse,
} from "lucide-react";
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
      "Operational portal for facility clinicians and community HSAs to manage patient cohorts, triage missed-dose alerts, track smart box SMS telemetry, and log field visits.",
    features: [
      "Cohort Adherence & Triage Queue",
      "Real-time SMS Telemetry Gateway Feed",
      "Field Intervention & Visit Tracker",
    ],
    accentColor: "border-primary/30 hover:border-primary",
    badgeBg: "bg-primary/10 text-primary border-primary/20",
  },
  {
    role: "patient" as UserRole,
    loginPath: "/login/patient",
    appPath: "/patient/dashboard",
    icon: User,
    title: "Patient Portal",
    subtitle: "Persons Enrolled in Anti-TB Regimen",
    description:
      "Patient-facing portal providing daily medication countdowns, 180-day regimen progress tracking, 30-day adherence calendar, and direct HSA assistance requests.",
    features: [
      "Daily Dose Schedule & Visual Reminders",
      "180-Day Treatment Phase Timeline",
      "Discreet Public Privacy Mode",
    ],
    accentColor: "border-emerald-500/30 hover:border-emerald-500",
    badgeBg:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
  },
  {
    role: "guardian" as UserRole,
    loginPath: "/login/guardian",
    appPath: "/guardian/patient",
    icon: ShieldCheck,
    title: "Guardian Portal",
    subtitle: "Treatment Supporters & Family Caregivers",
    description:
      "Community supporter module enabling designated relatives to verify daily medication adherence, log assisted doses, and stay connected with assigned health surveillance assistants.",
    features: [
      "Relative Adherence & Dosing Status",
      "1-Tap Assisted Dose Logger",
      "Direct HSA Contact & SMS Links",
    ],
    accentColor: "border-indigo-500/30 hover:border-indigo-500",
    badgeBg:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800",
  },
];

export function PortalSelector() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-2 sm:py-6">
      {/* Official Government Banner Header */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Government of Malawi · Ministry of Health
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl mt-0.5">
                National TB Control Programme
              </h1>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shrink-0">
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>Smart Pill Box Telemetry Network Active</span>
          </div>
        </div>

        <div className="mt-6 max-w-3xl space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Digital Tuberculosis Adherence Information Portal
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
            Centralized digital health platform integrating smart pill box SMS telemetry, clinical
            missed-dose triage, and community treatment supporter verification across Zomba Central
            Hospital, Bwaila Hospital, and Machinga Health Centre.
          </p>
        </div>
      </section>

      {/* Role Module Cards Section */}
      <section className="space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Select Role Module to Access Portal
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Choose your authorized system role to open your operational dashboard.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PORTALS.map((portal) => {
            const isCurrentRoleLoggedIn = isAuthenticated && user?.role === portal.role;
            const targetPath = isCurrentRoleLoggedIn ? portal.appPath : portal.loginPath;
            const Icon = portal.icon;

            return (
              <div
                key={portal.role}
                className={`flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 ${portal.accentColor}`}
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

                  <h3 className="mt-5 font-display text-lg font-bold text-foreground">
                    {portal.title}
                  </h3>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                    {portal.subtitle}
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {portal.description}
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-border pt-4 text-xs font-medium text-muted-foreground">
                    {portal.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-border pt-4">
                  <Link
                    to={targetPath}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
                  >
                    <span>
                      {isCurrentRoleLoggedIn ? "Open Portal Dashboard" : "Sign In to Portal"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Operational Support Note */}
      <section className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-primary shrink-0" />
            <span>
              <strong>National Health Information Infrastructure:</strong> Ministry of Health Malawi
              · Digital Health Division
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <HeartPulse className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Technical Operations & Support: support@health.gov.mw</span>
          </div>
        </div>
      </section>
    </div>
  );
}
