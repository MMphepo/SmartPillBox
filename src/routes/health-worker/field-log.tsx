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
            Field Intervention Log
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Record of home visits, calls, counselling, and resupplies
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold">
          {interventions.length} Entries
        </Badge>
      </header>

      <div className="space-y-3">
        {interventions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
            <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">No Interventions Logged</p>
            <p className="text-xs text-muted-foreground">
              Log actions directly from the dashboard or patient profile pages.
            </p>
          </div>
        ) : (
          interventions.map((i) => {
            const p = patients.find((x) => x.id === i.patientId)!;
            const h = healthWorkers.find((x) => x.id === i.hsaId)!;
            return (
              <div
                key={i.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2.5 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="font-medium border-primary/30 text-primary bg-primary/5"
                    >
                      {i.type}
                    </Badge>
                    <Link
                      to="/health-worker/patients/$id"
                      params={{ id: p.id }}
                      className="font-semibold text-foreground text-sm hover:underline"
                    >
                      {p.name}
                    </Link>
                    <span className="text-muted-foreground">({p.facility})</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">
                    {i.loggedAt} · {h?.name || "HSA"}
                  </span>
                </div>

                <p className="text-muted-foreground leading-relaxed">{i.notes}</p>

                <div className="pt-2 flex items-center gap-3 border-t border-border">
                  <a
                    href={`tel:${p.phone.replaceAll(" ", "")}`}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs"
                  >
                    <Phone className="h-3.5 w-3.5" /> {p.phone}
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
