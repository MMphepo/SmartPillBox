import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { REGIMEN_DAYS, PHASE_BOUNDARY_DAY } from "@/lib/tb-data";
import { hsaForPatient, useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/patient/treatment")({
  head: () => ({
    meta: [{ title: "Treatment Regimen — Patient Portal" }],
  }),
  component: PatientTreatment,
});

export function PatientTreatment() {
  const { user } = useAuth();
  const { patientById, raisePatientRequest } = useTB();
  const assignedPatientId = user?.patientId || "pat-1";
  const patient = patientById(assignedPatientId);
  const hsa = hsaForPatient(patient.id);

  const progress = Math.round((patient.treatmentDay / REGIMEN_DAYS) * 100);
  const currentWeek = Math.ceil(patient.treatmentDay / 7);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          Treatment Regimen Overview
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          24-week anti-tuberculosis therapy schedule and support contact
        </p>
      </header>

      {/* Regimen Summary Table / Details */}
      <div className="border border-border bg-card p-5 rounded-md space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-display text-sm font-bold text-foreground">Regimen Specifications</h2>
          <Badge variant="outline" className="text-xs font-semibold border-border">
            {patient.phase} Phase
          </Badge>
        </div>

        <div className="space-y-2.5 text-xs divide-y divide-border">
          <div className="flex justify-between items-center py-1.5">
            <span className="text-muted-foreground font-medium">Treatment Regimen</span>
            <span className="text-foreground font-bold">{patient.regimen}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 pt-2">
            <span className="text-muted-foreground font-medium">Treatment Progress</span>
            <span className="text-foreground font-bold">
              Week {currentWeek} of 24 (Day {patient.treatmentDay} of {REGIMEN_DAYS})
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5 pt-2">
            <span className="text-muted-foreground font-medium">Daily Scheduled Time</span>
            <span className="text-foreground font-semibold">{patient.doseTime}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 pt-2">
            <span className="text-muted-foreground font-medium">Assigned Facility</span>
            <span className="text-foreground font-semibold">{patient.facility}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-border flex flex-col sm:flex-row gap-2.5 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              raisePatientRequest(patient.id, "SUPPORT_REQUEST");
              toast.success(`Support request sent to ${hsa.name}`);
            }}
            className="text-xs font-semibold flex-1 border-border"
          >
            Request Support
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              raisePatientRequest(patient.id, "BOX_ISSUE");
              toast.success("Problem reported.");
            }}
            className="text-xs font-semibold flex-1 border-border"
          >
            Report Box Problem
          </Button>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="border border-border bg-card p-5 rounded-md space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <h2 className="font-display text-sm font-bold text-foreground">
            180-Day Regimen Timeline
          </h2>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
          <span>Intensive Phase (Days 1–{PHASE_BOUNDARY_DAY})</span>
          <span>
            Continuation Phase (Days {PHASE_BOUNDARY_DAY + 1}–{REGIMEN_DAYS})
          </span>
        </div>
      </div>
    </div>
  );
}
