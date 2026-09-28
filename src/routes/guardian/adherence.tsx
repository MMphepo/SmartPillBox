import { createFileRoute } from "@tanstack/react-router";
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
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          30-Day Adherence History for {patient.name}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Calendar overview of doses auto-detected by smart box or verified by guardian
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <AdherenceCalendar doses={doses.slice(-30)} />
        <AdherenceLegend />
      </div>
    </div>
  );
}
