import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  HandHeart,
  MessageSquare,
  Phone,
  PlaneTakeoff,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { AdherenceCalendar, AdherenceLegend } from "@/components/tb/AdherenceCalendar";
import { StatCard } from "@/components/tb/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { patients } from "@/lib/tb-data";
import { guardianForPatient, hsaForPatient, useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/guardian")({
  head: () => ({
    meta: [
      { title: "Guardian Portal — Malawi MoH TB Adherence Portal" },
      {
        name: "description",
        content:
          "Treatment supporter portal: see whether today's TB dose was taken, confirm assisted doses and reach the assigned health worker.",
      },
      { property: "og:title", content: "Guardian Portal — Malawi MoH TB Adherence Portal" },
      {
        property: "og:description",
        content: "Support a relative through TB treatment with live dose alerts and one-tap confirmation.",
      },
    ],
  }),
  component: GuardianPortal,
});

const tips = [
  "Watch the pill box light at the same time each day and stay nearby until the dose is swallowed.",
  "Nausea and orange urine are common early on — reassure, do not stop the medicine.",
  "Report yellow eyes, rash, or numb feet to the HSA immediately; these need review.",
  "Keep the box charged and out of direct sun; a flat battery stops the clinic from seeing doses.",
];

function GuardianPortal() {
  const {
    activePatientId,
    setActivePatientId,
    patientById,
    patientDoses,
    adherenceRate,
    streak,
    today,
    alerts,
    markAssistedDose,
    logIntervention,
  } = useTB();

  const patient = patientById(activePatientId);
  const guardian = guardianForPatient(patient.id);
  const hsa = hsaForPatient(patient.id);
  const doses = patientDoses(patient.id);
  const todayDose = doses.find((d) => d.date === today);
  const feed = [...doses].reverse().slice(0, 8);
  const patientAlerts = alerts.filter((a) => a.patientId === patient.id && !a.resolved);

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold sm:text-2xl">
            Guardian Portal — {guardian.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Treatment supporter ({guardian.relation}) for {patient.name}
          </p>
        </div>
        <Select value={activePatientId} onValueChange={setActivePatientId}>
          <SelectTrigger className="w-full shrink-0 sm:w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <section className="card-surface p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold">Linked patient</h2>
          <Badge variant={patient.phase === "Intensive" ? "destructive" : "secondary"}>
            {patient.phase} phase
          </Badge>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Patient</p>
            <p className="font-semibold">{patient.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Smart box serial</p>
            <p className="font-mono text-sm font-semibold">{patient.boxId}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Treatment day</p>
            <p className="font-semibold">{patient.treatmentDay} of 180</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Today"
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
          hint={todayDose ? `${todayDose.time} · ${todayDose.source}` : `Scheduled ${patient.doseTime}`}
        />
        <StatCard label="Streak" value={`${streak(patient.id)} days`} icon={HandHeart} tone="success" />
        <StatCard label="30-day adherence" value={`${adherenceRate(patient.id)}%`} icon={ShieldCheck} />
      </section>

      {patientAlerts.length > 0 ? (
        <section className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
          <h2 className="font-display text-base font-bold text-destructive">Active alerts</h2>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            {patientAlerts.map((a) => (
              <li key={a.id}>• {a.message}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card-surface p-5">
        <h2 className="font-display text-lg font-bold">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            onClick={() => {
              markAssistedDose(patient.id);
              toast.success("Assisted dose confirmed", {
                description: `Logged as guardian-verified for ${patient.name}.`,
              });
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm Patient Took Medication
          </Button>
          <Button asChild variant="outline">
            <a href={`tel:${hsa.phone.replaceAll(" ", "")}`}>
              <Phone className="h-4 w-4" />
              Call {hsa.name}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={`sms:${hsa.phone.replaceAll(" ", "")}`}>
              <MessageSquare className="h-4 w-4" />
              SMS health worker
            </a>
          </Button>
          <Button
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
          >
            <PlaneTakeoff className="h-4 w-4" />
            Log Travel / Clinic Visit
          </Button>
        </div>
      </section>

      <section className="card-surface p-5">
        <h2 className="font-display text-lg font-bold">Daily adherence feed</h2>
        <ul className="mt-3 space-y-2">
          {feed.map((d) => (
            <li
              key={d.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {d.date === today ? "Today" : d.date} · {d.time}
                </p>
                <p className="text-xs text-muted-foreground">
                  {d.source === "smartbox"
                    ? "Auto-detected by smart pill box (SMS)"
                    : d.source === "guardian"
                      ? "Guardian verified"
                      : d.source === "hsa"
                        ? "Logged by health worker"
                        : "No dose opening detected"}
                </p>
              </div>
              <Badge
                variant={
                  d.status === "missed" ? "destructive" : d.status === "late" ? "outline" : "secondary"
                }
              >
                {d.status === "missed" ? "Missed" : d.status === "late" ? "Late" : "Taken"}
              </Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-surface p-5">
        <h2 className="font-display text-lg font-bold">Shared 30-day calendar</h2>
        <div className="mt-4">
          <AdherenceCalendar doses={doses.slice(-30)} />
        </div>
        <div className="mt-4">
          <AdherenceLegend />
        </div>
      </section>

      <section className="card-surface p-5">
        <h2 className="font-display text-lg font-bold">Supporting your relative</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {tip}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
