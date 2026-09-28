import { createFileRoute } from "@tanstack/react-router";
import { User, Phone, ShieldCheck, Stethoscope, Building2 } from "lucide-react";
import { guardians, healthWorkers } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";

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
          Your personal record, assigned health worker, and designated family guardian
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <User className="h-5 w-5 text-emerald-600" />
            <h2 className="font-display text-base font-bold text-foreground">Personal Profile</h2>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Full Name:</span>
              <strong className="text-foreground">{patient.name}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Age & Sex:</span>
              <strong className="text-foreground">
                {patient.age} years old ({patient.sex})
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Facility Catchment:</span>
              <strong className="text-foreground flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" /> {patient.facility}
              </strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Phone Number:</span>
              <strong className="text-foreground">{patient.phone}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Smart Box Serial:</span>
              <strong className="font-mono text-foreground">{patient.boxId}</strong>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h2 className="font-display text-base font-bold text-foreground">
              Assigned Health Worker
            </h2>
          </div>

          {hsa ? (
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-foreground text-sm">{hsa.name}</p>
                <p className="text-muted-foreground">
                  {hsa.role} · {hsa.facility}
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={`tel:${hsa.phone.replaceAll(" ", "")}`}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" /> Call HSA ({hsa.phone})
                </a>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No HSA currently assigned.</p>
          )}
        </div>
      </div>

      {g && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            <h2 className="font-display text-base font-bold text-foreground">
              Designated Family Guardian
            </h2>
          </div>

          <div className="space-y-1 text-xs">
            <p className="font-semibold text-foreground text-sm">{g.name}</p>
            <p className="text-muted-foreground">Relation: {g.relation}</p>
            <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
              <Phone className="h-3.5 w-3.5" /> {g.phone}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
