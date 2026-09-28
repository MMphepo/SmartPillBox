import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hsaForPatient, useTB } from "@/lib/tb-store";
import { useAuth } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/guardian/alerts")({
  head: () => ({
    meta: [{ title: "Patient Alerts — Guardian Portal" }],
  }),
  component: GuardianAlerts,
});

export function GuardianAlerts() {
  const { user } = useAuth();
  const { patientById, alerts } = useTB();

  const assignedPatientId = user?.patientId || "pat-1";
  const patient = patientById(assignedPatientId);
  const hsa = hsaForPatient(patient.id);
  const patientAlerts = alerts.filter((a) => a.patientId === patient.id);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          Adherence & Box Alerts for {patient.name}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Notifications regarding missed doses, low battery warnings, or clinic updates
        </p>
      </header>

      {patientAlerts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
          <CheckCircle className="mx-auto h-8 w-8 text-emerald-500" />
          <h2 className="text-sm font-semibold text-foreground">No Active Alerts</h2>
          <p className="text-xs text-muted-foreground">
            Everything is on track with {patient.name}'s treatment.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {patientAlerts.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`h-4 w-4 ${a.resolved ? "text-muted-foreground" : "text-amber-500"}`}
                  />
                  <span className="font-bold text-sm text-foreground">
                    {a.kind.replaceAll("_", " ")}
                  </span>
                </div>
                <Badge variant={a.resolved ? "secondary" : "destructive"} className="text-[10px]">
                  {a.resolved ? "Resolved" : "Active Alert"}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground">{a.message}</p>

              {!a.resolved && (
                <div className="pt-2 border-t border-border flex justify-end">
                  <Button asChild size="sm" variant="outline" className="text-xs">
                    <a href={`tel:${hsa.phone.replaceAll(" ", "")}`}>
                      <Phone className="mr-1.5 h-3.5 w-3.5" /> Call HSA ({hsa.name})
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
