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
    greeting: "Dashboard",
    next: "Next Dose In",
    streak: "Streak",
    progress: "Regimen Progress",
    support: "Request Support",
    issue: "Report Problem",
    calendar: "30-Day History",
    discreet: "Discreet Privacy Mode",
    taken: "Dose Taken Today",
    pending: "Dose Due Today",
    phaseI: "Intensive Phase",
    phaseC: "Continuation Phase",
  },
  ny: {
    greeting: "Mankhwala",
    next: "Mlingo Wotsatira",
    streak: "Motsatizana",
    progress: "Chithandizo",
    support: "Pemphani Thandizo",
    issue: "Nenani Vuto",
    calendar: "Masiku 30",
    discreet: "Njira Yobisika",
    taken: "Mlingo Walembedwa",
    pending: "Mlingo Wosatengedwa",
    phaseI: "Gawo Lolimba",
    phaseC: "Gawo Lopitiriza",
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
      {/* Top Header */}
      <header className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {discreetMode ? "Daily Care" : `${t.greeting} — ${patient.name}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 cursor-pointer">
            <EyeOff className="h-3.5 w-3.5" />
            {t.discreet}
          </Label>
          <Switch checked={discreetMode} onCheckedChange={setDiscreetMode} />
        </div>
      </header>

      {/* Primary Hero Status Card */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={todayDose && todayDose.status !== "missed" ? "secondary" : "destructive"}
              className="text-xs font-bold px-3 py-1"
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
            <p className="font-display text-5xl font-extrabold tabular-nums text-primary mt-1 tracking-tight">
              {countdown}
            </p>
          </div>

          <div className="pt-3 flex flex-wrap gap-2.5 border-t border-border">
            <Button
              size="sm"
              onClick={() => {
                raisePatientRequest(patient.id, "SUPPORT_REQUEST");
                toast.success("Request sent", { description: `${hsa.name} notified.` });
              }}
              className="text-xs font-bold"
            >
              <LifeBuoy className="mr-1.5 h-3.5 w-3.5" />
              {t.support}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                raisePatientRequest(patient.id, "BOX_ISSUE");
                toast.success("Problem reported", { description: `${patient.boxId} flagged.` });
              }}
              className="text-xs font-semibold"
            >
              <AlertOctagon className="mr-1.5 h-3.5 w-3.5" />
              {t.issue}
            </Button>
          </div>
        </div>

        {/* KPI Metrics Stack */}
        <div className="grid gap-4">
          <StatCard
            label={t.streak}
            value={`${streak(patient.id)} Days`}
            icon={Flame}
            tone="success"
          />
          <StatCard
            label="Adherence"
            value={`${adherenceRate(patient.id)}%`}
            icon={CheckCircle2}
            tone={adherenceRate(patient.id) >= 85 ? "success" : "warning"}
          />
          <StatCard label="Schedule Window" value={patient.doseTime} icon={Clock} />
        </div>
      </section>

      {/* Regimen Timeline */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-foreground">{t.progress}</h2>
          <span className="text-xs font-bold text-muted-foreground">
            Day {patient.treatmentDay} of {REGIMEN_DAYS} ({progress}%)
          </span>
        </div>
        <Progress value={progress} className="h-2.5" />
      </section>

      {/* 30-Day Adherence Calendar */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
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
