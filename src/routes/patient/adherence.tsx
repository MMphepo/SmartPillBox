import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { AdherenceCalendar, AdherenceLegend } from "@/components/tb/AdherenceCalendar";
import { useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/patient/adherence")({
  head: () => ({
    meta: [{ title: "30-Day Adherence Calendar — Patient Portal" }],
  }),
  component: PatientAdherence,
});

export function PatientAdherence() {
  const { user } = useAuth();
  const { patientById, patientDoses } = useTB();
  const assignedPatientId = user?.patientId || "pat-1";
  const patient = patientById(assignedPatientId);
  const doses = patientDoses(patient.id);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-emerald-600" />
          30-Day Adherence Calendar
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          History of dose openings auto-detected by your smart box over the last 30 days
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <AdherenceCalendar doses={doses.slice(-30)} />
        <AdherenceLegend />
      </div>
    </div>
  );
}
