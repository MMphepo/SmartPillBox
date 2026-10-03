import type { DoseEntry } from "@/lib/tb-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  smartbox: {
    bg: "bg-emerald-600 dark:bg-emerald-700",
    text: "text-white",
    border: "border-emerald-700 dark:border-emerald-600",
  },
  guardian: {
    bg: "bg-indigo-600 dark:bg-indigo-700",
    text: "text-white",
    border: "border-indigo-700 dark:border-indigo-600",
  },
  hsa: {
    bg: "bg-amber-600 dark:bg-amber-700",
    text: "text-white",
    border: "border-amber-700 dark:border-amber-600",
  },
  none: {
    bg: "bg-rose-600 dark:bg-rose-700",
    text: "text-white",
    border: "border-rose-700 dark:border-rose-600",
  },
};

export function AdherenceLegend() {
  const items = [
    { label: "Smart Box SMS (Auto-Detected)", cls: "bg-emerald-600" },
    { label: "Guardian Verified", cls: "bg-indigo-600" },
    { label: "Health Worker Logged", cls: "bg-amber-600" },
    { label: "Missed / Unverified", cls: "bg-rose-600" },
  ];
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground border-t border-border pt-3">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2">
          <span className={cn("h-3 w-3 rounded-sm shrink-0", i.cls)} />
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

        const sourceLabel =
          d.source === "smartbox"
            ? "Smart Box SMS"
            : d.source === "guardian"
              ? "Guardian Verified"
              : d.source === "hsa"
                ? "Health Worker Logged"
                : "No Opening Recorded";

        return (
          <div
            key={d.id}
            title={`${d.date} · ${d.status.toUpperCase()} (${sourceLabel}) · Time: ${d.time}`}
            className={cn(
              "group relative grid aspect-square place-items-center rounded-lg border font-bold shadow-2xs transition-all hover:scale-105 hover:z-10 cursor-pointer",
              compact ? "text-[10px]" : "text-xs sm:text-sm",
              style.bg,
              style.text,
              style.border,
              d.status === "late" && "ring-2 ring-amber-400 ring-offset-1 ring-offset-card",
            )}
          >
            <span>{dayNumber}</span>
          </div>
        );
      })}
    </div>
  );
}
