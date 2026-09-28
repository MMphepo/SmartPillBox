import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Phone } from "lucide-react";
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
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          Community Field Intervention Log
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          History of home visits, phone check-ins, pill resupplies, and counselling sessions logged
          by HSAs
        </p>
      </header>

      <div className="space-y-3">
        {interventions.map((i) => {
          const p = patients.find((x) => x.id === i.patientId)!;
          const h = healthWorkers.find((x) => x.id === i.hsaId)!;
          return (
            <div
              key={i.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-semibold">
                    {i.type}
                  </Badge>
                  <span className="font-bold text-foreground text-sm">{p.name}</span>
                  <span className="text-muted-foreground">({p.facility})</span>
                </div>
                <span className="text-muted-foreground text-[11px]">
                  Logged on: {i.loggedAt} by {h?.name}
                </span>
              </div>

              <p className="text-muted-foreground leading-relaxed">{i.notes}</p>

              <div className="pt-1 flex items-center gap-3">
                <a
                  href={`tel:${p.phone.replaceAll(" ", "")}`}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline text-xs"
                >
                  <Phone className="h-3 w-3" /> Call Patient ({p.phone})
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
