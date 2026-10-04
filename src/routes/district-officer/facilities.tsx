import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  districtPerformances,
  facilityPerformances,
  type FacilityPerformance,
} from "@/lib/tb-data";

export const Route = createFileRoute("/district-officer/facilities")({
  head: () => ({
    meta: [{ title: "Facility Performance — District & Zone Portal" }],
  }),
  component: DistrictOfficerFacilities,
});

export function DistrictOfficerFacilities() {
  const [search, setSearch] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<FacilityPerformance | null>(null);

  const filteredFacilities = useMemo(() => {
    if (!search.trim()) return facilityPerformances;
    const q = search.toLowerCase();
    return facilityPerformances.filter(
      (f) => f.name.toLowerCase().includes(q) || f.district.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Facility & District Performance
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aggregated adherence monitoring across health facilities and regional districts
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search facility or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* 1. HEALTH FACILITY PERFORMANCE TABLE */}
      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold text-foreground border-b border-border/60 pb-2">
          Health Facility Performance
        </h2>

        <div className="border border-border bg-card rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold text-foreground">
                  Health Facility
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">District</TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Patients
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Scheduled Doses
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Adherence Rate
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Change
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFacilities.map((f) => (
                <TableRow key={f.id} className="hover:bg-muted/20 transition-colors text-xs">
                  <TableCell className="font-bold text-foreground">{f.name}</TableCell>
                  <TableCell className="text-muted-foreground">{f.district}</TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {f.patientCount}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {f.scheduledDoses.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    {f.adherenceRate}%
                  </TableCell>
                  <TableCell className="text-right font-medium text-muted-foreground">
                    {f.changePct > 0 ? `+${f.changePct}%` : `${f.changePct}%`}
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
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedFacility(f)}
                      className="h-7 text-xs font-medium border-border"
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" /> Inspect Summary
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 2. DISTRICT COMPARISON */}
      <section className="space-y-3">
        <h2 className="font-display text-sm font-bold text-foreground border-b border-border/60 pb-2">
          District Adherence Comparison
        </h2>

        <div className="border border-border bg-card rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold text-foreground">District</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Zone</TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Facility Count
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Patients Monitored
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Overall Adherence
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Missed Doses
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Monthly Change
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
                  <TableCell className="text-right text-muted-foreground">
                    {d.missedDoses}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">
                    {d.changePct > 0 ? `+${d.changePct}%` : `${d.changePct}%`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Facility Drill-Down Modal */}
      <Dialog
        open={selectedFacility !== null}
        onOpenChange={(o) => !o && setSelectedFacility(null)}
      >
        {selectedFacility && (
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{selectedFacility.name}</DialogTitle>
              <DialogDescription className="text-xs">
                Facility Summary · {selectedFacility.district} District ({selectedFacility.zone})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              {/* Programme Summary Grid */}
              <div className="grid grid-cols-3 gap-3 border border-border p-3.5 rounded-md bg-muted/20 text-center">
                <div>
                  <span className="text-muted-foreground font-medium block">
                    Patients Monitored
                  </span>
                  <span className="font-bold text-foreground text-base mt-0.5 block">
                    {selectedFacility.patientCount}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block">Adherence Rate</span>
                  <span className="font-bold text-foreground text-base mt-0.5 block">
                    {selectedFacility.adherenceRate}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block">Missed Doses</span>
                  <span className="font-bold text-destructive text-base mt-0.5 block">
                    {selectedFacility.missedDoses}
                  </span>
                </div>
              </div>

              {/* Treatment Adherence Distribution */}
              <div className="space-y-2 border border-border p-3.5 rounded-md bg-card">
                <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                  Treatment Adherence Distribution
                </h3>
                <div className="border border-border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="text-xs font-semibold text-foreground">
                          Adherence Threshold
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right">
                          Patient Count
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-foreground text-right">
                          Percentage
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="text-xs">
                        <TableCell className="font-medium text-emerald-700 dark:text-emerald-400">
                          ≥95% High Adherence
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {selectedFacility.adherenceDistribution.high}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {Math.round(
                            (selectedFacility.adherenceDistribution.high /
                              selectedFacility.patientCount) *
                              100,
                          )}
                          %
                        </TableCell>
                      </TableRow>
                      <TableRow className="text-xs">
                        <TableCell className="font-medium text-foreground">
                          80–94% Moderate Adherence
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {selectedFacility.adherenceDistribution.medium}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {Math.round(
                            (selectedFacility.adherenceDistribution.medium /
                              selectedFacility.patientCount) *
                              100,
                          )}
                          %
                        </TableCell>
                      </TableRow>
                      <TableRow className="text-xs">
                        <TableCell className="font-medium text-destructive">
                          &lt;80% Low Adherence (Attention)
                        </TableCell>
                        <TableCell className="text-right font-bold text-destructive">
                          {selectedFacility.adherenceDistribution.low}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {Math.round(
                            (selectedFacility.adherenceDistribution.low /
                              selectedFacility.patientCount) *
                              100,
                          )}
                          %
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Period Performance Trend */}
              <div className="border border-border p-3.5 rounded-md bg-card flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-foreground block">Period Trend Change</span>
                  <span className="text-muted-foreground block text-[11px]">
                    Comparison with previous 30-day reporting period
                  </span>
                </div>
                <Badge
                  variant={selectedFacility.changePct >= 0 ? "outline" : "destructive"}
                  className="text-xs font-bold border-border"
                >
                  {selectedFacility.changePct >= 0
                    ? `+${selectedFacility.changePct}%`
                    : `${selectedFacility.changePct}%`}
                </Badge>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
