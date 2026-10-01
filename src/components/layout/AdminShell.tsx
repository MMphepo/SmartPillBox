import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Radio,
  LogOut,
  Building2,
  Menu,
  X,
  Cpu,
  FileText,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "System Overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "User Management", icon: Users },
  { to: "/admin/devices", label: "Smart Pill Boxes", icon: Cpu },
  { to: "/admin/logs", label: "System & Telemetry Logs", icon: FileText },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
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
            {/* Brand Header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-700 text-white font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Ministry of Health
                  </span>
                  <span className="block truncate font-display text-sm font-bold text-foreground">
                    Administrator Portal
                  </span>
                </div>
              </div>
            </div>

            {/* Admin User Info */}
            <div className="border-b border-border bg-muted/30 px-4 py-3 text-xs">
              <p className="font-semibold text-foreground truncate">
                {user?.name || "Dr. Mary Chisale"}
              </p>
              <p className="text-muted-foreground truncate">
                {user?.title || "National Administrator"}
              </p>
              <p className="mt-1 flex items-center gap-1 font-medium text-blue-700 dark:text-blue-400 truncate">
                <Radio className="h-3 w-3 shrink-0 text-emerald-500 animate-pulse" />
                <span>{user?.facility || "Ministry HQ, Lilongwe"}</span>
              </p>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Administration
              </div>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== "/admin/dashboard" && pathname.startsWith(item.to));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-blue-700 text-white font-semibold shadow-sm"
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

          <div className="border-t border-border p-3 bg-card">
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
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-blue-700 text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block truncate font-display text-sm font-bold">
                Administrator Portal
              </span>
              <span className="block truncate text-[10px] text-muted-foreground">{user?.name}</span>
            </div>
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

        {mobileMenuOpen && (
          <div className="border-b border-border bg-card p-4 md:hidden space-y-3 z-30">
            <div className="text-xs border-b border-border pb-2">
              <p className="font-semibold text-foreground">{user?.name}</p>
              <p className="text-muted-foreground">{user?.title}</p>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== "/admin/dashboard" && pathname.startsWith(item.to));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium",
                      isActive
                        ? "bg-blue-700 text-white font-semibold"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-2 border-t border-border">
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
