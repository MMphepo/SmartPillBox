import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BatteryWarning,
  Phone,
  ShieldCheck,
  Stethoscope,
  ClipboardPlus,
  Radio,
  Clock,
  CheckCircle2,
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
          The requested patient ID does not match any registered cohort records.
        </p>
        <Button asChild size="sm" className="font-semibold text-xs">
          <Link to="/health-worker/patients">← Return to Patient Cohort Directory</Link>
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
      notes: notes || "Routine clinical follow-up or counselling logged.",
    });
    setNotes("");
    setModalOpen(false);
    toast.success("Field intervention saved", { description: `${type} · ${patient.name}` });
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/health-worker/patients"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Patient Cohort Directory
      </Link>

      {/* Main Header Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                {patient.name}
              </h1>
              <Badge
                variant={patient.phase === "Intensive" ? "destructive" : "secondary"}
                className="text-xs font-bold"
              >
                {patient.phase} Phase
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {patient.sex}, {patient.age} years old · Facility Catchment:{" "}
              <strong>{patient.facility}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setModalOpen(true)} className="text-xs font-bold">
              <ClipboardPlus className="mr-1.5 h-3.5 w-3.5" /> Log Field Action
            </Button>
            <Button asChild size="sm" variant="outline" className="text-xs font-semibold">
              <a href={`tel:${patient.phone.replaceAll(" ", "")}`}>
                <Phone className="mr-1.5 h-3.5 w-3.5" /> Call Patient ({patient.phone})
              </a>
            </Button>
          </div>
        </div>

        {/* Clinical Overview Grid */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-xs">
          <div className="rounded-lg bg-muted/40 p-3.5 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
              <Radio className="h-3 w-3 text-primary" /> Smart Box Serial
            </span>
            <p className="font-mono text-sm font-bold mt-1 text-foreground">{patient.boxId}</p>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              <BatteryWarning
                className={`h-3.5 w-3.5 ${patient.battery < 30 ? "text-destructive" : "text-emerald-600"}`}
              />
              Battery: {patient.battery}%
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3.5 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" /> Treatment Schedule
            </span>
            <p className="font-semibold text-sm mt-1 text-foreground">
              Day {patient.treatmentDay} of 180
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Scheduled window: {patient.doseTime}
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3.5 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> 30-Day Adherence
            </span>
            <p className="font-semibold text-sm mt-1 text-foreground">{rate}%</p>
            <Progress value={rate} className="h-1.5 mt-2" />
          </div>

          <div className="rounded-lg bg-muted/40 p-3.5 border border-border">
            <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              Dosing Streak
            </span>
            <p className="font-semibold text-sm mt-1 text-foreground">
              {currentStreak} Days Consecutive
            </p>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">
              Regimen: {patient.regimen}
            </p>
          </div>
        </div>
      </div>

      {/* Triad Information (Guardian & HSA) */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
            <h2 className="font-display text-sm font-bold text-foreground">
              Designated Family Guardian / Supporter
            </h2>
          </div>
          {g ? (
            <div className="text-xs space-y-1.5 bg-muted/30 p-3 rounded-lg border border-border">
              <p className="font-bold text-foreground text-sm">{g.name}</p>
              <p className="text-muted-foreground font-medium">
                Relation: <strong>{g.relation}</strong>
              </p>
              <p className="text-muted-foreground flex items-center gap-1 font-medium">
                <Phone className="h-3.5 w-3.5 text-primary" /> {g.phone}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No guardian assigned for this record.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Stethoscope className="h-5 w-5 text-primary shrink-0" />
            <h2 className="font-display text-sm font-bold text-foreground">
              Assigned Health Surveillance Assistant
            </h2>
          </div>
          {hsa ? (
            <div className="text-xs space-y-1.5 bg-muted/30 p-3 rounded-lg border border-border">
              <p className="font-bold text-foreground text-sm">{hsa.name}</p>
              <p className="text-muted-foreground font-medium">
                {hsa.role} · {hsa.facility}
              </p>
              <p className="text-muted-foreground flex items-center gap-1 font-medium">
                <Phone className="h-3.5 w-3.5 text-primary" /> {hsa.phone}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No HSA currently assigned.</p>
          )}
        </div>
      </div>

      {/* 30-Day Adherence Calendar Grid */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <h2 className="font-display text-base font-bold text-foreground">
          30-Day Adherence History Calendar
        </h2>
        <AdherenceCalendar doses={doses.slice(-30)} />
        <AdherenceLegend />
      </div>

      {/* Field Intervention Log Feed */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-display text-base font-bold text-foreground">
            Field Intervention & Follow-up Log
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalOpen(true)}
            className="text-xs font-semibold h-8"
          >
            <ClipboardPlus className="mr-1 h-3.5 w-3.5" /> Add Log Entry
          </Button>
        </div>

        {patientInterventions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            No community field interventions logged for this patient record yet.
          </p>
        ) : (
          <div className="space-y-3 text-xs">
            {patientInterventions.map((i) => (
              <div
                key={i.id}
                className="rounded-lg border border-border bg-muted/20 p-3.5 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-bold">
                    {i.type}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {i.loggedAt}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed pt-1 font-medium">{i.notes}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Action Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Field Action for {patient.name}</DialogTitle>
            <DialogDescription>
              Record a home visit, phone consultation, pill resupply or counselling session note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Action Type</Label>
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
              <Label className="text-xs font-semibold">Clinical Notes & Observations</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of observations, counsel provided, or next agreed steps..."
                className="text-xs min-h-[90px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={submitIntervention} className="text-xs font-bold">
              Save Action Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
