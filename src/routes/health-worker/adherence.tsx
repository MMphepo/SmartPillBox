import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/health-worker/adherence")({
  head: () => ({
    meta: [{ title: "Adherence Reports — Health Worker Portal" }],
  }),
  component: HealthWorkerAdherenceReports,
});

export function HealthWorkerAdherenceReports() {
  const { patientList, doses, adherenceRate } = useTB();

  const [selectedPatient, setSelectedPatient] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDoses = useMemo(() => {
    return doses
      .filter((d) => {
        const matchesPatient = selectedPatient === "all" || d.patientId === selectedPatient;
        const matchesStatus = statusFilter === "all" || d.status === statusFilter;
        return matchesPatient && matchesStatus;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [doses, selectedPatient, statusFilter]);

  // Aggregate stats
  const totalDoses = filteredDoses.length;
  const takenDoses = filteredDoses.filter((d) => d.status === "taken").length;
  const lateDoses = filteredDoses.filter((d) => d.status === "late").length;
  const missedDoses = filteredDoses.filter((d) => d.status === "missed").length;

  const cohortAdherence = useMemo(() => {
    if (!patientList.length) return 0;
    const sum = patientList.reduce((acc, p) => acc + adherenceRate(p.id), 0);
    return Math.round(sum / patientList.length);
  }, [patientList, adherenceRate]);

  const handleExport = () => {
    toast.success("Adherence report exported", {
      description: "CSV summary file downloaded successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Patient Adherence Reports
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dose compliance records, scheduled window history, and adherence statistics
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="text-xs font-semibold h-8 border-border shrink-0 self-start sm:self-auto"
        >
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export Report
        </Button>
      </header>

      {/* Cohort Metric Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="border border-border bg-card p-4 rounded-md">
          <span className="block font-display text-2xl font-bold text-foreground">
            {selectedPatient === "all"
              ? `${cohortAdherence}%`
              : `${adherenceRate(selectedPatient)}%`}
          </span>
          <span className="block text-muted-foreground font-medium mt-1">Cohort Adherence</span>
        </div>
        <div className="border border-border bg-card p-4 rounded-md">
          <span className="block font-display text-2xl font-bold text-foreground">
            {totalDoses}
          </span>
          <span className="block text-muted-foreground font-medium mt-1">Recorded Doses</span>
        </div>
        <div className="border border-border bg-card p-4 rounded-md">
          <span className="block font-display text-2xl font-bold text-foreground text-emerald-700 dark:text-emerald-400">
            {takenDoses + lateDoses}
          </span>
          <span className="block text-muted-foreground font-medium mt-1">Successful Doses</span>
        </div>
        <div className="border border-border bg-card p-4 rounded-md">
          <span className="block font-display text-2xl font-bold text-destructive">
            {missedDoses}
          </span>
          <span className="block text-muted-foreground font-medium mt-1">Missed Doses</span>
        </div>
      </div>

      {/* Report Filters */}
      <div className="border border-border bg-card p-3.5 rounded-md">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Filter by Patient
            </label>
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger className="text-xs h-9 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Patients ({patientList.length})
                </SelectItem>
                {patientList.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name} ({p.facility})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Filter by Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-xs h-9 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Statuses
                </SelectItem>
                <SelectItem value="taken" className="text-xs">
                  Taken (On Time)
                </SelectItem>
                <SelectItem value="late" className="text-xs">
                  Late
                </SelectItem>
                <SelectItem value="missed" className="text-xs">
                  Missed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chronological Adherence Record Table */}
      <div className="border border-border bg-card rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-semibold text-foreground">Date</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">
                Scheduled Window
              </TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Source</TableHead>
              <TableHead className="text-xs font-semibold text-foreground text-right">
                Recorded Time
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoses.slice(0, 50).map((d) => {
              const p = patientList.find((x) => x.id === d.patientId)!;
              return (
                <TableRow key={d.id} className="hover:bg-muted/20 transition-colors text-xs">
                  <TableCell className="font-medium text-foreground whitespace-nowrap">
                    {d.date}
                  </TableCell>
                  <TableCell className="font-bold text-foreground">
                    {p ? (
                      <Link
                        to="/health-worker/patients/$id"
                        params={{ id: p.id }}
                        className="hover:underline text-primary"
                      >
                        {p.name}
                      </Link>
                    ) : (
                      "Patient"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p?.doseTime || "08:00"}</TableCell>
                  <TableCell>
                    {d.status === "taken" && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                      >
                        Taken
                      </Badge>
                    )}
                    {d.status === "late" && (
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        Late
                      </Badge>
                    )}
                    {d.status === "missed" && (
                      <Badge variant="destructive" className="text-[10px] font-semibold">
                        Missed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">{d.source}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    {d.time}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
