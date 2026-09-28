import { Link, useRouterState } from "@tanstack/react-router";
import { Building2, Radio } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublicPage = pathname === "/" || pathname.startsWith("/login");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {isPublicPage && (
        <header className="border-b border-border bg-card">
          <div className="moh-flagline h-1.5 w-full" />
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="block font-display text-sm font-bold leading-tight sm:text-base">
                  Malawi Ministry of Health
                </span>
                <span className="block text-xs text-muted-foreground">
                  Digital TB Adherence Information Portal
                </span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-md border border-border">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <span>National Control Programme · Lilongwe</span>
            </div>
          </div>
        </header>
      )}

      <div
        className={isPublicPage ? "mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6" : "flex-1"}
      >
        {children}
      </div>

      {isPublicPage && (
        <footer className="border-t border-border bg-card text-xs text-muted-foreground">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-primary" />
              Smart Pill Box Telemetry Gateway · Operational Demo
            </span>
            <span>Government of Malawi · Ministry of Health</span>
          </div>
        </footer>
      )}
    </div>
  );
}
