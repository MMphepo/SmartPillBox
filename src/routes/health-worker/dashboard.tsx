import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, CheckCircle } from "lucide-react";

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

import { useTB } from "@/lib/tb-store";
import type { Intervention } from "@/lib/tb-data";

export const Route = createFileRoute("/health-worker/dashboard")({
  head: () => ({
    meta: [{ title: "Overview — Health Worker Portal" }],
  }),
  component: HealthWorkerDashboard,
});

function HealthWorkerDashboard() {
  const { patientList, alerts, resolveAlert, logIntervention } = useTB();
  const [modalPatient, setModalPatient] = useState<string | null>(null);
  const [type, setType] = useState<Intervention["type"]>("Home visit");
  const [notes, setNotes] = useState("");

  const openAlerts = alerts.filter((a) => !a.resolved);
  const missedDosesCount = openAlerts.filter((a) => a.kind === "MISSED_DOSE_ALERT").length;
  const patientsRequiringAttention = new Set(openAlerts.map((a) => a.patientId)).size;

  const triage = [...openAlerts].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 } as const;
    return rank[a.severity] - rank[b.severity];
  });

  const submitIntervention = () => {
    if (!modalPatient) return;
    const patient = patientList.find((p) => p.id === modalPatient)!;
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
            Clinical Operations Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Zomba Central Hospital · Active Cohort Monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="text-xs font-semibold h-8">
            <Link to="/health-worker/patients">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Enrol Patient
            </Link>
          </Button>
        </div>
      </div>

      {/* 1. ATTENTION REQUIRED */}
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
            View All Alerts →
          </Link>
        </div>

        {triage.length === 0 ? (
          <div className="py-6 px-4 border border-border bg-card rounded-md text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>No patients currently require clinical triage or intervention.</span>
          </div>
        ) : (
          <div className="border border-border bg-card rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-foreground">Patient</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">Issue</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">
                    Last Event
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {triage.map((a) => {
                  const p = patientList.find((x) => x.id === a.patientId)!;
                  const eventTime = new Date(a.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <TableRow key={a.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="text-xs font-bold text-foreground">
                        <Link
                          to="/health-worker/patients/$id"
                          params={{ id: p.id }}
                          className="hover:underline text-primary"
                        >
                          {p.name}
                        </Link>
                        <span className="block text-[11px] font-normal text-muted-foreground">
                          {p.facility}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant={a.severity === "high" ? "destructive" : "secondary"}
                          className="text-[10px] font-semibold uppercase"
                        >
                          {a.kind.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        Today, {eventTime}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span
                          className={
                            a.severity === "high"
                              ? "text-destructive font-semibold"
                              : "text-foreground font-medium"
                          }
                        >
                          {a.severity === "high" ? "Requires attention" : "Monitor"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setModalPatient(p.id)}
                            className="text-xs h-7 px-2.5 font-medium border-border"
                          >
                            Log Action
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* 2. CURRENT PROGRAMME STATISTICS */}
      <section className="space-y-3 pt-2">
        <h2 className="font-display text-sm font-bold text-foreground border-b border-border/60 pb-2">
          Current Programme
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="border border-border bg-card p-4 rounded-md">
            <span className="block font-display text-2xl font-bold text-foreground">
              {patientList.length}
            </span>
            <span className="block text-muted-foreground font-medium mt-1">Patients enrolled</span>
          </div>
          <div className="border border-border bg-card p-4 rounded-md">
            <span className="block font-display text-2xl font-bold text-foreground">
              {patientList.filter((p) => p.battery > 15).length}
            </span>
            <span className="block text-muted-foreground font-medium mt-1">
              Currently monitored
            </span>
          </div>
          <div className="border border-border bg-card p-4 rounded-md">
            <span className="block font-display text-2xl font-bold text-foreground">
              {missedDosesCount}
            </span>
            <span className="block text-muted-foreground font-medium mt-1">Missed doses today</span>
          </div>
          <div className="border border-border bg-card p-4 rounded-md">
            <span className="block font-display text-2xl font-bold text-foreground">
              {patientsRequiringAttention}
            </span>
            <span className="block text-muted-foreground font-medium mt-1">Require attention</span>
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
                  {patientList.map((p) => (
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
