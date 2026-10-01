import { createFileRoute } from "@tanstack/react-router";
import { Users, Cpu, Activity, AlertTriangle, Building2, Radio, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/tb/StatCard";
import { Badge } from "@/components/ui/badge";
import { healthWorkers, patients } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{ title: "System Overview — Administrator Portal" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { alerts, telemetry, adherenceRate } = useTB();

  const openAlerts = alerts.filter((a) => !a.resolved);
  const totalPatients = patients.length;
  const totalHSAs = healthWorkers.length;
  const avgAdherence = Math.round(
    patients.reduce((sum, p) => sum + adherenceRate(p.id), 0) / patients.length,
  );

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            National Programme Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ministry of Health · Digital TB Treatment Adherence Platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono">
            <Radio className="mr-1 h-3 w-3 text-emerald-500 animate-pulse" /> Telemetry Network Live
          </Badge>
        </div>
      </header>

      {/* High Level Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Enrolled Patients"
          value={totalPatients}
          icon={Users}
          hint="3 Facility Catchments"
        />
        <StatCard label="Assigned HSAs" value={totalHSAs} icon={Building2} hint="Health Workers" />
        <StatCard
          label="National Cohort Adherence"
          value={`${avgAdherence}%`}
          icon={Activity}
          tone="success"
          hint="30-day average"
        />
        <StatCard
          label="Active Hardware Alerts"
          value={openAlerts.length}
          icon={AlertTriangle}
          tone="danger"
          hint="Pending HSA Action"
        />
      </section>

      {/* Facility Distribution Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-display text-base font-bold text-foreground">
              Facility Operations
            </h2>
            <Badge variant="secondary" className="text-xs">
              3 Active Sites
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {["Zomba Central Hospital", "Bwaila Hospital", "Machinga Clinic"].map((fac) => {
              const facPatients = patients.filter((p) => p.facility === fac);
              const facAdherence = Math.round(
                facPatients.reduce((sum, p) => sum + adherenceRate(p.id), 0) /
                  (facPatients.length || 1),
              );
              return (
                <div
                  key={fac}
                  className="rounded-lg border border-border bg-muted/20 p-3 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{fac}</span>
                    <span className="text-muted-foreground font-semibold">
                      {facPatients.length} Active Patients
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      Average Adherence: <strong>{facAdherence}%</strong>
                    </span>
                    <span className="text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle className="h-3 w-3" /> Telemetry Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry Module Health */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-display text-base font-bold text-foreground">
              Hardware Fleet Telemetry
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              {patients.length} Deployed Units
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {patients.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/10"
              >
                <div className="space-y-0.5">
                  <p className="font-mono font-bold text-foreground">{p.boxId}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Assigned: {p.name} ({p.facility})
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={
                      p.battery < 30
                        ? "text-destructive font-bold"
                        : "text-emerald-600 font-semibold"
                    }
                  >
                    {p.battery}% Battery
                  </span>
                  <span className="block text-[10px] text-muted-foreground">
                    SMS Gateway Linked
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
