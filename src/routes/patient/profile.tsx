import { createFileRoute } from "@tanstack/react-router";
import { User, Phone, Stethoscope, Building2, Radio } from "lucide-react";
import { healthWorkers } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/patient/profile")({
  head: () => ({
    meta: [{ title: "Profile — Patient Portal" }],
  }),
  component: PatientProfile,
});

export function PatientProfile() {
  const { user } = useAuth();
  const { patientById } = useTB();
  const assignedPatientId = user?.patientId || "pat-1";
  const patient = patientById(assignedPatientId);

  const hsa = healthWorkers.find((x) => x.id === patient.hsaId);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Profile */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <User className="h-5 w-5 text-emerald-600 shrink-0" />
            <h2 className="font-display text-base font-bold text-foreground">Personal Details</h2>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted-foreground font-medium">Full Name</span>
              <strong className="text-foreground font-bold">{patient.name}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted-foreground font-medium">Age / Sex</span>
              <strong className="text-foreground font-semibold">
                {patient.age} yrs ({patient.sex})
              </strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Facility
              </span>
              <strong className="text-foreground font-semibold">{patient.facility}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-primary" /> Phone
              </span>
              <strong className="text-foreground font-semibold">{patient.phone}</strong>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Radio className="h-3.5 w-3.5 text-primary" /> Box Serial
              </span>
              <strong className="font-mono text-foreground font-bold">{patient.boxId}</strong>
            </div>
          </div>
        </div>

        {/* Assigned Health Surveillance Assistant */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Stethoscope className="h-5 w-5 text-primary shrink-0" />
              <h2 className="font-display text-base font-bold text-foreground">Assigned HSA</h2>
            </div>

            {hsa ? (
              <div className="mt-4 space-y-2 text-xs bg-muted/30 p-3.5 rounded-xl border border-border">
                <p className="font-bold text-foreground text-sm">{hsa.name}</p>
                <p className="text-muted-foreground font-medium">
                  {hsa.role} · {hsa.facility}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">No HSA assigned.</p>
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
    </div>
  );
}
