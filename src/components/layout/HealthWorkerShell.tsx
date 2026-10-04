import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Activity,
  ClipboardList,
  LogOut,
  Stethoscope,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { SimulatorDialog } from "@/components/tb/SimulatorDialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { to: "/health-worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/health-worker/patients", label: "Patients", icon: Users },
  { to: "/health-worker/alerts", label: "Triage", icon: AlertTriangle },
  { to: "/health-worker/adherence", label: "Telemetry", icon: Activity },
  { to: "/health-worker/field-log", label: "Field Log", icon: ClipboardList },
];

export function HealthWorkerShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="moh-flagline h-1.5 w-full shrink-0" />

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:flex md:flex-col justify-between">
          <div>
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-2xs">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate font-display text-sm font-bold text-foreground">
                    Health Worker
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {user?.name || "HSA John Phiri"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b border-border bg-muted/30 px-3.5 py-2 text-[11px] text-muted-foreground font-medium truncate flex items-center gap-1">
              <Building2 className="h-3 w-3 text-primary shrink-0" />
              <span>{user?.facility || "Zomba Central Hospital"}</span>
            </div>

            <nav className="p-2.5 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== "/health-worker/dashboard" && pathname.startsWith(item.to));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border p-3 space-y-2 bg-card">
            <SimulatorDialog />

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="truncate font-display text-sm font-bold">Health Worker</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-card p-4 md:hidden space-y-3 z-30">
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== "/health-worker/dashboard" && pathname.startsWith(item.to));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <SimulatorDialog />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full justify-center text-xs font-medium text-destructive border-destructive/20"
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
