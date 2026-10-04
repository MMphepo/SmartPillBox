import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Phone, Plus, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdherenceCalendar, AdherenceLegend } from "@/components/tb/AdherenceCalendar";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { healthWorkers, type Intervention, type Phase } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/health-worker/patients/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Patient Record (${params.id}) — Health Worker Portal` }],
  }),
  component: HealthWorkerPatientDetail,
});

export function HealthWorkerPatientDetail() {
  const { id } = Route.useParams();
  const {
    patientList,
    patientDoses,
    adherenceRate,
    streak,
    interventions,
    logIntervention,
    updateDoseSchedule,
    today,
  } = useTB();

  const patient = patientList.find((p) => p.id === id);

  // Intervention Modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<Intervention["type"]>("Home visit");
  const [actionNotes, setNotes] = useState("");

  // Schedule Management State
  const [doseTime, setDoseTime] = useState(patient?.doseTime || "08:00");
  const [regimen, setRegimen] = useState(patient?.regimen || "2HRZE / 4HR");
  const [phase, setPhase] = useState<Phase>(patient?.phase || "Intensive");
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  if (!patient) {
    return (
      <div className="py-12 text-center space-y-4">
        <h1 className="font-display text-lg font-bold text-foreground">Patient Record Not Found</h1>
        <Button asChild size="sm" variant="outline" className="font-medium text-xs border-border">
          <Link to="/health-worker/patients">← Return to Patients List</Link>
        </Button>
      </div>
    );
  }

  const hsa = healthWorkers.find((x) => x.id === patient.hsaId);
  const doses = patientDoses(patient.id);
  const rate = adherenceRate(patient.id);
  const currentStreak = streak(patient.id);
  const patientInterventions = interventions.filter((i) => i.patientId === patient.id);
  const currentWeek = Math.ceil(patient.treatmentDay / 7);

  const todayDose = doses.find((d) => d.date === today);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError(null);

    if (!doseTime) {
      setScheduleError("Scheduled dose time is required.");
      return;
    }

    updateDoseSchedule(patient.id, { doseTime, regimen, phase });
    toast.success("Dose schedule updated successfully", {
      description: `New scheduled dose time: ${doseTime}`,
    });
  };

  const submitIntervention = () => {
    logIntervention({
      patientId: patient.id,
      hsaId: patient.hsaId,
      type: actionType,
      notes: actionNotes || "Clinical follow-up recorded.",
    });
    setNotes("");
    setActionModalOpen(false);
    toast.success("Intervention recorded", { description: `${actionType} · ${patient.name}` });
  };

  return (
    <div className="space-y-6">
      <Link
        to="/health-worker/patients"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to patient list
      </Link>

      {/* Patient Header Block */}
      <div className="border border-border bg-card p-5 rounded-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                {patient.name}
              </h1>
              <Badge variant="outline" className="text-xs font-mono font-semibold border-border">
                ID: {patient.id.toUpperCase()}
              </Badge>
              <Badge variant="secondary" className="text-xs font-medium">
                Active Treatment
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {patient.sex}, {patient.age} yrs · Assigned Facility: {patient.facility}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setActionModalOpen(true)}
              className="text-xs font-semibold h-8"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Log Action
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="text-xs font-medium border-border h-8"
            >
              <a href={`tel:${patient.phone.replaceAll(" ", "")}`}>
                <Phone className="mr-1.5 h-3.5 w-3.5" /> Call ({patient.phone})
              </a>
            </Button>
          </div>
        </div>

        {/* Treatment Specifications */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="block text-muted-foreground font-medium">Treatment Phase</span>
            <span className="block font-bold text-foreground mt-0.5">{patient.phase} Phase</span>
            <span className="block text-[11px] text-muted-foreground mt-0.5">
              Week {currentWeek} (Day {patient.treatmentDay}/180)
            </span>
          </div>

          <div>
            <span className="block text-muted-foreground font-medium">Scheduled Dose Time</span>
            <span className="block font-bold text-foreground mt-0.5">{patient.doseTime} Daily</span>
            <span className="block text-[11px] text-muted-foreground mt-0.5">
              {patient.regimen}
            </span>
          </div>

          <div>
            <span className="block text-muted-foreground font-medium">Overall Adherence</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Progress value={rate} className="h-1.5 w-16" />
              <span className="font-bold text-foreground">{rate}%</span>
            </div>
          </div>

          <div>
            <span className="block text-muted-foreground font-medium">Smart Box Device</span>
            <span className="block font-mono font-bold text-foreground mt-0.5">
              {patient.boxId}
            </span>
            <span className="block text-[11px] text-muted-foreground mt-0.5">
              Battery: {patient.battery}% · Connected
            </span>
          </div>
        </div>
      </div>

      {/* Today's Schedule Section */}
      <section className="border border-border bg-card p-5 rounded-md space-y-3">
        <h2 className="font-display text-sm font-bold text-foreground border-b border-border pb-2">
          Today's Dose Schedule
        </h2>
        <div className="border border-border rounded-md overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold text-foreground">
                  Scheduled Time
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Medication Dose
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-xs font-semibold text-foreground text-right">
                  Recorded Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="text-xs">
                <TableCell className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {patient.doseTime}
                </TableCell>
                <TableCell className="text-muted-foreground">{patient.regimen}</TableCell>
                <TableCell>
                  {todayDose && todayDose.status !== "missed" ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                    >
                      Taken
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] font-medium">
                      Pending / Scheduled
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">
                  {todayDose ? todayDose.time : "--:--"}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Dose Schedule Management */}
      <section className="border border-border bg-card p-5 rounded-md space-y-4">
        <h2 className="font-display text-sm font-bold text-foreground border-b border-border pb-2">
          Manage Dose Schedule
        </h2>

        {scheduleError && <p className="text-xs font-semibold text-destructive">{scheduleError}</p>}

        <form
          onSubmit={handleScheduleSubmit}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs"
        >
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Daily Dose Time *</Label>
            <Input
              type="time"
              required
              value={doseTime}
              onChange={(e) => setDoseTime(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Treatment Regimen</Label>
            <Input
              value={regimen}
              onChange={(e) => setRegimen(e.target.value)}
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Treatment Phase</Label>
            <Select value={phase} onValueChange={(v) => setPhase(v as Phase)}>
              <SelectTrigger className="text-xs h-9 font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Intensive" className="text-xs">
                  Intensive Phase
                </SelectItem>
                <SelectItem value="Continuation" className="text-xs">
                  Continuation Phase
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <Button type="submit" size="sm" className="text-xs font-semibold h-8">
              Save Schedule Changes
            </Button>
          </div>
        </form>
      </section>

      {/* Adherence Summary & Calendar */}
      <section className="border border-border bg-card p-5 rounded-md space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="font-display text-sm font-bold text-foreground">
            30-Day Adherence History
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            Streak: {currentStreak} Consecutive Days
          </span>
        </div>
        <AdherenceCalendar doses={doses.slice(-30)} />
        <AdherenceLegend />
      </section>

      {/* Assigned HSA Contact & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-border bg-card p-5 rounded-md space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
            Assigned Health Surveillance Assistant
          </h2>
          {hsa ? (
            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <p className="font-bold text-foreground">{hsa.name}</p>
                <p className="text-muted-foreground">
                  {hsa.role} · {hsa.facility}
                </p>
              </div>
              <a
                href={`tel:${hsa.phone.replaceAll(" ", "")}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Phone className="h-3.5 w-3.5" /> Call ({hsa.phone})
              </a>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No HSA assigned.</p>
          )}
        </div>

        <div className="border border-border bg-card p-5 rounded-md space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
            Device Status
          </h2>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Device Serial:</span>
              <span className="font-mono font-bold text-foreground">{patient.boxId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Connectivity:</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                Connected
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Battery Level:</span>
              <span
                className={patient.battery < 25 ? "text-destructive font-bold" : "font-semibold"}
              >
                {patient.battery}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Field Intervention Log */}
      <section className="border border-border bg-card p-5 rounded-md space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-display text-sm font-bold text-foreground">Intervention Log</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActionModalOpen(true)}
            className="text-xs font-semibold h-7 border-border"
          >
            Log Entry
          </Button>
        </div>

        {patientInterventions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No field interventions recorded for this patient yet.
          </p>
        ) : (
          <div className="space-y-3 text-xs divide-y divide-border">
            {patientInterventions.map((i) => (
              <div key={i.id} className="pt-3 first:pt-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{i.type}</span>
                  <span className="text-[11px] text-muted-foreground">{i.loggedAt}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{i.notes}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Log Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Action for {patient.name}</DialogTitle>
            <DialogDescription className="text-xs">
              Record a clinical visit, telephone call, or counselling entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Intervention Type</Label>
              <Select
                value={actionType}
                onValueChange={(v) => setActionType(v as Intervention["type"])}
              >
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
                    Counselling
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notes</Label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Intervention details..."
                className="text-xs min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={submitIntervention} className="text-xs font-semibold">
              Save Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
