import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, User } from "lucide-react";
import { AdherenceCalendar, AdherenceLegend } from "@/components/tb/AdherenceCalendar";
import { useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/guardian/adherence")({
  head: () => ({
    meta: [{ title: "Adherence History — Guardian Portal" }],
  }),
  component: GuardianAdherence,
});

export function GuardianAdherence() {
  const { user } = useAuth();
  const { patientById, patientDoses } = useTB();

  const assignedPatientId = user?.patientId || "pat-1";
  const patient = patientById(assignedPatientId);
  const doses = patientDoses(patient.id);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-indigo-600 shrink-0" />
            30-Day Adherence Calendar
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dose activity auto-detected by smart box telemetry or verified by care supporters
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <User className="h-4 w-4" />
          <span>Patient: {patient.name}</span>
        </div>
      </header>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
        <AdherenceCalendar doses={doses.slice(-30)} />
        <AdherenceLegend />
      </div>
    </div>
  );
}
