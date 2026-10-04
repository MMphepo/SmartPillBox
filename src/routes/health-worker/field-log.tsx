import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
            Clinical visits, telephone follow-ups, counselling sessions, and resupplies
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold border-border">
          {interventions.length} Entries
        </Badge>
      </header>

      {interventions.length === 0 ? (
        <div className="border border-border bg-card p-8 rounded-md text-center text-xs text-muted-foreground">
          No field interventions recorded yet.
        </div>
      ) : (
        <div className="border border-border bg-card rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold text-foreground">Logged At</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Patient</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Intervention Type
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Health Worker
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Notes</TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Contact
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interventions.map((i) => {
                const p = patients.find((x) => x.id === i.patientId)!;
                const h = healthWorkers.find((x) => x.id === i.hsaId)!;
                return (
                  <TableRow key={i.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {i.loggedAt}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-foreground">
                      <Link
                        to="/health-worker/patients/$id"
                        params={{ id: p.id }}
                        className="hover:underline text-primary"
                      >
                        {p.name}
                      </Link>
                      <span className="block text-[11px] font-normal text-muted-foreground">
                        {p.facility}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {i.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {h?.name || "HSA"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                      {i.notes}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      <a
                        href={`tel:${p.phone.replaceAll(" ", "")}`}
                        className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs"
                      >
                        <Phone className="h-3 w-3" /> Call
                      </a>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
