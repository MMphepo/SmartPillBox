import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useTB, type Language } from "@/lib/tb-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NAV_ITEMS = [
  { to: "/patient/dashboard", label: "Dashboard" },
  { to: "/patient/treatment", label: "Treatment" },
  { to: "/patient/adherence", label: "Calendar" },
  { to: "/patient/profile", label: "Profile" },
];

export function PatientShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useTB();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="moh-flagline h-1 w-full shrink-0" />

      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Ministry of Health
              </span>
              <Link
                to="/patient/dashboard"
                className="font-display text-sm font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity"
              >
                Digital TB Adherence System
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 border-l border-border pl-6">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== "/patient/dashboard" && pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-md transition-colors",
                      isActive
                        ? "bg-secondary text-foreground font-bold border border-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="font-semibold text-foreground">{user?.name || "Chifundo Banda"}</span>

            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="h-8 text-xs font-medium w-24 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" className="text-xs">
                  English
                </SelectItem>
                <SelectItem value="ny" className="text-xs">
                  Chichewa
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="h-8 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-8 w-8 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card px-4 py-3 md:hidden space-y-3">
            <div className="pb-2 border-b border-border text-xs flex items-center justify-between">
              <span className="font-semibold text-foreground flex-1">
                {user?.name || "Chifundo Banda"}
              </span>
              <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger className="h-8 text-xs font-medium w-28 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en" className="text-xs">
                    English
                  </SelectItem>
                  <SelectItem value="ny" className="text-xs">
                    Chichewa
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== "/patient/dashboard" && pathname.startsWith(item.to));
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-3 py-2 text-xs font-semibold rounded-md",
                      isActive
                        ? "bg-secondary text-foreground font-bold border border-border"
                        : "text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full h-8 text-xs font-medium text-destructive border-border"
            >
              Sign Out
            </Button>
          </div>
        )}
      </header>

      {/* Main Workspace */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">{children}</main>

      {/* Understated Institutional Footer */}
      <footer className="border-t border-border bg-card text-xs text-muted-foreground py-4">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <span>Ministry of Health · Republic of Malawi</span>
          <span>Patient Portal</span>
        </div>
      </footer>
    </div>
  );
}
