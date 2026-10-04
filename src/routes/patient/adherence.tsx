import { createFileRoute } from "@tanstack/react-router";
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
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          30-Day Medication Calendar
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Record of daily medication doses recorded over the past 30 days
        </p>
      </header>

      <div className="border border-border bg-card p-5 rounded-md space-y-5">
        <AdherenceCalendar doses={doses.slice(-30)} />
        <AdherenceLegend />
      </div>
    </div>
  );
}
