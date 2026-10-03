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
      notes: notes || "Follow-up action logged.",
    });
    setNotes("");
    setModalPatient(null);
    toast.success("Action saved", { description: `${type} · ${patient.name}` });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Clinical Operations</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={openAlerts.length > 0 ? "destructive" : "secondary"}
            className="text-xs font-bold px-3 py-1"
          >
            {openAlerts.length} Alerts
          </Badge>
          <Button
            size="sm"
            onClick={() => setModalPatient(patients[0].id)}
            className="text-xs font-bold"
          >
            <ClipboardPlus className="mr-1.5 h-3.5 w-3.5" />
            Log Action
          </Button>
        </div>
      </header>

      {/* Cohort KPI Metrics */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cohort Size" value={patients.length} icon={Users} />
        <StatCard label="Adherence" value={`${cohortAdherence}%`} icon={Activity} tone="success" />
        <StatCard
          label="Open Alerts"
          value={openAlerts.filter((a) => a.kind === "MISSED_DOSE_ALERT").length}
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard
          label="Avg Battery"
          value={`${avgBattery}%`}
          icon={BatteryWarning}
          tone="warning"
        />
      </section>

      {/* Triage Queue & Live Telemetry Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Triage Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-display text-base font-bold text-foreground">Triage Queue</h2>
            <Link
              to="/health-worker/alerts"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              All ({alerts.length}) <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {triage.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-2xs">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-2 text-sm font-bold text-foreground">No Pending Alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {triage.slice(0, 4).map((a) => {
                const p = patients.find((x) => x.id === a.patientId)!;
                return (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-border bg-card p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to="/health-worker/patients/$id"
                          params={{ id: p.id }}
                          className="font-bold text-sm hover:underline text-foreground"
                        >
                          {p.name}
                        </Link>
                        <Badge
                          variant={a.severity === "high" ? "destructive" : "outline"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {a.kind.replaceAll("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{a.message}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t border-border pt-2 sm:border-0 sm:pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setModalPatient(p.id)}
                        className="text-xs font-semibold h-8"
                      >
                        <ClipboardPlus className="mr-1 h-3.5 w-3.5" /> Log
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          resolveAlert(a.id);
                          toast.success("Resolved");
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

        {/* Live SMS Telemetry Feed (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-display text-base font-bold text-foreground">Telemetry Feed</h2>
            <Link
              to="/health-worker/adherence"
              className="text-xs font-bold text-primary hover:underline"
            >
              Feed →
            </Link>
          </div>

          <div className="space-y-2.5">
            {telemetry.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-border bg-card p-3.5 text-xs space-y-1 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono font-bold text-foreground flex items-center gap-1.5">
                    <Radio className="h-3 w-3 text-emerald-600 shrink-0" />
                    {t.boxId}
                  </span>
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
            <DialogDescription className="text-xs">
              Record a visit, call, resupply, or counselling note.
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
              <Label className="text-xs font-semibold">Type</Label>
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
                    Counselling
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Intervention details..."
                className="text-xs min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={submitIntervention} className="text-xs font-bold">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
