import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { facilityPerformances } from "@/lib/tb-data";

export const Route = createFileRoute("/district-officer/dashboard")({
  head: () => ({
    meta: [{ title: "TB Programme Summary — District & Zone Portal" }],
  }),
  component: DistrictOfficerDashboard,
});

type SortField = "adherenceRate" | "patientCount" | "missedDoses" | "name";

function DistrictOfficerDashboard() {
  const [sortField, setSortField] = useState<SortField>("adherenceRate");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const sortedFacilities = useMemo(() => {
    return [...facilityPerformances].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Aggregated totals across facilities
  const totalPatients = facilityPerformances.reduce((acc, f) => acc + f.patientCount, 0);
  const totalScheduled = facilityPerformances.reduce((acc, f) => acc + f.scheduledDoses, 0);
  const totalRecorded = facilityPerformances.reduce((acc, f) => acc + f.recordedDoses, 0);
  const overallAdherence = ((totalRecorded / (totalScheduled || 1)) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ministry of Health · Lilongwe District
        </p>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground mt-0.5">
          TB Programme Summary
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          District and facility treatment adherence monitoring
        </p>
      </div>

      {/* 1. TOP PROGRAMME OVERVIEW (Clean Typographic Numbers) */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Programme Overview
        </h2>
        <div className="border border-border bg-card p-5 rounded-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
            <div>
              <span className="block font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {totalPatients.toLocaleString()}
              </span>
              <span className="block text-xs font-medium text-muted-foreground mt-1">
                Patients Monitored
              </span>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
              <span className="block font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {totalScheduled.toLocaleString()}
              </span>
              <span className="block text-xs font-medium text-muted-foreground mt-1">
                Scheduled Doses
              </span>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
              <span className="block font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {totalRecorded.toLocaleString()}
              </span>
              <span className="block text-xs font-medium text-muted-foreground mt-1">
                Recorded Doses
              </span>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
              <span className="block font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                {overallAdherence}%
              </span>
              <span className="block text-xs font-medium text-muted-foreground mt-1">
                Overall Adherence
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ADHERENCE TREND */}
      <section className="border border-border bg-card p-5 rounded-md space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <h2 className="font-display text-sm font-bold text-foreground">Adherence Trend</h2>
            <p className="text-xs text-muted-foreground">4-week historical programme compliance</p>
          </div>
          <Badge variant="outline" className="text-xs font-mono font-medium border-border">
            +1.4% vs Previous Month
          </Badge>
        </div>

        {/* Clean SVG Trend Visualization */}
        <div className="pt-2 pb-1 space-y-2">
          <div className="h-32 w-full flex items-end justify-between gap-4 px-2 pt-4 pb-2 border-b border-border text-xs">
            <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[11px] font-semibold text-foreground">93.2%</span>
              <div className="w-full bg-primary/20 rounded-xs h-[70%]" />
              <span className="text-[10px] text-muted-foreground font-medium">Week 1</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[11px] font-semibold text-foreground">94.8%</span>
              <div className="w-full bg-primary/30 rounded-xs h-[80%]" />
              <span className="text-[10px] text-muted-foreground font-medium">Week 2</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[11px] font-semibold text-foreground">96.1%</span>
              <div className="w-full bg-primary/50 rounded-xs h-[92%]" />
              <span className="text-[10px] text-muted-foreground font-medium">Week 3</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[11px] font-bold text-primary">95.6%</span>
              <div className="w-full bg-primary rounded-xs h-[88%]" />
              <span className="text-[10px] font-bold text-foreground">Week 4 (Current)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FACILITY PERFORMANCE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <h2 className="font-display text-sm font-bold text-foreground">Facility Performance</h2>
          <Link
            to="/district-officer/facilities"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View All Facilities →
          </Link>
        </div>

        <div className="border border-border bg-card rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead
                  onClick={() => handleSort("name")}
                  className="text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/60"
                >
                  Facility Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">District</TableHead>
                <TableHead
                  onClick={() => handleSort("patientCount")}
                  className="text-xs font-semibold text-foreground text-right cursor-pointer hover:bg-muted/60"
                >
                  Patients
                </TableHead>
                <TableHead
                  onClick={() => handleSort("adherenceRate")}
                  className="text-xs font-semibold text-foreground text-right cursor-pointer hover:bg-muted/60"
                >
                  Adherence
                </TableHead>
                <TableHead
                  onClick={() => handleSort("missedDoses")}
                  className="text-xs font-semibold text-foreground text-right cursor-pointer hover:bg-muted/60"
                >
                  Missed Doses
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFacilities.map((f) => (
                <TableRow key={f.id} className="hover:bg-muted/20 transition-colors text-xs">
                  <TableCell className="font-bold text-foreground">
                    <Link
                      to="/district-officer/facilities"
                      className="hover:underline text-primary"
                    >
                      {f.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{f.district}</TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {f.patientCount}
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    {f.adherenceRate}%
                  </TableCell>
                  <TableCell className="text-right font-medium text-muted-foreground">
                    {f.missedDoses}
                  </TableCell>
                  <TableCell className="text-right">
                    {f.status === "Good" && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                      >
                        Good
                      </Badge>
                    )}
                    {f.status === "Monitor" && (
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        Monitor
                      </Badge>
                    )}
                    {f.status === "Attention" && (
                      <Badge variant="destructive" className="text-[10px] font-semibold">
                        Attention
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 4. MISSED-DOSE MONITORING & ACTIONS */}
      <section className="border border-border bg-card p-5 rounded-md space-y-4">
        <h2 className="font-display text-sm font-bold text-foreground border-b border-border pb-2">
          Missed-Dose Monitoring
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground font-medium block">
              Highest Missed-Dose Rate
            </span>
            <span className="font-bold text-foreground text-sm block">
              Area 18 Health Centre (13.0%)
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Follow-up capacity review recommended
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground font-medium block">
              Average District Missed Rate
            </span>
            <span className="font-bold text-foreground text-sm block">4.4%</span>
            <span className="text-[11px] text-muted-foreground block">
              Within expected programme threshold (≤5%)
            </span>
          </div>
          <div className="space-y-1 flex flex-col justify-end">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="text-xs font-semibold h-8 border-border"
            >
              <Link to="/district-officer/reports">Generate Adherence Report</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
