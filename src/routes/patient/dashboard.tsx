import { createFileRoute } from "@tanstack/react-router";
import { AlertOctagon, CheckCircle2, Clock, EyeOff, Flame, LifeBuoy, Pill } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdherenceCalendar, AdherenceLegend } from "@/components/tb/AdherenceCalendar";
import { StatCard } from "@/components/tb/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { PHASE_BOUNDARY_DAY, REGIMEN_DAYS, patients } from "@/lib/tb-data";
import { hsaForPatient, useTB, type Language } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/patient/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Patient Portal" }],
  }),
  component: PatientDashboard,
});

const copy: Record<Language, Record<string, string>> = {
  en: {
    greeting: "Your treatment today",
    next: "Next dose in",
    streak: "Day streak",
    progress: "Regimen progress",
    takeNow: "Open your pill box when it beeps and the green light flashes.",
    support: "Request HSA Support",
    issue: "Report Issue with Pill Box",
    calendar: "Your last 30 days",
    discreet: "Discreet mode",
    discreetHint: "Hides medical wording so your screen stays private in public.",
    taken: "Today's dose recorded",
    pending: "Today's dose not yet recorded",
    phaseI: "Intensive phase (Days 1–60)",
    phaseC: "Continuation phase (Days 61–180)",
    tips: "Keep the box with you when travelling. Your guardian is notified of every dose.",
  },
  ny: {
    greeting: "Mankhwala anu lero",
    next: "Mlingo wotsatira mu",
    streak: "Masiku motsatizana",
    progress: "Kupita patsogolo kwa chithandizo",
    takeNow: "Tsegulani bokosi likalira ndi kuwala kobiriwira.",
    support: "Pemphani thandizo kwa HSA",
    issue: "Nenani vuto la bokosi la mankhwala",
    calendar: "Masiku 30 apitawa",
    discreet: "Njira yobisika",
    discreetHint: "Imabisa mawu a matenda kuti anthu ena asawone.",
    taken: "Mlingo wa lero walembedwa",
    pending: "Mlingo wa lero sunalembedwe",
    phaseI: "Gawo lolimba (Masiku 1–60)",
    phaseC: "Gawo lopitiriza (Masiku 61–180)",
    tips: "Tengani bokosi mukamayenda. Womuyang'anira amadziwitsidwa mlingo uliwonse.",
  },
};

function useCountdown(target: string) {
  const [label, setLabel] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const [h, m] = target.split(":").map(Number);
      const next = new Date(now);
      next.setHours(h, m, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      const diff = Math.max(0, next.getTime() - now.getTime());
      const hh = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setLabel(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return label;
}

function PatientDashboard() {
  const { user } = useAuth();
  const {
    patientById,
    patientDoses,
    adherenceRate,
    streak,
    today,
    language,
    discreetMode,
    setDiscreetMode,
    raisePatientRequest,
  } = useTB();

  // Bound strictly to assigned demo patient (user.patientId or 'pat-1')
  const assignedPatientId = user?.patientId || "pat-1";
  const patient = patientById(assignedPatientId);
  const t = copy[language];
  const countdown = useCountdown(patient.doseTime);
  const doses = patientDoses(patient.id);
  const todayDose = doses.find((d) => d.date === today);
  const hsa = hsaForPatient(patient.id);
  const progress = Math.round((patient.treatmentDay / REGIMEN_DAYS) * 100);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            {discreetMode
              ? `Hello, ${patient.name.split(" ")[0]}`
              : `${t.greeting} — ${patient.name}`}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {discreetMode
              ? "Daily Care Check-in"
              : `Smart Box: ${patient.boxId} · ${patient.facility}`}
          </p>
        </div>
      </header>

      {/* Discreet Mode Switch Card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Label className="flex items-center gap-2 text-xs font-semibold">
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            {t.discreet}
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.discreetHint}</p>
        </div>
        <Switch checked={discreetMode} onCheckedChange={setDiscreetMode} />
      </div>

      {/* Dose Status & Countdown Card */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={todayDose && todayDose.status !== "missed" ? "secondary" : "destructive"}
              className="text-xs"
            >
              {todayDose && todayDose.status !== "missed" ? t.taken : t.pending}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {patient.treatmentDay <= PHASE_BOUNDARY_DAY ? t.phaseI : t.phaseC}
            </Badge>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.next}
            </p>
            <p className="font-display text-4xl font-bold tabular-nums text-primary sm:text-5xl mt-1">
              {countdown}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {discreetMode ? t.tips : `${t.takeNow} (${patient.doseTime})`}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                raisePatientRequest(patient.id, "SUPPORT_REQUEST");
                toast.success("Request sent", { description: `${hsa.name} has been notified.` });
              }}
              className="text-xs"
            >
              <LifeBuoy className="mr-1.5 h-3.5 w-3.5" />
              {t.support}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                raisePatientRequest(patient.id, "BOX_ISSUE");
                toast.success("Issue reported", {
                  description: `${patient.boxId} flagged for review.`,
                });
              }}
              className="text-xs"
            >
              <AlertOctagon className="mr-1.5 h-3.5 w-3.5" />
              {t.issue}
            </Button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid gap-4">
          <StatCard
            label={t.streak}
            value={`${streak(patient.id)} days`}
            icon={Flame}
            tone="success"
            hint={`${streak(patient.id)} Days Continuous Dosing`}
          />
          <StatCard
            label="Adherence Rate"
            value={`${adherenceRate(patient.id)}%`}
            icon={CheckCircle2}
          />
          <StatCard
            label="Scheduled Dose Window"
            value={patient.doseTime}
            icon={Clock}
            hint={discreetMode ? "Daily reminder" : patient.regimen}
          />
        </div>
      </section>

      {/* Regimen Progress Bar */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-foreground">{t.progress}</h2>
          <span className="text-xs font-semibold text-muted-foreground">
            Day {patient.treatmentDay} of {REGIMEN_DAYS}
          </span>
        </div>
        <Progress value={progress} className="h-2.5" />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{t.phaseI}</span>
          <span>{t.phaseC}</span>
        </div>
      </section>

      {/* 30-Day Adherence Calendar */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-foreground">{t.calendar}</h2>
          <Pill className="h-4 w-4 text-emerald-600" />
        </div>
        <AdherenceCalendar doses={doses.slice(-30)} />
        <AdherenceLegend />
      </section>
    </div>
  );
}
