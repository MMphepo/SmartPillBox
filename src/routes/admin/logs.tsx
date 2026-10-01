import { createFileRoute } from "@tanstack/react-router";
import { FileText, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/admin/logs")({
  head: () => ({
    meta: [{ title: "System Logs — Administrator Portal" }],
  }),
  component: AdminLogs,
});

function AdminLogs() {
  const { telemetry } = useTB();

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            National Telemetry & System Activity Audit Logs
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cryptographically timestamped SMS telemetry packets and system event audit stream
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          <FileText className="mr-1 h-3 w-3 text-blue-600" /> Audit Log Stream
        </Badge>
      </header>

      <div className="space-y-3">
        {telemetry.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-foreground text-sm flex items-center gap-1">
                  <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
                  {t.boxId}
                </span>
                <Badge
                  variant={t.event === "MISSED_DOSE_ALERT" ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {t.event}
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Timestamp: {new Date(t.receivedAt).toLocaleString()}
              </span>
            </div>

            <code className="block bg-muted p-2 rounded font-mono text-xs text-foreground overflow-x-auto">
              {t.raw}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}
