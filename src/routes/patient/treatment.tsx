import { createFileRoute } from "@tanstack/react-router";
import { Pill, AlertOctagon, LifeBuoy, Radio, Clock, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
        <h1 className="font-display text-2xl font-bold text-foreground">Treatment Regimen</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Regimen Card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-emerald-600 shrink-0" />
              <h2 className="font-display text-base font-bold text-foreground">Specifications</h2>
            </div>
            <Badge
              variant={patient.phase === "Intensive" ? "destructive" : "secondary"}
              className="text-xs font-semibold"
            >
              {patient.phase} Phase
            </Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted-foreground font-medium">Standard Regimen</span>
              <strong className="text-foreground font-bold">{patient.regimen}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted-foreground font-medium">Progress</span>
              <strong className="text-foreground font-semibold">
                Day {patient.treatmentDay} of {REGIMEN_DAYS}
              </strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" /> Daily Window
              </span>
              <strong className="text-foreground font-semibold">{patient.doseTime}</strong>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Facility
              </span>
              <strong className="text-foreground font-semibold">{patient.facility}</strong>
            </div>
          </div>
        </div>

        {/* Smart Pill Box Details */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary shrink-0" />
                <h2 className="font-display text-base font-bold text-foreground">Smart Pill Box</h2>
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold">
                Connected
              </Badge>
            </div>

            <div className="space-y-2.5 text-xs mt-3">
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-muted-foreground font-medium">Box Serial</span>
                <strong className="font-mono text-foreground font-bold">{patient.boxId}</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-muted-foreground font-medium">Battery</span>
                <strong
                  className={
                    patient.battery < 30
                      ? "text-destructive font-bold"
                      : "text-emerald-600 font-bold"
                  }
                >
                  {patient.battery}%
                </strong>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                raisePatientRequest(patient.id, "SUPPORT_REQUEST");
                toast.success(`Request sent to HSA ${hsa.name}`);
              }}
              className="text-xs font-semibold flex-1 justify-center"
            >
              <LifeBuoy className="mr-1.5 h-3.5 w-3.5" /> Request Support
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                raisePatientRequest(patient.id, "BOX_ISSUE");
                toast.success("Problem reported.");
              }}
              className="text-xs font-semibold flex-1 justify-center"
            >
              <AlertOctagon className="mr-1.5 h-3.5 w-3.5" /> Report Issue
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-foreground">
            180-Day Regimen Progress
          </h2>
          <span className="text-xs font-bold text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2.5" />
        <div className="flex justify-between text-xs font-medium text-muted-foreground pt-1">
          <span>Intensive (Days 1–{PHASE_BOUNDARY_DAY})</span>
          <span>
            Continuation (Days {PHASE_BOUNDARY_DAY + 1}–{REGIMEN_DAYS})
          </span>
        </div>
      </div>
    </div>
  );
}
