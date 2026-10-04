import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublicPage = pathname === "/" || pathname.startsWith("/login");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {isPublicPage && (
        <header className="border-b border-border bg-card">
          <div className="moh-flagline h-1 w-full" />
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link to="/" className="flex flex-col text-left group">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                Ministry of Health
              </span>
              <span className="font-display text-base font-bold tracking-tight text-foreground">
                Digital TB Adherence System
              </span>
            </Link>
          </div>
        </header>
      )}

      <div
        className={isPublicPage ? "mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6" : "flex-1"}
      >
        {children}
      </div>

      {isPublicPage && (
        <footer className="border-t border-border bg-card text-xs text-muted-foreground">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <span>Ministry of Health · Republic of Malawi</span>
            <span>Digital TB Adherence System</span>
          </div>
        </footer>
      )}
    </div>
  );
}
