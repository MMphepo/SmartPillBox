import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  HandHeart,
  MessageSquare,
  Phone,
  PlaneTakeoff,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { StatCard } from "@/components/tb/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { guardianForPatient, hsaForPatient, useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/guardian/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Guardian Portal" }],
  }),
  component: GuardianDashboard,
});

function GuardianDashboard() {
  const { user } = useAuth();
  const {
    patientById,
    patientDoses,
    adherenceRate,
    streak,
    today,
    alerts,
    markAssistedDose,
    logIntervention,
  } = useTB();

  const assignedPatientId = user?.patientId || "pat-1";
  const patient = patientById(assignedPatientId);
  const guardian = guardianForPatient(patient.id);
  const hsa = hsaForPatient(patient.id);
  const doses = patientDoses(patient.id);
  const todayDose = doses.find((d) => d.date === today);
  const feed = [...doses].reverse().slice(0, 5);
  const patientAlerts = alerts.filter((a) => a.patientId === patient.id && !a.resolved);

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <header className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Treatment Supporter Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Logged in as <strong>{guardian.name}</strong> ({guardian.relation}) for{" "}
            <strong>{patient.name}</strong> · {patient.facility}
          </p>
        </div>
      </header>

      {/* Supported Relative Overview Banner */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
            <h2 className="font-display text-base font-bold text-foreground">
              Supported Patient Record
            </h2>
          </div>
          <Badge
            variant={patient.phase === "Intensive" ? "destructive" : "secondary"}
            className="text-xs font-semibold"
          >
            {patient.phase} Phase
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="bg-muted/30 p-3 rounded-lg border border-border">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Patient Name
            </p>
            <p className="font-bold text-sm text-foreground mt-0.5">{patient.name}</p>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border border-border">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Smart Box Serial
            </p>
            <p className="font-mono text-sm font-bold text-foreground mt-0.5">{patient.boxId}</p>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border border-border">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Regimen Schedule
            </p>
            <p className="font-semibold text-sm text-foreground mt-0.5">
              Day {patient.treatmentDay} of 180
            </p>
          </div>
        </div>
      </section>

      {/* Daily Metrics Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Today's Dose Status"
          value={
            todayDose
              ? todayDose.status === "missed"
                ? "Dose Missed"
                : todayDose.status === "late"
                  ? "Taken Late"
                  : "Dose Taken"
              : "Awaiting Dose"
          }
          icon={CheckCircle2}
          tone={todayDose && todayDose.status !== "missed" ? "success" : "danger"}
          hint={
            todayDose
              ? `${todayDose.time} · ${todayDose.source === "smartbox" ? "Smart Box" : "Guardian"}`
              : `Scheduled window: ${patient.doseTime}`
          }
        />
        <StatCard
          label="Adherence Streak"
          value={`${streak(patient.id)} Days`}
          icon={HandHeart}
          tone="success"
          hint="Continuous dosing"
        />
        <StatCard
          label="30-Day Adherence"
          value={`${adherenceRate(patient.id)}%`}
          icon={ShieldCheck}
          tone={adherenceRate(patient.id) >= 85 ? "success" : "warning"}
        />
      </section>

      {/* Active Attention Alerts */}
      {patientAlerts.length > 0 && (
        <section className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <h2 className="font-display text-sm font-bold text-destructive">
              Active Attention Alerts ({patientAlerts.length})
            </h2>
          </div>
          <ul className="space-y-1.5 text-xs font-medium text-foreground">
            {patientAlerts.map((a) => (
              <li key={a.id} className="flex items-start gap-2">
                <span className="text-destructive font-bold">•</span>
                <span>{a.message}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Action Center */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h2 className="font-display text-base font-bold text-foreground">Guardian Action Center</h2>
        <div className="flex flex-wrap gap-2.5">
          <Button
            size="sm"
            onClick={() => {
              markAssistedDose(patient.id);
              toast.success("Assisted dose confirmed", {
                description: `Logged as guardian-verified for ${patient.name}.`,
              });
            }}
            className="text-xs font-bold"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Confirm Dose Taken
          </Button>
          <Button asChild size="sm" variant="outline" className="text-xs font-semibold">
            <a href={`tel:${hsa.phone.replaceAll(" ", "")}`}>
              <Phone className="mr-1.5 h-3.5 w-3.5" />
              Call HSA ({hsa.name})
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="text-xs font-semibold">
            <a href={`sms:${hsa.phone.replaceAll(" ", "")}`}>
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              SMS HSA
            </a>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              logIntervention({
                patientId: patient.id,
                hsaId: patient.hsaId,
                type: "Phone check-in",
                notes: `${guardian.name} logged travel / clinic visit check-in for ${patient.name}.`,
              });
              toast.success("Travel check-in logged successfully");
            }}
            className="text-xs font-semibold"
          >
            <PlaneTakeoff className="mr-1.5 h-3.5 w-3.5" />
            Log Travel Check-In
          </Button>
        </div>
      </section>

      {/* Recent Dose Activity Feed */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-display text-base font-bold text-foreground">Recent Dose History</h2>
          <Link
            to="/guardian/adherence"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            View 30-Day Calendar <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ul className="space-y-2.5 text-xs">
          {feed.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-lg border border-border p-3.5 bg-muted/20"
            >
              <div>
                <p className="font-bold text-foreground">
                  {d.date === today ? "Today" : d.date} · {d.time}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                  {d.source === "smartbox"
                    ? "Detected by Smart Pill Box (SMS Telemetry)"
                    : d.source === "guardian"
                      ? "Verified by Guardian"
                      : d.source === "hsa"
                        ? "Logged by Health Worker"
                        : "No opening recorded"}
                </p>
              </div>
              <Badge
                variant={
                  d.status === "missed"
                    ? "destructive"
                    : d.status === "late"
                      ? "outline"
                      : "secondary"
                }
                className="text-[10px] font-bold uppercase px-2.5 py-0.5"
              >
                {d.status === "missed" ? "Missed" : d.status === "late" ? "Late" : "Taken"}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
