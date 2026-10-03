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
import { PHASE_BOUNDARY_DAY, REGIMEN_DAYS } from "@/lib/tb-data";
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
    greeting: "Medication Overview",
    next: "Next scheduled dose in",
    streak: "Adherence Streak",
    progress: "Treatment Progress",
    takeNow: "Open your smart box when the alarm sounds and green LED illuminates.",
    support: "Request HSA Support",
    issue: "Report Pill Box Problem",
    calendar: "30-Day Adherence History",
    discreet: "Discreet Privacy Mode",
    discreetHint: "Hides medical terminology to protect screen privacy in public.",
    taken: "Today's Dose Recorded",
    pending: "Today's Dose Pending",
    phaseI: "Intensive Phase (Days 1–60)",
    phaseC: "Continuation Phase (Days 61–180)",
    tips: "Keep your smart box dry and charged. Your designated guardian is notified of dose events.",
  },
  ny: {
    greeting: "Mankhwala Anu Lero",
    next: "Mlingo wotsatira m'maora",
    streak: "Masiku Otsatizana Kwathunthu",
    progress: "Kupita Patsogolo kwa Chithandizo",
    takeNow: "Tsegulani bokosi lanu likalira ndi kuwala kobiriwira.",
    support: "Pemphani Thandizo kwa HSA",
    issue: "Nenani Vuto la Bokosi",
    calendar: "Mbiri ya Masiku 30 Apitawa",
    discreet: "Njira Yobisika Vuto",
    discreetHint: "Imabisa mawu a matenda pofuna kusunga chinsinsi pagulu.",
    taken: "Mlingo wa Lero Walembedwa",
    pending: "Mlingo wa Lero Sunalembedwe",
    phaseI: "Gawo Lolimba (Masiku 1–60)",
    phaseC: "Gawo Lopitiriza (Masiku 61–180)",
    tips: "Sungani bokosi malo ouma. Womuyang'anira wanu amadziwitsidwa mlingo uliwonse.",
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
      {/* Top Welcome Header */}
      <header className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            {discreetMode
              ? `Daily Check-In — ${patient.name.split(" ")[0]}`
              : `${t.greeting} — ${patient.name}`}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {discreetMode
              ? "Personal Health & Adherence Overview"
              : `Smart Box Serial: ${patient.boxId} · Facility: ${patient.facility}`}
          </p>
        </div>
      </header>

      {/* Discreet Mode Switch Card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="min-w-0">
          <Label className="flex items-center gap-2 text-xs font-bold text-foreground">
            <EyeOff className="h-4 w-4 text-emerald-600 shrink-0" />
            {t.discreet}
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground leading-normal">{t.discreetHint}</p>
        </div>
        <Switch checked={discreetMode} onCheckedChange={setDiscreetMode} />
      </div>

      {/* Dose Status & Countdown Main Card */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={todayDose && todayDose.status !== "missed" ? "secondary" : "destructive"}
              className="text-xs font-semibold px-3 py-1"
            >
              {todayDose && todayDose.status !== "missed" ? t.taken : t.pending}
            </Badge>
            <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
              {patient.treatmentDay <= PHASE_BOUNDARY_DAY ? t.phaseI : t.phaseC}
            </Badge>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t.next}
            </p>
            <p className="font-display text-4xl font-extrabold tabular-nums text-primary sm:text-5xl mt-1.5 tracking-tight">
              {countdown}
            </p>
            <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">
              {discreetMode ? t.tips : `${t.takeNow} (Daily window: ${patient.doseTime})`}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-2.5 border-t border-border">
            <Button
              size="sm"
              onClick={() => {
                raisePatientRequest(patient.id, "SUPPORT_REQUEST");
                toast.success("Support request submitted", {
                  description: `${hsa.name} (${hsa.phone}) has been notified.`,
                });
              }}
              className="text-xs font-bold"
            >
              <LifeBuoy className="mr-1.5 h-4 w-4" />
              {t.support}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                raisePatientRequest(patient.id, "BOX_ISSUE");
                toast.success("Pill box issue reported", {
                  description: `Box ${patient.boxId} flagged for clinical review.`,
                });
              }}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <AlertOctagon className="mr-1.5 h-4 w-4" />
              {t.issue}
            </Button>
          </div>
        </div>

        {/* Key KPI Metric Cards */}
        <div className="grid gap-4">
          <StatCard
            label={t.streak}
            value={`${streak(patient.id)} Days`}
            icon={Flame}
            tone="success"
            hint={`${streak(patient.id)} Consecutive Days Unbroken`}
          />
          <StatCard
            label="30-Day Adherence Rate"
            value={`${adherenceRate(patient.id)}%`}
            icon={CheckCircle2}
            tone={adherenceRate(patient.id) >= 85 ? "success" : "warning"}
          />
          <StatCard
            label="Scheduled Dose Window"
            value={patient.doseTime}
            icon={Clock}
            hint={discreetMode ? "Daily reminder set" : `Regimen: ${patient.regimen}`}
          />
        </div>
      </section>

      {/* Regimen Progress Timeline Bar */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-foreground">{t.progress}</h2>
          <span className="text-xs font-bold text-muted-foreground">
            Day {patient.treatmentDay} of {REGIMEN_DAYS} ({progress}%)
          </span>
        </div>
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground pt-1">
          <span>{t.phaseI}</span>
          <span>{t.phaseC}</span>
        </div>
      </section>

      {/* 30-Day Adherence Calendar Grid */}
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
