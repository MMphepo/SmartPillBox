import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Pill,
  CalendarDays,
  UserCheck,
  LogOut,
  User,
  Menu,
  X,
  Globe2,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useTB, type Language } from "@/lib/tb-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NAV_ITEMS = [
  { to: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patient/treatment", label: "My Treatment", icon: Pill },
  { to: "/patient/adherence", label: "30-Day Calendar", icon: CalendarDays },
  { to: "/patient/profile", label: "Profile & HSA Info", icon: UserCheck },
];

export function PatientShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useTB();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Ministry Accent Line */}
      <div className="moh-flagline h-1.5 w-full shrink-0" />

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col justify-between">
          <div>
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white font-bold">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ministry of Health
                  </span>
                  <span className="block truncate font-display text-sm font-bold text-foreground">
                    Patient Portal
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b border-border bg-muted/30 px-4 py-3 text-xs">
              <p className="font-semibold text-foreground truncate">
                {user?.name || "Chifundo Banda"}
              </p>
              <p className="text-muted-foreground truncate">
                {user?.facility || "Zomba Central Hospital"}
              </p>
            </div>

            <nav className="p-3 space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                My Care
              </div>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== "/patient/dashboard" && pathname.startsWith(item.to));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-emerald-600 text-white font-semibold"
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

          <div className="border-t border-border p-3 space-y-3 bg-card">
            <div className="space-y-1 px-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Globe2 className="h-3 w-3" /> Language / Chilankhulo
              </label>
              <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ny">Chichewa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full justify-start text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-emerald-600 text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block truncate font-display text-sm font-bold">Patient Portal</span>
              <span className="block truncate text-[10px] text-muted-foreground">{user?.name}</span>
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

        {mobileMenuOpen && (
          <div className="border-b border-border bg-card p-4 md:hidden space-y-3 z-30">
            <div className="text-xs border-b border-border pb-2">
              <p className="font-semibold text-foreground">{user?.name}</p>
              <p className="text-muted-foreground">{user?.facility}</p>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== "/patient/dashboard" && pathname.startsWith(item.to));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium",
                      isActive
                        ? "bg-emerald-600 text-white font-semibold"
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
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Language / Chilankhulo
                </label>
                <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ny">Chichewa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full justify-center text-xs text-destructive border-destructive/20"
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
