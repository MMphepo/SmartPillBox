import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Menu, X } from "lucide-react";

export const Route = createFileRoute("/district-officer")({
  component: DistrictOfficerLayout,
});

function DistrictOfficerLayout() {
  return (
    <AuthGuard allowedRole="district_officer">
      <DistrictOfficerShell>
        <Outlet />
      </DistrictOfficerShell>
    </AuthGuard>
  );
}

const NAV_ITEMS = [
  { to: "/district-officer/dashboard", label: "Overview" },
  { to: "/district-officer/facilities", label: "Facilities" },
  { to: "/district-officer/adherence", label: "Adherence" },
  { to: "/district-officer/reports", label: "Reports" },
];

export function DistrictOfficerShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global scope filter state
  const [zone, setZone] = useState<string>("central");
  const [district, setDistrict] = useState<string>("lilongwe");
  const [facility, setFacility] = useState<string>("all");
  const [period, setPeriod] = useState<string>("last_30_days");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="moh-flagline h-1 w-full shrink-0" />

      {/* Top Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Ministry of Health · Republic of Malawi
              </span>
              <Link
                to="/district-officer/dashboard"
                className="font-display text-sm font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity"
              >
                TB Programme Summary
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 border-l border-border pl-6">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== "/district-officer/dashboard" && pathname.startsWith(item.to));
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

          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="text-right">
              <span className="block font-semibold text-foreground">
                {user?.name || "Dr. Emmanuel Moyo"}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {user?.title || "District TB Officer"} · {user?.district || "Lilongwe"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="h-8 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
            >
              Sign Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
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
            <div className="pb-2 border-b border-border text-xs">
              <span className="block font-semibold text-foreground">
                {user?.name || "Dr. Emmanuel Moyo"}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {user?.title || "District TB Officer"} · {user?.district || "Lilongwe"}
              </span>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== "/district-officer/dashboard" && pathname.startsWith(item.to));
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

        {/* Global Scope & Reporting Period Filter Bar */}
        <div className="border-t border-border bg-muted/20 px-4 py-2.5 sm:px-6">
          <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-semibold text-[11px]">Zone:</span>
                <Select value={zone} onValueChange={setZone}>
                  <SelectTrigger className="h-7 text-xs font-medium w-32 border-border bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central" className="text-xs">
                      Central Zone
                    </SelectItem>
                    <SelectItem value="southern" className="text-xs">
                      Southern Zone
                    </SelectItem>
                    <SelectItem value="northern" className="text-xs">
                      Northern Zone
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-semibold text-[11px]">District:</span>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger className="h-7 text-xs font-medium w-32 border-border bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lilongwe" className="text-xs">
                      Lilongwe
                    </SelectItem>
                    <SelectItem value="kasungu" className="text-xs">
                      Kasungu
                    </SelectItem>
                    <SelectItem value="mchinji" className="text-xs">
                      Mchinji
                    </SelectItem>
                    <SelectItem value="zomba" className="text-xs">
                      Zomba
                    </SelectItem>
                    <SelectItem value="machinga" className="text-xs">
                      Machinga
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-semibold text-[11px]">Facility:</span>
                <Select value={facility} onValueChange={setFacility}>
                  <SelectTrigger className="h-7 text-xs font-medium w-40 border-border bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Facilities
                    </SelectItem>
                    <SelectItem value="area_25" className="text-xs">
                      Area 25 Health Centre
                    </SelectItem>
                    <SelectItem value="bwaila" className="text-xs">
                      Bwaila Hospital
                    </SelectItem>
                    <SelectItem value="area_18" className="text-xs">
                      Area 18 Health Centre
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-semibold text-[11px]">Reporting Period:</span>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="h-7 text-xs font-medium w-36 border-border bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_30_days" className="text-xs">
                    Last 30 days
                  </SelectItem>
                  <SelectItem value="last_7_days" className="text-xs">
                    Last 7 days
                  </SelectItem>
                  <SelectItem value="current_month" className="text-xs">
                    Current month
                  </SelectItem>
                  <SelectItem value="previous_month" className="text-xs">
                    Previous month
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>

      {/* Understated Footer */}
      <footer className="border-t border-border bg-card text-xs text-muted-foreground py-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
          <span>Ministry of Health · Republic of Malawi</span>
          <span>District & Zone TB Programme Summary</span>
        </div>
      </footer>
    </div>
  );
}
