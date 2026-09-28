import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BatteryWarning,
  Phone,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  ClipboardPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdherenceCalendar, AdherenceLegend } from "@/components/tb/AdherenceCalendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { guardians, healthWorkers, patients, type Intervention } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/health-worker/patients/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Patient Record (${params.id}) — Health Worker Portal` }],
  }),
  component: HealthWorkerPatientDetail,
});

function HealthWorkerPatientDetail() {
  const { id } = Route.useParams();
  const { patientDoses, adherenceRate, streak, interventions, logIntervention } = useTB();
  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<Intervention["type"]>("Home visit");
  const [notes, setNotes] = useState("");

  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return (
      <div className="py-12 text-center space-y-4">
        <h1 className="font-display text-lg font-bold text-foreground">Patient Record Not Found</h1>
        <p className="text-xs text-muted-foreground">
          The specified patient ID does not exist in the programme records.
        </p>
        <Button asChild size="sm">
          <Link to="/health-worker/patients">← Return to Patient Directory</Link>
        </Button>
      </div>
    );
  }

  const g = guardians.find((x) => x.patientId === patient.id);
  const hsa = healthWorkers.find((x) => x.id === patient.hsaId);
  const doses = patientDoses(patient.id);
  const rate = adherenceRate(patient.id);
  const currentStreak = streak(patient.id);
  const patientInterventions = interventions.filter((i) => i.patientId === patient.id);

  const submitIntervention = () => {
    logIntervention({
      patientId: patient.id,
      hsaId: patient.hsaId,
      type,
      notes: notes || "Follow-up visit/call logged.",
    });
    setNotes("");
    setModalOpen(false);
    toast.success("Field action saved", { description: `${type} · ${patient.name}` });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/health-worker/patients"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Patient Directory
      </Link>

      {/* Main Header Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                {patient.name}
              </h1>
              <Badge
                variant={patient.phase === "Intensive" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {patient.phase} Phase
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {patient.sex}, {patient.age} years old · Facility: <strong>{patient.facility}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setModalOpen(true)} className="text-xs">
              <ClipboardPlus className="mr-1.5 h-3.5 w-3.5" /> Log Action Entry
            </Button>
            <Button asChild size="sm" variant="outline" className="text-xs">
              <a href={`tel:${patient.phone.replaceAll(" ", "")}`}>
                <Phone className="mr-1.5 h-3.5 w-3.5" /> Call Patient
              </a>
            </Button>
          </div>
        </div>

        {/* Clinical Grid Overview */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-xs">
          <div className="rounded-lg bg-muted/40 p-3 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-semibold">
              Smart Box Serial
            </span>
            <p className="font-mono text-sm font-bold mt-0.5 text-foreground">{patient.boxId}</p>
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <BatteryWarning
                className={`h-3 w-3 ${patient.battery < 30 ? "text-destructive" : "text-emerald-600"}`}
              />
              Battery: {patient.battery}%
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-semibold">
              Treatment Schedule
            </span>
            <p className="font-semibold text-sm mt-0.5 text-foreground">
              Day {patient.treatmentDay} of 180
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Daily Dose Window: {patient.doseTime}
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-semibold">
              30-Day Adherence Rate
            </span>
            <p className="font-semibold text-sm mt-0.5 text-foreground">{rate}%</p>
            <Progress value={rate} className="h-1.5 mt-1.5" />
          </div>

          <div className="rounded-lg bg-muted/40 p-3 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-semibold">
              Dosing Streak
            </span>
            <p className="font-semibold text-sm mt-0.5 text-foreground">
              {currentStreak} Consecutive Days
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">Regimen: {patient.regimen}</p>
          </div>
        </div>
      </div>

      {/* Triad Information (Guardian & HSA) */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600" />
            <h2 className="font-display text-sm font-bold text-foreground">
              Designated Guardian / Supporter
            </h2>
          </div>
          {g ? (
            <div className="text-xs space-y-1.5">
              <p className="font-semibold text-foreground">{g.name}</p>
              <p className="text-muted-foreground">Relation: {g.relation}</p>
              <p className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> {g.phone}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No guardian currently assigned.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-bold text-foreground">
              Assigned Health Surveillance Assistant
            </h2>
          </div>
          {hsa ? (
            <div className="text-xs space-y-1.5">
              <p className="font-semibold text-foreground">{hsa.name}</p>
              <p className="text-muted-foreground">
                {hsa.role} · {hsa.facility}
              </p>
              <p className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> {hsa.phone}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No HSA assigned.</p>
          )}
        </div>
      </div>

      {/* 30-Day Adherence History Calendar */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h2 className="font-display text-base font-bold text-foreground">
          30-Day Adherence Calendar
        </h2>
        <AdherenceCalendar doses={doses.slice(-30)} />
        <AdherenceLegend />
      </div>

      {/* Field Intervention Log for Patient */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h2 className="font-display text-base font-bold text-foreground">
            Field Intervention Log
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalOpen(true)}
            className="text-xs h-8"
          >
            <ClipboardPlus className="mr-1 h-3.5 w-3.5" /> Add Note
          </Button>
        </div>

        {patientInterventions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No field interventions logged for this patient yet.
          </p>
        ) : (
          <div className="space-y-3 text-xs">
            {patientInterventions.map((i) => (
              <div key={i.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{i.type}</span>
                  <span className="text-[10px] text-muted-foreground">{i.loggedAt}</span>
                </div>
                <p className="text-muted-foreground">{i.notes}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Action Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Action for {patient.name}</DialogTitle>
            <DialogDescription>
              Record a field visit, phone consultation, resupply or counselling note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs">Action Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as Intervention["type"])}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home visit" className="text-xs">
                    Home visit
                  </SelectItem>
                  <SelectItem value="Phone check-in" className="text-xs">
                    Phone check-in
                  </SelectItem>
                  <SelectItem value="Pill resupply" className="text-xs">
                    Pill resupply
                  </SelectItem>
                  <SelectItem value="Counselling" className="text-xs">
                    Counselling
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes / Observations</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of observations, counsel provided, or next agreed steps..."
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={submitIntervention} className="text-xs">
              Save Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
