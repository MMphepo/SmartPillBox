import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BatteryWarning,
  ClipboardPlus,
  Users,
  ArrowRight,
  CheckCircle,
  Radio,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { StatCard } from "@/components/tb/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { patients, type Intervention } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/health-worker/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Health Worker Portal" }],
  }),
  component: HealthWorkerDashboard,
});

function HealthWorkerDashboard() {
  const { user } = useAuth();
  const { alerts, telemetry, adherenceRate, resolveAlert, logIntervention } = useTB();
  const [modalPatient, setModalPatient] = useState<string | null>(null);
  const [type, setType] = useState<Intervention["type"]>("Home visit");
  const [notes, setNotes] = useState("");

  const openAlerts = alerts.filter((a) => !a.resolved);
  const cohortAdherence = Math.round(
    patients.reduce((sum, p) => sum + adherenceRate(p.id), 0) / patients.length,
  );
  const avgBattery = Math.round(patients.reduce((s, p) => s + p.battery, 0) / patients.length);

  const triage = [...openAlerts].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 } as const;
    return rank[a.severity] - rank[b.severity];
  });

  const submitIntervention = () => {
    if (!modalPatient) return;
    const patient = patients.find((p) => p.id === modalPatient)!;
    logIntervention({
      patientId: modalPatient,
      hsaId: patient.hsaId,
      type,
      notes: notes || "Routine follow-up action logged from dashboard.",
    });
    setNotes("");
    setModalPatient(null);
    toast.success("Field action logged", { description: `${type} · ${patient.name}` });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Operational Overview Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logged in as <strong>{user?.name || "HSA John Phiri"}</strong> (
            {user?.facility || "Zomba Central Hospital"})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={openAlerts.length > 0 ? "destructive" : "secondary"}
            className="text-xs font-medium"
          >
            {openAlerts.length} Unresolved Alerts
          </Badge>
          <Button size="sm" onClick={() => setModalPatient(patients[0].id)} className="text-xs">
            <ClipboardPlus className="mr-1.5 h-3.5 w-3.5" />
            Log Action
          </Button>
        </div>
      </header>

      {/* KPI Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Enrolled Cohort"
          value={patients.length}
          icon={Users}
          hint="Across facility catchments"
        />
        <StatCard
          label="Cohort Adherence"
          value={`${cohortAdherence}%`}
          icon={Activity}
          tone="success"
          hint="30-day average"
        />
        <StatCard
          label="Open Missed Dose Alerts"
          value={openAlerts.filter((a) => a.kind === "MISSED_DOSE_ALERT").length}
          icon={AlertTriangle}
          tone="danger"
          hint="Requires HSA follow-up"
        />
        <StatCard
          label="Average Box Battery"
          value={`${avgBattery}%`}
          icon={BatteryWarning}
          tone="warning"
          hint="Smart pill box power"
        />
      </section>

      {/* Triage Queue & Telemetry Feed Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Urgent Triage Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Priority Triage Queue
              </h2>
              <p className="text-xs text-muted-foreground">
                Patients requiring immediate clinical or community intervention
              </p>
            </div>
            <Link
              to="/health-worker/alerts"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View All Alerts ({alerts.length}) <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {triage.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">Cohort Fully Triaged</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                There are no pending unresolved alerts at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {triage.slice(0, 4).map((a) => {
                const p = patients.find((x) => x.id === a.patientId)!;
                return (
                  <div
                    key={a.id}
                    className="rounded-lg border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to="/health-worker/patients/$id"
                          params={{ id: p.id }}
                          className="font-semibold text-sm hover:underline text-foreground"
                        >
                          {p.name}
                        </Link>
                        <Badge
                          variant={p.phase === "Intensive" ? "destructive" : "secondary"}
                          className="text-[10px]"
                        >
                          {p.phase} Phase
                        </Badge>
                        <Badge
                          variant={a.severity === "high" ? "destructive" : "outline"}
                          className="text-[10px] uppercase"
                        >
                          {a.kind.replaceAll("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{a.message}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Serial: <span className="font-mono">{p.boxId}</span> · {p.facility} · Day{" "}
                        {p.treatmentDay} of 180
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t border-border pt-2 sm:border-0 sm:pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setModalPatient(p.id)}
                        className="text-xs h-8"
                      >
                        <ClipboardPlus className="mr-1 h-3.5 w-3.5" /> Log Action
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          resolveAlert(a.id);
                          toast.success("Alert resolved");
                        }}
                        className="text-xs h-8"
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Telemetry Stream (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Live Telemetry Feed
              </h2>
              <p className="text-xs text-muted-foreground">Recent SMS payloads from boxes</p>
            </div>
            <Link
              to="/health-worker/adherence"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Adherence Log →
            </Link>
          </div>

          <div className="space-y-2.5">
            {telemetry.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="rounded-lg border border-border bg-card p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-semibold text-foreground flex items-center gap-1.5">
                    <Radio className="h-3 w-3 text-primary animate-pulse" />
                    {t.boxId}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(t.receivedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={t.event === "MISSED_DOSE_ALERT" ? "destructive" : "secondary"}
                    className="text-[10px]"
                  >
                    {t.event}
                  </Badge>
                </div>
                <code className="block bg-muted p-1.5 rounded font-mono text-[10px] text-muted-foreground overflow-x-auto truncate">
                  {t.raw}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Action Dialog */}
      <Dialog open={modalPatient !== null} onOpenChange={(o) => !o && setModalPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Field Intervention</DialogTitle>
            <DialogDescription>
              Record a home visit, phone check-in, pill resupply or counselling session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Patient</Label>
              <Select value={modalPatient ?? ""} onValueChange={setModalPatient}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} ({p.facility})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Intervention Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as Intervention["type"])}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home visit" className="text-xs">
                    Home visit
                  </SelectItem>
                  <SelectItem value="Phone check-in" className="text-xs">
                    Phone check-in
                  </SelectItem>
                  <SelectItem value="Pill resupply" className="text-xs">
                    Pill resupply
                  </SelectItem>
                  <SelectItem value="Counselling" className="text-xs">
                    Counselling
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Clinical / Field Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of observations, treatment progress, or agreed action plan..."
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={submitIntervention} className="text-xs">
              Save Action Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
