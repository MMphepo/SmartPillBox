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
  { to: "/health-worker/patients", label: "Patients Cohort", icon: Users },
  { to: "/health-worker/alerts", label: "Alerts & Triage", icon: AlertTriangle },
  { to: "/health-worker/adherence", label: "Telemetry Log", icon: Activity },
  { to: "/health-worker/field-log", label: "Field Log", icon: ClipboardList },
];

export function HealthWorkerShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Ministry Flag Line */}
      <div className="moh-flagline h-1.5 w-full shrink-0" />

      {/* Main Layout Container */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar Navigation for Desktop */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col justify-between">
          <div>
            {/* Header / Institutional Branding */}
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground font-bold shadow-2xs">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Ministry of Health
                  </span>
                  <span className="block truncate font-display text-sm font-bold text-foreground">
                    Health Worker Portal
                  </span>
                </div>
              </div>
            </div>

            {/* User & Facility Context */}
            <div className="border-b border-border bg-muted/40 px-4 py-3 text-xs">
              <p className="font-bold text-foreground truncate">{user?.name || "HSA John Phiri"}</p>
              <p className="text-muted-foreground font-medium truncate">
                {user?.title || "TB Assistant / HSA"}
              </p>
              <p className="mt-1 flex items-center gap-1 font-semibold text-primary truncate">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span>{user?.facility || "Zomba Central Hospital"}</span>
              </p>
            </div>

            {/* Navigation Links */}
            <nav className="p-3 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Clinical Operations
              </div>
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
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
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

          {/* Bottom Sidebar Tools & Logout */}
          <div className="border-t border-border p-3 space-y-2 bg-card">
            <div className="px-2 py-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Hardware Demonstration Tool
              </span>
              <SimulatorDialog />
            </div>

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

        {/* Mobile Header & Navigation */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block truncate font-display text-sm font-bold">
                Health Worker Portal
              </span>
              <span className="block truncate text-[10px] text-muted-foreground">
                {user?.facility || "Zomba Central Hospital"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-border bg-card p-4 md:hidden space-y-3 z-30">
            <div className="text-xs border-b border-border pb-2">
              <p className="font-bold text-foreground">{user?.name}</p>
              <p className="text-muted-foreground">{user?.facility}</p>
            </div>
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
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold",
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
