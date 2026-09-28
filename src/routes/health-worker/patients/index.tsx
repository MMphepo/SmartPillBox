import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Filter, ClipboardPlus, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { facilities, guardians, patients } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";
import { AdherenceLegend } from "@/components/tb/AdherenceCalendar";

export const Route = createFileRoute("/health-worker/patients/")({
  head: () => ({
    meta: [{ title: "Patient Cohort Directory — Health Worker Portal" }],
  }),
  component: HealthWorkerPatientsIndex,
});

function HealthWorkerPatientsIndex() {
  const { adherenceRate } = useTB();
  const [search, setSearch] = useState("");
  const [facility, setFacility] = useState("all");
  const [phase, setPhase] = useState("all");

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.boxId.toLowerCase().includes(search.toLowerCase());
      const matchesFacility = facility === "all" || p.facility === facility;
      const matchesPhase = phase === "all" || p.phase === phase;
      return matchesSearch && matchesFacility && matchesPhase;
    });
  }, [search, facility, phase]);

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Patient Cohort Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor enrolled patients, smart pill box telemetry & 30-day adherence rates
          </p>
        </div>
      </header>

      {/* Filter Controls Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Search Patient or Box ID</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Name or BOX-..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Facility Catchment</Label>
            <Select value={facility} onValueChange={setFacility}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Facilities
                </SelectItem>
                {facilities.map((f) => (
                  <SelectItem key={f} value={f} className="text-xs">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Treatment Phase</Label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Phases
                </SelectItem>
                <SelectItem value="Intensive" className="text-xs">
                  Intensive Phase (1–60)
                </SelectItem>
                <SelectItem value="Continuation" className="text-xs">
                  Continuation Phase (61–180)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-semibold">Patient Name</TableHead>
                <TableHead className="text-xs font-semibold">Facility</TableHead>
                <TableHead className="text-xs font-semibold">Phase / Day</TableHead>
                <TableHead className="text-xs font-semibold">Box Serial</TableHead>
                <TableHead className="text-xs font-semibold">Battery</TableHead>
                <TableHead className="text-xs font-semibold">30-Day Adherence</TableHead>
                <TableHead className="text-xs font-semibold">Guardian</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                    No patients match the selected search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((p) => {
                  const g = guardians.find((x) => x.patientId === p.id)!;
                  const rate = adherenceRate(p.id);
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-semibold text-xs text-foreground">
                        <Link
                          to="/health-worker/patients/$id"
                          params={{ id: p.id }}
                          className="hover:underline"
                        >
                          {p.name}
                        </Link>
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          {p.sex}, {p.age} yrs
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.facility}</TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant={p.phase === "Intensive" ? "destructive" : "secondary"}
                          className="text-[10px]"
                        >
                          {p.phase}
                        </Badge>
                        <span className="ml-1.5 text-[10px] text-muted-foreground">
                          Day {p.treatmentDay}/180
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.boxId}</TableCell>
                      <TableCell className="text-xs">
                        <span
                          className={
                            p.battery < 30 ? "text-destructive font-semibold" : "text-foreground"
                          }
                        >
                          {p.battery}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <Progress value={rate} className="h-2 w-16" />
                          <span className="font-medium">{rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {g ? `${g.name} (${g.relation})` : "Unassigned"}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                          <Link to="/health-worker/patients/$id" params={{ id: p.id }}>
                            <Eye className="mr-1 h-3 w-3" /> View Detail
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AdherenceLegend />
    </div>
  );
}
