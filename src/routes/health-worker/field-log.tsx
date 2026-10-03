import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { healthWorkers, patients } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/health-worker/field-log")({
  head: () => ({
    meta: [{ title: "Field Intervention Log — Health Worker Portal" }],
  }),
  component: HealthWorkerFieldLog,
});

function HealthWorkerFieldLog() {
  const { interventions } = useTB();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Community Field Intervention Log
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit history of home visits, phone consultations, pill refills, and counselling
            sessions
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-bold">
          {interventions.length} Entries Logged
        </Badge>
      </header>

      <div className="space-y-3">
        {interventions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
            <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-bold text-foreground">No Field Interventions Logged Yet</p>
            <p className="text-xs text-muted-foreground">
              Use the "Log Field Action" button in the dashboard or patient profile to record
              entries.
            </p>
          </div>
        ) : (
          interventions.map((i) => {
            const p = patients.find((x) => x.id === i.patientId)!;
            const h = healthWorkers.find((x) => x.id === i.hsaId)!;
            return (
              <div
                key={i.id}
                className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-2.5 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="font-bold border-primary/30 text-primary bg-primary/5"
                    >
                      {i.type}
                    </Badge>
                    <Link
                      to="/health-worker/patients/$id"
                      params={{ id: p.id }}
                      className="font-bold text-foreground text-sm hover:underline hover:text-primary"
                    >
                      {p.name}
                    </Link>
                    <span className="text-muted-foreground font-medium">({p.facility})</span>
                  </div>
                  <span className="text-muted-foreground text-[11px] font-medium">
                    Logged on: <strong>{i.loggedAt}</strong> by <strong>{h?.name || "HSA"}</strong>
                  </span>
                </div>

                <p className="text-muted-foreground leading-relaxed font-medium">{i.notes}</p>

                <div className="pt-2 flex items-center gap-3 border-t border-border">
                  <a
                    href={`tel:${p.phone.replaceAll(" ", "")}`}
                    className="inline-flex items-center gap-1 font-bold text-primary hover:underline text-xs"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call Patient ({p.phone})
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
