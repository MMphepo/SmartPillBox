import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/health-worker/adherence")({
  head: () => ({
    meta: [{ title: "Device Telemetry Log — Health Worker Portal" }],
  }),
  component: HealthWorkerAdherence,
});

function HealthWorkerAdherence() {
  const { telemetry } = useTB();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Device Telemetry Log
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Incoming telemetry transmissions from smart pill box hardware devices
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-medium border-border">
          {telemetry.length} Events Received
        </Badge>
      </header>

      <div className="border border-border bg-card rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-semibold text-foreground">Box Serial</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Event Type</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Timestamp</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Payload Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {telemetry.map((t) => (
              <TableRow key={t.id} className="hover:bg-muted/20 transition-colors">
                <TableCell className="font-mono text-xs font-bold text-foreground">
                  {t.boxId}
                </TableCell>
                <TableCell className="text-xs">
                  <Badge
                    variant={t.event === "MISSED_DOSE_ALERT" ? "destructive" : "secondary"}
                    className="text-[10px] font-semibold"
                  >
                    {t.event}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(t.receivedAt).toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{t.raw}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
