import { createFileRoute } from "@tanstack/react-router";
import { Pill, AlertOctagon, LifeBuoy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { REGIMEN_DAYS, PHASE_BOUNDARY_DAY } from "@/lib/tb-data";
import { hsaForPatient, useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/patient/treatment")({
  head: () => ({
    meta: [{ title: "My Treatment Regimen — Patient Portal" }],
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

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          My Treatment Regimen
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Detailed overview of your 180-day course, phase transitions, and assigned smart pill box
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Pill className="h-5 w-5 text-emerald-600" />
            <h2 className="font-display text-base font-bold text-foreground">Regimen Details</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Standard Regimen:</span>
              <strong className="text-foreground">{patient.regimen}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Current Phase:</span>
              <strong className="text-foreground">{patient.phase} Phase</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Current Day:</span>
              <strong className="text-foreground">Day {patient.treatmentDay} of 180</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Scheduled Daily Dose Window:</span>
              <strong className="text-foreground">{patient.doseTime}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Assigned Facility:</span>
              <strong className="text-foreground">{patient.facility}</strong>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <h2 className="font-display text-base font-bold text-foreground">
              Smart Pill Box Hardware
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Box Serial Number:</span>
              <strong className="font-mono text-foreground">{patient.boxId}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Battery Level:</span>
              <strong className={patient.battery < 30 ? "text-destructive" : "text-emerald-600"}>
                {patient.battery}%
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">SMS Telemetry:</span>
              <strong className="text-emerald-600">Connected</strong>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                raisePatientRequest(patient.id, "SUPPORT_REQUEST");
                toast.success("Request sent to " + hsa.name);
              }}
              className="text-xs w-full justify-center"
            >
              <LifeBuoy className="mr-1.5 h-3.5 w-3.5" /> Request HSA Clinical Support
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                raisePatientRequest(patient.id, "BOX_ISSUE");
                toast.success("Box issue reported to clinic.");
              }}
              className="text-xs w-full justify-center text-amber-600 border-amber-200"
            >
              <AlertOctagon className="mr-1.5 h-3.5 w-3.5" /> Report Pill Box Hardware Problem
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
        <h2 className="font-display text-base font-bold text-foreground">
          180-Day Regimen Timeline
        </h2>
        <Progress value={progress} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Intensive Phase (Day 1 - {PHASE_BOUNDARY_DAY})</span>
          <span>Continuation Phase (Day 61 - {REGIMEN_DAYS})</span>
        </div>
      </div>
    </div>
  );
}
