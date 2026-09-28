import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, HeartPulse, Radio, ShieldCheck, Stethoscope, User } from "lucide-react";
import type { ReactNode } from "react";

import { SimulatorDialog } from "@/components/tb/SimulatorDialog";
import { cn } from "@/lib/utils";

const roles = [
  { to: "/health-worker", label: "Health Worker", icon: Stethoscope },
  { to: "/patient", label: "Patient", icon: User },
  { to: "/guardian", label: "Guardian", icon: ShieldCheck },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="moh-flagline h-1.5 w-full" />
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-bold leading-tight sm:text-base">
                Malawi MoH — Digital TB Adherence Portal
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Smart Pill Box Programme · Ministry of Health
              </span>
            </span>
          </Link>
          <SimulatorDialog />
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          <Link
            to="/"
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
              pathname === "/" && "bg-primary-soft text-primary",
            )}
          >
            <Activity className="mr-1.5 inline h-4 w-4" />
            Overview
          </Link>
          {roles.map((r) => (
            <Link
              key={r.to}
              to={r.to}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                pathname === r.to && "bg-primary-soft text-primary",
              )}
            >
              <r.icon className="mr-1.5 inline h-4 w-4" />
              {r.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <span className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-primary" />
            SMS gateway connected · demo data only
          </span>
          <span>National TB Control Programme · Lilongwe, Malawi</span>
        </div>
      </footer>
    </div>
  );
}
