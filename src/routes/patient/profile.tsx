import { createFileRoute } from "@tanstack/react-router";
import { User, Phone, ShieldCheck, Stethoscope, Building2, Radio } from "lucide-react";
import { guardians, healthWorkers } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/patient/profile")({
  head: () => ({
    meta: [{ title: "Profile & HSA Info — Patient Portal" }],
  }),
  component: PatientProfile,
});

export function PatientProfile() {
  const { user } = useAuth();
  const { patientById } = useTB();
  const assignedPatientId = user?.patientId || "pat-1";
  const patient = patientById(assignedPatientId);

  const g = guardians.find((x) => x.patientId === patient.id);
  const hsa = healthWorkers.find((x) => x.id === patient.hsaId);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          Patient Profile & Care Contacts
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your personal record, assigned health surveillance assistant, and designated guardian
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Demographics */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <User className="h-5 w-5 text-emerald-600 shrink-0" />
            <h2 className="font-display text-base font-bold text-foreground">Personal Record</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted-foreground font-medium">Full Name:</span>
              <strong className="text-foreground font-bold">{patient.name}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted-foreground font-medium">Age & Sex:</span>
              <strong className="text-foreground font-semibold">
                {patient.age} years old ({patient.sex})
              </strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Facility Catchment:
              </span>
              <strong className="text-foreground font-semibold">{patient.facility}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-primary" /> Phone Number:
              </span>
              <strong className="text-foreground font-semibold">{patient.phone}</strong>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Radio className="h-3.5 w-3.5 text-primary" /> Smart Box Serial:
              </span>
              <strong className="font-mono text-foreground font-bold">{patient.boxId}</strong>
            </div>
          </div>
        </div>

        {/* Assigned Health Surveillance Assistant */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Stethoscope className="h-5 w-5 text-primary shrink-0" />
              <h2 className="font-display text-base font-bold text-foreground">
                Assigned Health Worker
              </h2>
            </div>

            {hsa ? (
              <div className="mt-4 space-y-3 text-xs">
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border">
                  <p className="font-bold text-foreground text-sm">{hsa.name}</p>
                  <p className="text-muted-foreground font-medium">
                    {hsa.role} · {hsa.facility}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">No HSA currently assigned.</p>
            )}
          </div>

          {hsa && (
            <div className="pt-3 border-t border-border">
              <Button asChild size="sm" className="w-full text-xs font-bold justify-center">
                <a href={`tel:${hsa.phone.replaceAll(" ", "")}`}>
                  <Phone className="mr-2 h-3.5 w-3.5" /> Call HSA ({hsa.phone})
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Designated Family Guardian */}
      {g && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
            <h2 className="font-display text-base font-bold text-foreground">
              Designated Family Guardian / Supporter
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-xs bg-muted/30 p-3 rounded-lg border border-border">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Guardian Name
              </span>
              <p className="font-bold text-sm text-foreground mt-0.5">{g.name}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Relationship to Patient
              </span>
              <p className="font-semibold text-xs text-foreground mt-0.5">{g.relation}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Contact Phone
              </span>
              <p className="font-semibold text-xs text-foreground mt-0.5">{g.phone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
