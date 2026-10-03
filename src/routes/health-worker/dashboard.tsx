import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BatteryWarning,
  ClipboardPlus,
  Users,
  ArrowRight,
  CheckCircle2,
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
      notes: notes || "Routine follow-up action logged from operational dashboard.",
    });
    setNotes("");
    setModalPatient(null);
    toast.success("Field intervention entry saved", { description: `${type} · ${patient.name}` });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <header className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Clinical Operations Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logged in as <strong>{user?.name || "HSA John Phiri"}</strong> (
            {user?.facility || "Zomba Central Hospital"})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={openAlerts.length > 0 ? "destructive" : "secondary"}
            className="text-xs font-bold px-3 py-1"
          >
            {openAlerts.length} Active Triage Alerts
          </Badge>
          <Button
            size="sm"
            onClick={() => setModalPatient(patients[0].id)}
            className="text-xs font-bold"
          >
            <ClipboardPlus className="mr-1.5 h-3.5 w-3.5" />
            Log Action Entry
          </Button>
        </div>
      </header>

      {/* Cohort KPI Metrics */}
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
          hint="30-day cohort average"
        />
        <StatCard
          label="Open Missed Dose Alerts"
          value={openAlerts.filter((a) => a.kind === "MISSED_DOSE_ALERT").length}
          icon={AlertTriangle}
          tone="danger"
          hint="Requires HSA community visit"
        />
        <StatCard
          label="Average Box Battery"
          value={`${avgBattery}%`}
          icon={BatteryWarning}
          tone="warning"
          hint="Smart pill box hardware power"
        />
      </section>

      {/* Triage Queue & Live Telemetry Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Urgent Priority Triage Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Priority Missed-Dose Triage Queue
              </h2>
              <p className="text-xs text-muted-foreground">
                Ranked by severity for immediate clinical or community intervention
              </p>
            </div>
            <Link
              to="/health-worker/alerts"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              All Alerts ({alerts.length}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {triage.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <h3 className="mt-2 text-sm font-bold text-foreground">Cohort Fully Triaged</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                There are no open unresolved alerts at this time. All patients are up-to-date.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {triage.slice(0, 4).map((a) => {
                const p = patients.find((x) => x.id === a.patientId)!;
                return (
                  <div
                    key={a.id}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to="/health-worker/patients/$id"
                          params={{ id: p.id }}
                          className="font-bold text-sm hover:underline text-foreground"
                        >
                          {p.name}
                        </Link>
                        <Badge
                          variant={p.phase === "Intensive" ? "destructive" : "secondary"}
                          className="text-[10px] font-bold"
                        >
                          {p.phase} Phase
                        </Badge>
                        <Badge
                          variant={a.severity === "high" ? "destructive" : "outline"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {a.kind.replaceAll("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{a.message}</p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Serial:{" "}
                        <span className="font-mono font-bold text-foreground">{p.boxId}</span> ·{" "}
                        {p.facility} · Day {p.treatmentDay} of 180
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t border-border pt-2 sm:border-0 sm:pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setModalPatient(p.id)}
                        className="text-xs font-semibold h-8"
                      >
                        <ClipboardPlus className="mr-1 h-3.5 w-3.5" /> Log Visit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          resolveAlert(a.id);
                          toast.success("Alert marked as resolved");
                        }}
                        className="text-xs font-bold h-8"
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

        {/* Live SMS Telemetry Stream (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Live SMS Telemetry Feed
              </h2>
              <p className="text-xs text-muted-foreground">Inbound smart pill box data packets</p>
            </div>
            <Link
              to="/health-worker/adherence"
              className="text-xs font-bold text-primary hover:underline"
            >
              Full Feed →
            </Link>
          </div>

          <div className="space-y-2.5">
            {telemetry.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-border bg-card p-3.5 text-xs space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-bold text-foreground flex items-center gap-1.5">
                    <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
                    {t.boxId}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {new Date(t.receivedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge
                    variant={t.event === "MISSED_DOSE_ALERT" ? "destructive" : "secondary"}
                    className="text-[10px] font-bold"
                  >
                    {t.event}
                  </Badge>
                </div>
                <code className="block bg-muted/60 p-2 rounded-lg font-mono text-[10px] text-muted-foreground overflow-x-auto truncate border border-border">
                  {t.raw}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Action Modal Dialog */}
      <Dialog open={modalPatient !== null} onOpenChange={(o) => !o && setModalPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Field Intervention</DialogTitle>
            <DialogDescription>
              Record a home visit, phone check-in, pill resupply, or counselling session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Patient</Label>
              <Select value={modalPatient ?? ""} onValueChange={setModalPatient}>
                <SelectTrigger className="text-xs h-9">
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
              <Label className="text-xs font-semibold">Intervention Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as Intervention["type"])}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home visit" className="text-xs">
                    Home Visit
                  </SelectItem>
                  <SelectItem value="Phone check-in" className="text-xs">
                    Phone Check-in
                  </SelectItem>
                  <SelectItem value="Pill resupply" className="text-xs">
                    Pill Resupply
                  </SelectItem>
                  <SelectItem value="Counselling" className="text-xs">
                    Counselling Session
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Clinical / Field Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of observations, treatment progress, or agreed action plan..."
                className="text-xs min-h-[90px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={submitIntervention} className="text-xs font-bold">
              Save Field Action Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
