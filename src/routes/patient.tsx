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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PHASE_BOUNDARY_DAY, REGIMEN_DAYS, patients } from "@/lib/tb-data";
import { hsaForPatient, useTB, type Language } from "@/lib/tb-store";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [
      { title: "My Treatment — Malawi MoH TB Adherence Portal" },
      {
        name: "description",
        content:
          "Patient portal for TB treatment: next dose countdown, adherence streak, 180-day regimen progress and direct HSA support.",
      },
      { property: "og:title", content: "My Treatment — Malawi MoH TB Adherence Portal" },
      {
        property: "og:description",
        content: "Track your daily TB dose, see your streak and ask your health worker for support.",
      },
    ],
  }),
  component: PatientPortal,
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

function PatientPortal() {
  const {
    activePatientId,
    setActivePatientId,
    patientById,
    patientDoses,
    adherenceRate,
    streak,
    today,
    language,
    setLanguage,
    discreetMode,
    setDiscreetMode,
    raisePatientRequest,
  } = useTB();

  const patient = patientById(activePatientId);
  const t = copy[language];
  const countdown = useCountdown(patient.doseTime);
  const doses = patientDoses(patient.id);
  const todayDose = doses.find((d) => d.date === today);
  const hsa = hsaForPatient(patient.id);
  const progress = Math.round((patient.treatmentDay / REGIMEN_DAYS) * 100);

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold sm:text-2xl">
            {discreetMode ? `Hello, ${patient.name.split(" ")[0]}` : `${t.greeting} — ${patient.name}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {discreetMode ? "Daily check-in" : `${patient.boxId} · ${patient.facility}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ny">Chichewa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="card-surface grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
        <div className="min-w-0">
          <Label className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            {t.discreet}
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">{t.discreetHint}</p>
        </div>
        <Switch checked={discreetMode} onCheckedChange={setDiscreetMode} />
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={todayDose && todayDose.status !== "missed" ? "secondary" : "destructive"}>
              {todayDose && todayDose.status !== "missed" ? t.taken : t.pending}
            </Badge>
            <Badge variant="outline">
              {patient.treatmentDay <= PHASE_BOUNDARY_DAY ? t.phaseI : t.phaseC}
            </Badge>
          </div>
          <p className="mt-6 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {t.next}
          </p>
          <p className="font-display text-5xl font-bold tabular-nums text-primary sm:text-6xl">
            {countdown}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {discreetMode ? t.tips : `${t.takeNow} (${patient.doseTime})`}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                raisePatientRequest(patient.id, "SUPPORT_REQUEST");
                toast.success("Request sent", { description: `${hsa.name} has been notified.` });
              }}
            >
              <LifeBuoy className="h-4 w-4" />
              {t.support}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                raisePatientRequest(patient.id, "BOX_ISSUE");
                toast.success("Issue reported", { description: `${patient.boxId} flagged for review.` });
              }}
            >
              <AlertOctagon className="h-4 w-4" />
              {t.issue}
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <StatCard
            label={t.streak}
            value={`${streak(patient.id)} days`}
            icon={Flame}
            tone="success"
            hint={`${streak(patient.id)} Days Continuous Dosing!`}
          />
          <StatCard label="Adherence" value={`${adherenceRate(patient.id)}%`} icon={CheckCircle2} />
          <StatCard
            label="Scheduled time"
            value={patient.doseTime}
            icon={Clock}
            hint={discreetMode ? "Daily reminder" : patient.regimen}
          />
        </div>
      </section>

      <section className="card-surface p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="truncate font-display text-lg font-bold">{t.progress}</h2>
          <span className="shrink-0 text-sm text-muted-foreground">
            Day {patient.treatmentDay} / {REGIMEN_DAYS}
          </span>
        </div>
        <Progress value={progress} className="mt-3 h-3" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{t.phaseI}</span>
          <span>{t.phaseC}</span>
        </div>
      </section>

      <section className="card-surface p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="truncate font-display text-lg font-bold">{t.calendar}</h2>
          <Pill className="h-5 w-5 shrink-0 text-primary" />
        </div>
        <div className="mt-4">
          <AdherenceCalendar doses={doses.slice(-30)} />
        </div>
        <div className="mt-4">
          <AdherenceLegend />
        </div>
      </section>

      <section className="card-surface p-5">
        <h2 className="font-display text-lg font-bold">Demo: view another patient</h2>
        <Select value={activePatientId} onValueChange={setActivePatientId}>
          <SelectTrigger className="mt-3"><SelectValue /></SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name} — {p.boxId}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>
    </div>
  );
}
