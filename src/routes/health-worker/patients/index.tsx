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

export const Route = createFileRoute("/health-worker/patients/")({
  head: () => ({
    meta: [{ title: "Patient Cohort — Health Worker Portal" }],
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
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Enrolled Patient Cohort
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registered patients undergoing anti-TB therapy across catchment areas
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-medium border-border">
          {filteredPatients.length} Enrolled
        </Badge>
      </header>

      {/* Filter Bar */}
      <div className="border border-border bg-card p-3.5 rounded-md">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name or box serial..."
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
                All Treatment Phases
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
      <div className="border border-border bg-card rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-semibold text-foreground">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Facility</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Phase / Day</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Box Serial</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Battery</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Adherence</TableHead>
              <TableHead className="text-xs font-semibold text-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <UserX className="mx-auto h-5 w-5 text-muted-foreground/60" />
                    <p className="font-medium text-foreground">No matching patients found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((p) => {
                const rate = adherenceRate(p.id);
                return (
                  <TableRow key={p.id} className="hover:bg-muted/20 transition-colors">
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
                    <TableCell className="text-xs text-muted-foreground">{p.facility}</TableCell>
                    <TableCell className="text-xs">
                      <span className="font-medium">{p.phase}</span>
                      <span className="ml-1.5 text-[11px] text-muted-foreground">
                        Day {p.treatmentDay}/180
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {p.boxId}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span
                        className={
                          p.battery < 25
                            ? "text-destructive font-bold"
                            : "text-foreground font-medium"
                        }
                      >
                        {p.battery}%
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <Progress value={rate} className="h-1.5 w-16" />
                        <span className="font-semibold">{rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-medium border-border"
                      >
                        <Link to="/health-worker/patients/$id" params={{ id: p.id }}>
                          <Eye className="mr-1 h-3.5 w-3.5" /> View Record
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
  );
}
