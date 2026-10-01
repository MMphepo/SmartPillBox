import { createFileRoute } from "@tanstack/react-router";
import { Cpu, BatteryWarning, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { patients } from "@/lib/tb-data";

export const Route = createFileRoute("/admin/devices")({
  head: () => ({
    meta: [{ title: "Smart Pill Box Devices — Administrator Portal" }],
  }),
  component: AdminDevices,
});

function AdminDevices() {
  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          Smart Pill Box Hardware Fleet
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Inventory and operational telemetry status for deployed Smart Pill Box hardware modules
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <h2 className="font-display text-sm font-bold text-foreground">
              Hardware Inventory & Status
            </h2>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {patients.length} Units Online
          </Badge>
        </div>

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-semibold">Hardware Serial</TableHead>
              <TableHead className="text-xs font-semibold">Assigned Patient</TableHead>
              <TableHead className="text-xs font-semibold">Facility</TableHead>
              <TableHead className="text-xs font-semibold">Battery Charge</TableHead>
              <TableHead className="text-xs font-semibold">SMS Gateway Link</TableHead>
              <TableHead className="text-xs font-semibold text-right">Device State</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono font-bold text-xs text-foreground">
                  {p.boxId}
                </TableCell>
                <TableCell className="font-semibold text-xs text-foreground">{p.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.facility}</TableCell>
                <TableCell className="text-xs">
                  <span
                    className={`flex items-center gap-1 font-semibold ${p.battery < 30 ? "text-destructive" : "text-emerald-600"}`}
                  >
                    <BatteryWarning className="h-3.5 w-3.5" />
                    {p.battery}%
                  </span>
                </TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Radio className="h-3 w-3 text-emerald-500 animate-pulse" /> Linked
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={p.battery < 30 ? "destructive" : "secondary"}
                    className="text-[10px]"
                  >
                    {p.battery < 30 ? "Battery Low" : "Operational"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
