import { createFileRoute } from "@tanstack/react-router";
import { Phone } from "lucide-react";
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
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          Patient Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Personal details and assigned Health Surveillance Assistant
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Profile Details */}
        <div className="border border-border bg-card p-5 rounded-md space-y-4">
          <h2 className="font-display text-sm font-bold text-foreground border-b border-border pb-2">
            Personal Details
          </h2>

          <div className="space-y-2 text-xs divide-y divide-border">
            <div className="flex justify-between items-center py-1.5">
              <span className="text-muted-foreground font-medium">Full Name</span>
              <span className="text-foreground font-bold">{patient.name}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 pt-2">
              <span className="text-muted-foreground font-medium">Age / Sex</span>
              <span className="text-foreground font-semibold">
                {patient.age} yrs ({patient.sex})
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 pt-2">
              <span className="text-muted-foreground font-medium">Facility</span>
              <span className="text-foreground font-semibold">{patient.facility}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 pt-2">
              <span className="text-muted-foreground font-medium">Contact Phone</span>
              <span className="text-foreground font-semibold">{patient.phone}</span>
            </div>
          </div>
        </div>

        {/* Assigned HSA Contact */}
        <div className="border border-border bg-card p-5 rounded-md space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-sm font-bold text-foreground border-b border-border pb-2">
              Assigned Health Surveillance Assistant
            </h2>

            {hsa ? (
              <div className="mt-3 space-y-1 text-xs">
                <p className="font-bold text-foreground">{hsa.name}</p>
                <p className="text-muted-foreground">
                  {hsa.role} · {hsa.facility}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">No HSA assigned.</p>
            )}
          </div>

          {hsa && (
            <div className="pt-3 border-t border-border">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full text-xs font-semibold border-border justify-center h-8"
              >
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
