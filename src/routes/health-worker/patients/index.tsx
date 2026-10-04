import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Eye, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { facilities, patients } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";
import { AdherenceLegend } from "@/components/tb/AdherenceCalendar";

export const Route = createFileRoute("/health-worker/patients/")({
  head: () => ({
    meta: [{ title: "Patients — Health Worker Portal" }],
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
      <header className="border-b border-border pb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Patient Cohort</h1>
        <Badge variant="outline" className="text-xs font-semibold">
          {filteredPatients.length} Enrolled
        </Badge>
      </header>

      {/* Filter Controls */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xs space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or BOX-..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>

          <Select value={facility} onValueChange={setFacility}>
            <SelectTrigger className="text-xs h-9 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Catchments
              </SelectItem>
              {facilities.map((f) => (
                <SelectItem key={f} value={f} className="text-xs">
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={phase} onValueChange={setPhase}>
            <SelectTrigger className="text-xs h-9 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Phases
              </SelectItem>
              <SelectItem value="Intensive" className="text-xs">
                Intensive Phase
              </SelectItem>
              <SelectItem value="Continuation" className="text-xs">
                Continuation Phase
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cohort Data Table */}
      <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-bold text-foreground">Patient</TableHead>
                <TableHead className="text-xs font-bold text-foreground">Facility</TableHead>
                <TableHead className="text-xs font-bold text-foreground">Phase / Day</TableHead>
                <TableHead className="text-xs font-bold text-foreground">Box Serial</TableHead>
                <TableHead className="text-xs font-bold text-foreground">Battery</TableHead>
                <TableHead className="text-xs font-bold text-foreground">Adherence</TableHead>
                <TableHead className="text-xs font-bold text-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                    <div className="space-y-1">
                      <UserX className="mx-auto h-6 w-6 text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No patients found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((p) => {
                  const rate = adherenceRate(p.id);
                  return (
                    <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-bold text-xs text-foreground">
                        <Link
                          to="/health-worker/patients/$id"
                          params={{ id: p.id }}
                          className="hover:underline text-primary"
                        >
                          {p.name}
                        </Link>
                        <span className="block text-[11px] font-normal text-muted-foreground">
                          {p.sex}, {p.age} yrs
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {p.facility}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant={p.phase === "Intensive" ? "destructive" : "secondary"}
                          className="text-[10px] font-bold"
                        >
                          {p.phase}
                        </Badge>
                        <span className="ml-1.5 text-[11px] font-semibold text-muted-foreground">
                          Day {p.treatmentDay}/180
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        {p.boxId}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span
                          className={
                            p.battery < 30
                              ? "text-destructive font-bold"
                              : "text-foreground font-semibold"
                          }
                        >
                          {p.battery}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-2">
                          <Progress value={rate} className="h-2 w-16" />
                          <span className="font-bold">{rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-semibold"
                        >
                          <Link to="/health-worker/patients/$id" params={{ id: p.id }}>
                            <Eye className="mr-1 h-3.5 w-3.5" /> View
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
