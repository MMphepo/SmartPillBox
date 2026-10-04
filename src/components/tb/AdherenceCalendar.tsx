import type { DoseEntry } from "@/lib/tb-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  smartbox: {
    bg: "bg-emerald-700 dark:bg-emerald-800",
    text: "text-white",
    border: "border-emerald-800 dark:border-emerald-700",
  },
  guardian: {
    bg: "bg-emerald-700 dark:bg-emerald-800",
    text: "text-white",
    border: "border-emerald-800 dark:border-emerald-700",
  },
  hsa: {
    bg: "bg-amber-600 dark:bg-amber-700",
    text: "text-white",
    border: "border-amber-700 dark:border-amber-600",
  },
  none: {
    bg: "bg-rose-700 dark:bg-rose-800",
    text: "text-white",
    border: "border-rose-800 dark:border-rose-700",
  },
};

export function AdherenceLegend() {
  const items = [
    { label: "Dose Recorded (SMS)", cls: "bg-emerald-700" },
    { label: "Health Worker Logged", cls: "bg-amber-600" },
    { label: "Missed Dose", cls: "bg-rose-700" },
  ];
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground border-t border-border pt-3">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2">
          <span className={cn("h-3 w-3 rounded-xs shrink-0", i.cls)} />
          <span>{i.label}</span>
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
        const dayNumber = Number(d.date.slice(8, 10));
        const key = d.status === "missed" ? "none" : d.source;
        const style = statusStyles[key] || statusStyles.none;

        return (
          <div
            key={d.id}
            title={`${d.date} · ${d.status.toUpperCase()} · Time: ${d.time}`}
            className={cn(
              "grid aspect-square place-items-center rounded-sm border font-semibold text-xs transition-colors cursor-default",
              compact ? "text-[10px]" : "sm:text-xs",
              style.bg,
              style.text,
              style.border,
            )}
          >
            <span>{dayNumber}</span>
          </div>
        );
      })}
    </div>
  );
}
