import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Phone, ShieldCheck, Stethoscope, Building2, Radio } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
          Patient record and care triad details for <strong>{patient.name}</strong>
        </p>
      </header>

      {/* Main Patient Demographics & Action Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-foreground">{patient.name}</h2>
              <Badge
                variant={patient.phase === "Intensive" ? "destructive" : "secondary"}
                className="text-xs font-semibold"
              >
                {patient.phase} Phase
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {patient.sex}, {patient.age} years old · Catchment:{" "}
              <strong>{patient.facility}</strong>
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => {
              markAssistedDose(patient.id);
              toast.success("Assisted dose confirmed", {
                description: `Recorded as guardian-verified for ${patient.name}.`,
              });
            }}
            className="text-xs font-bold"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Confirm Dose Taken Today
          </Button>
        </div>

        {/* Clinical Grid Indicators */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-xs">
          <div className="rounded-lg bg-muted/40 p-3.5 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
              <Radio className="h-3 w-3 text-primary" /> Smart Box Serial
            </span>
            <p className="font-mono text-sm font-bold mt-1 text-foreground">{patient.boxId}</p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3.5 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              Treatment Progress
            </span>
            <p className="font-semibold text-sm mt-1 text-foreground">
              Day {patient.treatmentDay} of 180
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3.5 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              30-Day Adherence
            </span>
            <p className="font-semibold text-sm mt-1 text-foreground">{rate}%</p>
            <Progress value={rate} className="h-1.5 mt-2" />
          </div>

          <div className="rounded-lg bg-muted/40 p-3.5 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              Current Streak
            </span>
            <p className="font-semibold text-sm mt-1 text-foreground">
              {currentStreak} Days Unbroken
            </p>
          </div>
        </div>
      </div>

      {/* Triad Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
            <h3 className="font-display text-sm font-bold text-foreground">
              Designated Guardian Record
            </h3>
          </div>
          <div className="text-xs space-y-2 bg-muted/30 p-3 rounded-lg border border-border">
            <p className="font-bold text-foreground text-sm">{guardian.name}</p>
            <p className="text-muted-foreground">
              Relation: <strong>{guardian.relation}</strong>
            </p>
            <p className="text-muted-foreground flex items-center gap-1.5 pt-1">
              <Phone className="h-3.5 w-3.5 text-primary" /> {guardian.phone}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Stethoscope className="h-5 w-5 text-primary shrink-0" />
              <h3 className="font-display text-sm font-bold text-foreground">
                Assigned Health Surveillance Assistant
              </h3>
            </div>
            <div className="text-xs space-y-2 mt-3 bg-muted/30 p-3 rounded-lg border border-border">
              <p className="font-bold text-foreground text-sm">{hsa.name}</p>
              <p className="text-muted-foreground">
                {hsa.role} · {hsa.facility}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <Button asChild size="sm" className="w-full text-xs font-bold justify-center">
              <a href={`tel:${hsa.phone.replaceAll(" ", "")}`}>
                <Phone className="mr-1.5 h-3.5 w-3.5" /> Call HSA ({hsa.phone})
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
