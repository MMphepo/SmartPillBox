import type { DoseEntry } from "@/lib/tb-data";
import { cn } from "@/lib/utils";

const sourceClass: Record<string, string> = {
  smartbox: "bg-success text-success-foreground",
  guardian: "bg-info text-info-foreground",
  hsa: "bg-warning text-warning-foreground",
  none: "bg-destructive text-destructive-foreground",
};

export function AdherenceLegend() {
  const items = [
    { label: "Smart box (SMS)", cls: "bg-success" },
    { label: "Guardian verified", cls: "bg-info" },
    { label: "Health worker log", cls: "bg-warning" },
    { label: "Missed / unverified", cls: "bg-destructive" },
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className={cn("h-3 w-3 rounded-sm", i.cls)} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function AdherenceCalendar({
  doses,
  compact = false,
}: {
  doses: DoseEntry[];
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {doses.map((d) => {
        const day = Number(d.date.slice(8, 10));
        return (
          <div
            key={d.id}
            title={`${d.date} · ${d.status.toUpperCase()} · ${d.source} · ${d.time}`}
            className={cn(
              "grid aspect-square place-items-center rounded-md text-xs font-semibold transition-transform hover:scale-105",
              compact ? "text-[10px]" : "sm:text-sm",
              sourceClass[d.status === "missed" ? "none" : d.source],
              d.status === "late" && "ring-2 ring-accent ring-offset-1 ring-offset-card",
            )}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}
