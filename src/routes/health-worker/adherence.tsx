import { createFileRoute } from "@tanstack/react-router";
import { Radio, RefreshCw } from "lucide-react";
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
            SMS Telemetry & Adherence Feed
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time SMS telemetry packets received from smart pill box hardware modules
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          <Radio className="mr-1 h-3 w-3 text-emerald-500 animate-pulse" /> Gateway Active
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
                <span className="font-mono font-bold text-foreground text-sm">{t.boxId}</span>
                <Badge
                  variant={t.event === "MISSED_DOSE_ALERT" ? "destructive" : "secondary"}
                  className="text-[10px]"
                >
                  {t.event}
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Received: {new Date(t.receivedAt).toLocaleString()}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-mono text-muted-foreground bg-muted p-2 rounded">
                Raw Payload: <strong className="text-foreground">{t.raw}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
