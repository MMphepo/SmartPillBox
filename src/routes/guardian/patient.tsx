import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Phone, ShieldCheck, Stethoscope, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { guardianForPatient, hsaForPatient, useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/guardian/patient")({
  head: () => ({
    meta: [{ title: "Supported Patient — Guardian Portal" }],
  }),
  component: GuardianPatientView,
});

export function GuardianPatientView() {
  const { user } = useAuth();
  const { patientById, adherenceRate, streak, markAssistedDose } = useTB();

  const assignedPatientId = user?.patientId || "pat-1";
  const patient = patientById(assignedPatientId);
  const guardian = guardianForPatient(patient.id);
  const hsa = hsaForPatient(patient.id);
  const rate = adherenceRate(patient.id);
  const currentStreak = streak(patient.id);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          Supported Patient Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Patient record and clinical triad contacts for <strong>{patient.name}</strong>
        </p>
      </header>

      {/* Patient Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{patient.name}</h2>
            <p className="text-xs text-muted-foreground">
              {patient.sex}, {patient.age} yrs old · Facility: <strong>{patient.facility}</strong>
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              markAssistedDose(patient.id);
              toast.success("Assisted dose confirmed for " + patient.name);
            }}
            className="text-xs"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Confirm Dose Taken
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-xs">
          <div className="rounded-lg bg-muted/40 p-3 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-semibold">
              Smart Box Serial
            </span>
            <p className="font-mono text-sm font-bold mt-0.5 text-foreground">{patient.boxId}</p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-semibold">
              Treatment Day
            </span>
            <p className="font-semibold text-sm mt-0.5 text-foreground">
              Day {patient.treatmentDay} of 180
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-semibold">
              30-Day Adherence
            </span>
            <p className="font-semibold text-sm mt-0.5 text-foreground">{rate}%</p>
            <Progress value={rate} className="h-1.5 mt-1.5" />
          </div>

          <div className="rounded-lg bg-muted/40 p-3 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-semibold">
              Streak
            </span>
            <p className="font-semibold text-sm mt-0.5 text-foreground">{currentStreak} Days</p>
          </div>
        </div>
      </div>

      {/* Triad Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <h3 className="font-display text-sm font-bold text-foreground">Your Guardian Record</h3>
          </div>
          <div className="text-xs space-y-1">
            <p className="font-semibold text-foreground">{guardian.name}</p>
            <p className="text-muted-foreground">Relation to patient: {guardian.relation}</p>
            <p className="text-muted-foreground">Phone: {guardian.phone}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">
              Assigned Health Worker
            </h3>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <p className="font-semibold text-foreground">{hsa.name}</p>
              <p className="text-muted-foreground">
                {hsa.role} · {hsa.facility}
              </p>
            </div>
            <a
              href={`tel:${hsa.phone.replaceAll(" ", "")}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Phone className="h-3.5 w-3.5" /> Call HSA ({hsa.phone})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
