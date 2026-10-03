import { createFileRoute } from "@tanstack/react-router";
import { Radio, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/health-worker/adherence")({
  head: () => ({
    meta: [{ title: "SMS Telemetry & Adherence Log — Health Worker Portal" }],
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
            SMS Telemetry Gateway Feed
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time SMS telemetry data packets received from deployed smart pill box hardware
            modules
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-xs font-mono font-bold border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
        >
          <Radio className="mr-1.5 h-3.5 w-3.5 text-emerald-600 animate-pulse" /> Gateway
          Operational
        </Badge>
      </header>

      <div className="space-y-3">
        {telemetry.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-foreground text-sm flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-primary" />
                  {t.boxId}
                </span>
                <Badge
                  variant={t.event === "MISSED_DOSE_ALERT" ? "destructive" : "secondary"}
                  className="text-[10px] font-bold"
                >
                  {t.event}
                </Badge>
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">
                Timestamp: {new Date(t.receivedAt).toLocaleString()}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-mono text-muted-foreground bg-muted/60 p-2.5 rounded-lg border border-border">
                Raw SMS Payload: <strong className="text-foreground font-semibold">{t.raw}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
