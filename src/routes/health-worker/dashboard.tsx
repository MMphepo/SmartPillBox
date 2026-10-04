import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Search, CheckCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { patients, type Intervention } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/health-worker/dashboard")({
  head: () => ({
    meta: [{ title: "Clinical Dashboard — Health Worker Portal" }],
  }),
  component: HealthWorkerDashboard,
});

function HealthWorkerDashboard() {
  const { alerts, adherenceRate, resolveAlert, logIntervention } = useTB();
  const [modalPatient, setModalPatient] = useState<string | null>(null);
  const [type, setType] = useState<Intervention["type"]>("Home visit");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  const openAlerts = alerts.filter((a) => !a.resolved);
  const cohortAdherence = Math.round(
    patients.reduce((sum, p) => sum + adherenceRate(p.id), 0) / patients.length,
  );
  const activeDevices = patients.filter((p) => p.battery > 15).length;

  const triage = [...openAlerts].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 } as const;
    return rank[a.severity] - rank[b.severity];
  });

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.boxId.toLowerCase().includes(search.toLowerCase()) ||
        p.facility.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const submitIntervention = () => {
    if (!modalPatient) return;
    const patient = patients.find((p) => p.id === modalPatient)!;
    logIntervention({
      patientId: modalPatient,
      hsaId: patient.hsaId,
      type,
      notes: notes || "Clinical follow-up recorded.",
    });
    setNotes("");
    setModalPatient(null);
    toast.success("Intervention recorded", { description: `${type} · ${patient.name}` });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Clinical Operations
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Zomba Central Hospital · Cohort Adherence Monitoring
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setModalPatient(patients[0].id)}
          className="text-xs font-semibold h-8 shrink-0 self-start sm:self-auto"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Log Action
        </Button>
      </div>

      {/* 1. PATIENTS REQUIRING IMMEDIATE ATTENTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-sm font-bold text-foreground">Attention Required</h2>
            {triage.length > 0 && (
              <Badge variant="destructive" className="text-[10px] font-semibold px-2 py-0">
                {triage.length} Pending
              </Badge>
            )}
          </div>
          <Link
            to="/health-worker/alerts"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View Triage Queue →
          </Link>
        </div>

        {triage.length === 0 ? (
          <div className="py-6 px-4 border border-border bg-card rounded-md text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>No patients currently require clinical triage or contact.</span>
          </div>
        ) : (
          <div className="border border-border bg-card rounded-md divide-y divide-border">
            {triage.slice(0, 4).map((a) => {
              const p = patients.find((x) => x.id === a.patientId)!;
              return (
                <div
                  key={a.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to="/health-worker/patients/$id"
                        params={{ id: p.id }}
                        className="font-bold text-foreground hover:underline"
                      >
                        {p.name}
                      </Link>
                      <span className="text-[11px] text-muted-foreground">({p.facility})</span>
                      <Badge
                        variant={a.severity === "high" ? "destructive" : "secondary"}
                        className="text-[10px] font-semibold uppercase"
                      >
                        {a.kind.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{a.message}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setModalPatient(p.id)}
                      className="text-xs h-7 px-2.5 font-medium border-border"
                    >
                      Log Intervention
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        resolveAlert(a.id);
                        toast.success("Alert resolved");
                      }}
                      className="text-xs h-7 px-2.5 font-semibold"
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. PATIENT COHORT MONITORING */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-2">
          <h2 className="font-display text-sm font-bold text-foreground">Patient Monitoring</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search patient, facility, box..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8"
            />
          </div>
        </div>

        <div className="border border-border bg-card rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold text-foreground">Patient</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Facility</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Regimen Day</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Box Serial</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Battery</TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Adherence</TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((p) => {
                const rate = adherenceRate(p.id);
                return (
                  <TableRow key={p.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-xs font-bold text-foreground">
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
                      <span className="font-medium">Day {p.treatmentDay}</span>
                      <span className="text-[11px] text-muted-foreground block">{p.phase}</span>
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
                        <Progress value={rate} className="h-1.5 w-14" />
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
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* 3. SUPPORTING SYSTEM OVERVIEW */}
      <section className="space-y-3 pt-2">
        <h2 className="font-display text-sm font-bold text-foreground border-b border-border/60 pb-2">
          System Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="border border-border bg-card p-3.5 rounded-md">
            <span className="block text-muted-foreground font-medium">Enrolled Cohort</span>
            <span className="block font-display text-lg font-bold text-foreground mt-1">
              {patients.length} patients
            </span>
          </div>
          <div className="border border-border bg-card p-3.5 rounded-md">
            <span className="block text-muted-foreground font-medium">Average Adherence</span>
            <span className="block font-display text-lg font-bold text-foreground mt-1">
              {cohortAdherence}%
            </span>
          </div>
          <div className="border border-border bg-card p-3.5 rounded-md">
            <span className="block text-muted-foreground font-medium">Connected Devices</span>
            <span className="block font-display text-lg font-bold text-foreground mt-1">
              {activeDevices} / {patients.length} active
            </span>
          </div>
          <div className="border border-border bg-card p-3.5 rounded-md">
            <span className="block text-muted-foreground font-medium">Active Triage Alerts</span>
            <span className="block font-display text-lg font-bold text-foreground mt-1">
              {openAlerts.length} unresolved
            </span>
          </div>
        </div>
      </section>

      {/* Log Action Dialog */}
      <Dialog open={modalPatient !== null} onOpenChange={(o) => !o && setModalPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Field Intervention</DialogTitle>
            <DialogDescription className="text-xs">
              Record a clinical visit, telephone call, or counselling event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Patient</Label>
              <Select value={modalPatient ?? ""} onValueChange={setModalPatient}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} ({p.facility})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Intervention Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as Intervention["type"])}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home visit" className="text-xs">
                    Home Visit
                  </SelectItem>
                  <SelectItem value="Phone check-in" className="text-xs">
                    Phone Check-in
                  </SelectItem>
                  <SelectItem value="Pill resupply" className="text-xs">
                    Pill Resupply
                  </SelectItem>
                  <SelectItem value="Counselling" className="text-xs">
                    Counselling Session
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of follow-up action taken..."
                className="text-xs min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={submitIntervention} className="text-xs font-semibold">
              Save Intervention Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
