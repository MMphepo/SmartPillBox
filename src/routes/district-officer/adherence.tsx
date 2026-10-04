import { createFileRoute } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { districtPerformances, facilityPerformances } from "@/lib/tb-data";

export const Route = createFileRoute("/district-officer/adherence")({
  head: () => ({
    meta: [{ title: "Adherence Analytics — District & Zone Portal" }],
  }),
  component: DistrictOfficerAdherence,
});

export function DistrictOfficerAdherence() {
  // Aggregate overall adherence distribution
  const totalPatients = facilityPerformances.reduce((acc, f) => acc + f.patientCount, 0);
  const totalHigh = facilityPerformances.reduce((acc, f) => acc + f.adherenceDistribution.high, 0);
  const totalMedium = facilityPerformances.reduce(
    (acc, f) => acc + f.adherenceDistribution.medium,
    0,
  );
  const totalLow = facilityPerformances.reduce((acc, f) => acc + f.adherenceDistribution.low, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ministry of Health · Programme Analysis
        </p>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground mt-0.5">
          Adherence Distribution & Analysis
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Aggregated cohort compliance thresholds and regional adherence patterns
        </p>
      </div>

      {/* 1. PATIENT ADHERENCE DISTRIBUTION */}
      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold text-foreground border-b border-border/60 pb-2">
          Patient Adherence Distribution Thresholds
        </h2>

        <div className="border border-border bg-card rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold text-foreground">
                  Adherence Range
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Compliance Category
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Patients Monitored
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Cohort Percentage
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-muted/20 transition-colors text-xs">
                <TableCell className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                  ≥ 95%
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  High Adherence (Optimal)
                </TableCell>
                <TableCell className="text-right font-bold text-foreground">{totalHigh}</TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  {((totalHigh / (totalPatients || 1)) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/20 transition-colors text-xs">
                <TableCell className="font-bold text-foreground font-mono">80% – 94%</TableCell>
                <TableCell className="font-medium text-foreground">
                  Moderate Adherence (Monitor)
                </TableCell>
                <TableCell className="text-right font-bold text-foreground">
                  {totalMedium}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {((totalMedium / (totalPatients || 1)) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/20 transition-colors text-xs">
                <TableCell className="font-bold text-destructive font-mono">&lt; 80%</TableCell>
                <TableCell className="font-semibold text-destructive">
                  Low Adherence (Intervention Required)
                </TableCell>
                <TableCell className="text-right font-bold text-destructive">{totalLow}</TableCell>
                <TableCell className="text-right font-semibold text-destructive">
                  {((totalLow / (totalPatients || 1)) * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 2. REGIONAL DISTRICT BREAKDOWN */}
      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold text-foreground border-b border-border/60 pb-2">
          District Adherence Performance
        </h2>

        <div className="border border-border bg-card rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold text-foreground">District</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Zone</TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Facilities
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Patients Monitored
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Adherence Rate
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Missed Rate
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {districtPerformances.map((d) => (
                <TableRow key={d.district} className="hover:bg-muted/20 transition-colors text-xs">
                  <TableCell className="font-bold text-foreground">{d.district}</TableCell>
                  <TableCell className="text-muted-foreground">{d.zone}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {d.facilityCount}
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {d.patientCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    {d.adherenceRate}%
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground font-mono">
                    {(100 - d.adherenceRate).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 3. BREAKDOWN BY TREATMENT PHASE */}
      <section className="border border-border bg-card p-5 rounded-md space-y-3">
        <h2 className="font-display text-sm font-bold text-foreground border-b border-border pb-2">
          Adherence by Treatment Phase
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="border border-border p-4 rounded-md space-y-2">
            <span className="font-bold text-foreground block">Intensive Phase (Days 1–60)</span>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Cohort Adherence:</span>
              <span className="font-bold text-foreground">93.8%</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
              Higher incidence of late dose events reported during early regimen adjustment.
            </p>
          </div>

          <div className="border border-border p-4 rounded-md space-y-2">
            <span className="font-bold text-foreground block">
              Continuation Phase (Days 61–180)
            </span>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Cohort Adherence:</span>
              <span className="font-bold text-foreground">96.4%</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
              Stable compliance patterns established; routine 30-day pill refills maintained.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
