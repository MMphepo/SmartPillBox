import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  HandHeart,
  MessageSquare,
  Phone,
  PlaneTakeoff,
  ShieldCheck,
  ArrowRight,
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

  // Bound strictly to assigned patient for guardian (user.patientId or 'pat-1')
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
      <header className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Guardian Dashboard — {guardian.name}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Treatment supporter ({guardian.relation}) for <strong>{patient.name}</strong> (
            {patient.facility})
          </p>
        </div>
      </header>

      {/* Linked Patient Summary Banner */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <h2 className="font-display text-base font-bold text-foreground">Supported Relative</h2>
          </div>
          <Badge
            variant={patient.phase === "Intensive" ? "destructive" : "secondary"}
            className="text-xs"
          >
            {patient.phase} Phase
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">
              Patient Name
            </p>
            <p className="font-bold text-sm text-foreground">{patient.name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">
              Smart Box Serial
            </p>
            <p className="font-mono text-sm font-semibold text-foreground">{patient.boxId}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Regimen Day</p>
            <p className="font-semibold text-sm text-foreground">
              Day {patient.treatmentDay} of 180
            </p>
          </div>
        </div>
      </section>

      {/* Daily Status Metrics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Today's Dose Status"
          value={
            todayDose
              ? todayDose.status === "missed"
                ? "Dose missed"
                : todayDose.status === "late"
                  ? "Taken late"
                  : "Dose taken"
              : "Awaiting dose"
          }
          icon={CheckCircle2}
          tone={todayDose && todayDose.status !== "missed" ? "success" : "danger"}
          hint={
            todayDose
              ? `${todayDose.time} · ${todayDose.source}`
              : `Scheduled window: ${patient.doseTime}`
          }
        />
        <StatCard
          label="Dosing Streak"
          value={`${streak(patient.id)} days`}
          icon={HandHeart}
          tone="success"
        />
        <StatCard
          label="30-Day Adherence"
          value={`${adherenceRate(patient.id)}%`}
          icon={ShieldCheck}
        />
      </section>

      {/* Active Alerts if any */}
      {patientAlerts.length > 0 && (
        <section className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 space-y-2">
          <h2 className="font-display text-sm font-bold text-destructive">
            Active Attention Alerts
          </h2>
          <ul className="space-y-1 text-xs text-foreground">
            {patientAlerts.map((a) => (
              <li key={a.id}>• {a.message}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Quick Action Controls */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <h2 className="font-display text-base font-bold text-foreground">Guardian Action Center</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => {
              markAssistedDose(patient.id);
              toast.success("Assisted dose confirmed", {
                description: `Logged as guardian-verified for ${patient.name}.`,
              });
            }}
            className="text-xs"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Confirm Patient Took Medication
          </Button>
          <Button asChild size="sm" variant="outline" className="text-xs">
            <a href={`tel:${hsa.phone.replaceAll(" ", "")}`}>
              <Phone className="mr-1.5 h-3.5 w-3.5" />
              Call HSA ({hsa.name})
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="text-xs">
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
                notes: `${guardian.name} logged travel / clinic visit for ${patient.name}.`,
              });
              toast.success("Travel / clinic visit logged");
            }}
            className="text-xs"
          >
            <PlaneTakeoff className="mr-1.5 h-3.5 w-3.5" />
            Log Travel / Clinic Visit
          </Button>
        </div>
      </section>

      {/* Daily Adherence Feed */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="font-display text-base font-bold text-foreground">Recent Dose Activity</h2>
          <Link
            to="/guardian/adherence"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Full 30-Day History <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <ul className="space-y-2 text-xs">
          {feed.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20"
            >
              <div>
                <p className="font-semibold text-foreground">
                  {d.date === today ? "Today" : d.date} · {d.time}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {d.source === "smartbox"
                    ? "Detected by Smart Pill Box (SMS)"
                    : d.source === "guardian"
                      ? "Guardian verified"
                      : d.source === "hsa"
                        ? "Logged by Health Worker"
                        : "No opening detected"}
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
                className="text-[10px]"
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
