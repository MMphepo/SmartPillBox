import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, EyeOff, LifeBuoy, AlertOctagon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdherenceCalendar } from "@/components/tb/AdherenceCalendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { REGIMEN_DAYS } from "@/lib/tb-data";
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
    greeting: "Daily Care",
    next: "Next Dose Due",
    streak: "Consecutive Days",
    progress: "Treatment Progress",
    support: "Request Support",
    issue: "Report Box Problem",
    history: "Recent Medication History",
    discreet: "Discreet Privacy Mode",
    taken: "Dose Recorded Today",
    pending: "Dose Scheduled Today",
    markTaken: "Mark as Taken",
  },
  ny: {
    greeting: "Mankhwala",
    next: "Mlingo Wotsatira",
    streak: "Masiku Motsatizana",
    progress: "Chithandizo",
    support: "Pemphani Thandizo",
    issue: "Nenani Vuto",
    history: "Mbiri Ya Mankhwala",
    discreet: "Njira Yobisika",
    taken: "Mlingo Walembedwa",
    pending: "Mlingo Wosatengedwa",
    markTaken: "Lembani Kuti Mwamwa",
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
    streak,
    today,
    language,
    discreetMode,
    setDiscreetMode,
    raisePatientRequest,
    recordPatientDose,
  } = useTB();

  const assignedPatientId = user?.patientId || "pat-1";
  const patient = patientById(assignedPatientId);
  const t = copy[language];
  const countdown = useCountdown(patient.doseTime);
  const doses = patientDoses(patient.id);
  const todayDose = doses.find((d) => d.date === today);
  const hsa = hsaForPatient(patient.id);
  const progressPercent = Math.round((patient.treatmentDay / REGIMEN_DAYS) * 100);
  const currentWeek = Math.ceil(patient.treatmentDay / 7);

  const isTakenToday = todayDose && todayDose.status !== "missed";

  const handleMarkTaken = () => {
    recordPatientDose(patient.id, today, patient.doseTime);
    toast.success("Dose recorded", { description: "Your daily dose has been marked as taken." });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            {discreetMode ? "Daily Care Schedule" : `${t.greeting} · ${patient.name}`}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            TB Treatment Regimen · Day {patient.treatmentDay} of {REGIMEN_DAYS}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 cursor-pointer">
            <EyeOff className="h-3.5 w-3.5" />
            {t.discreet}
          </Label>
          <Switch checked={discreetMode} onCheckedChange={setDiscreetMode} />
        </div>
      </div>

      {/* 1. TODAY'S MEDICATION & NEXT DOSE */}
      <section className="border border-border bg-card p-5 sm:p-6 rounded-md space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-bold text-foreground">
              Today's Dose Schedule
            </h2>
            <Badge
              variant={isTakenToday ? "outline" : "destructive"}
              className="text-xs font-semibold border-border"
            >
              {isTakenToday ? t.taken : t.pending}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Scheduled Time: {patient.doseTime}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t.next}
            </p>
            <p className="font-display text-4xl sm:text-5xl font-extrabold tabular-nums text-foreground mt-1 tracking-tight">
              {countdown}
            </p>
          </div>

          <div className="shrink-0 space-y-2">
            {!isTakenToday ? (
              <Button
                onClick={handleMarkTaken}
                className="w-full sm:w-auto text-xs font-bold px-6 h-10"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t.markTaken}
              </Button>
            ) : (
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 px-4 py-2.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Dose recorded for today
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-border flex flex-wrap gap-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              raisePatientRequest(patient.id, "SUPPORT_REQUEST");
              toast.success("Support requested", { description: `${hsa.name} notified.` });
            }}
            className="text-xs font-medium border-border"
          >
            <LifeBuoy className="mr-1.5 h-3.5 w-3.5" />
            {t.support}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              raisePatientRequest(patient.id, "BOX_ISSUE");
              toast.success("Problem reported", {
                description: "Health surveillance assistant alerted.",
              });
            }}
            className="text-xs font-medium border-border"
          >
            <AlertOctagon className="mr-1.5 h-3.5 w-3.5" />
            {t.issue}
          </Button>
        </div>
      </section>

      {/* 2. TREATMENT PROGRESS */}
      <section className="border border-border bg-card p-5 rounded-md space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <h2 className="font-display text-sm font-bold text-foreground">{t.progress}</h2>
          <span className="text-muted-foreground">
            Week {currentWeek} of 24 ({progressPercent}%)
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
          <span>Day 1</span>
          <span>Consecutive Streak: {streak(patient.id)} Days</span>
          <span>Day {REGIMEN_DAYS}</span>
        </div>
      </section>

      {/* 3. RECENT MEDICATION HISTORY */}
      <section className="border border-border bg-card p-5 rounded-md space-y-4">
        <h2 className="font-display text-sm font-bold text-foreground">{t.history}</h2>
        <AdherenceCalendar doses={doses.slice(-30)} />
      </section>
    </div>
  );
}
