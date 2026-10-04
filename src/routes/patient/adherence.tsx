import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { AdherenceCalendar, AdherenceLegend } from "@/components/tb/AdherenceCalendar";
import { useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/patient/adherence")({
  head: () => ({
    meta: [{ title: "30-Day Calendar — Patient Portal" }],
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
      <header className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-emerald-600 shrink-0" />
            30-Day Adherence
          </h1>
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-2xs space-y-5">
        <AdherenceCalendar doses={doses.slice(-30)} />
        <AdherenceLegend />
      </div>
    </div>
  );
}
