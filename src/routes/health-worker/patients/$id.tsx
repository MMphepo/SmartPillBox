import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Phone, Plus } from "lucide-react";
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
import { healthWorkers, patients, type Intervention } from "@/lib/tb-data";
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
        <Button asChild size="sm" variant="outline" className="font-medium text-xs border-border">
          <Link to="/health-worker/patients">← Return to Patient Cohort</Link>
        </Button>
      </div>
    );
  }

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
      notes: notes || "Clinical follow-up recorded.",
    });
    setNotes("");
    setModalOpen(false);
    toast.success("Intervention recorded", { description: `${type} · ${patient.name}` });
  };

  return (
    <div className="space-y-6">
      <Link
        to="/health-worker/patients"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to cohort list
      </Link>

      {/* Patient Profile Banner */}
      <div className="border border-border bg-card p-5 rounded-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                {patient.name}
              </h1>
              <Badge variant="outline" className="text-xs font-semibold border-border">
                {patient.phase} Phase
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {patient.sex}, {patient.age} yrs · Facility: {patient.facility}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
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

        {/* Clinical Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="block text-muted-foreground font-medium">Box Serial</span>
            <span className="block font-mono font-bold text-foreground mt-0.5">
              {patient.boxId}
            </span>
            <span className="block text-[11px] text-muted-foreground mt-0.5">
              Battery: {patient.battery}%
            </span>
          </div>

          <div>
            <span className="block text-muted-foreground font-medium">Treatment Day</span>
            <span className="block font-bold text-foreground mt-0.5">
              Day {patient.treatmentDay} of 180
            </span>
            <span className="block text-[11px] text-muted-foreground mt-0.5">
              Window: {patient.doseTime}
            </span>
          </div>

          <div>
            <span className="block text-muted-foreground font-medium">Adherence Rate</span>
            <div className="flex items-center gap-2 mt-0.5">
              <Progress value={rate} className="h-1.5 w-16" />
              <span className="font-bold text-foreground">{rate}%</span>
            </div>
          </div>

          <div>
            <span className="block text-muted-foreground font-medium">Current Streak</span>
            <span className="block font-bold text-foreground mt-0.5">{currentStreak} Days</span>
            <span className="block text-[11px] text-muted-foreground mt-0.5 truncate">
              {patient.regimen}
            </span>
          </div>
        </div>
      </div>

      {/* Assigned HSA Contact */}
      <div className="border border-border bg-card p-4 rounded-md space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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

      {/* 30-Day Adherence Calendar */}
      <div className="border border-border bg-card p-5 rounded-md space-y-4">
        <h2 className="font-display text-base font-bold text-foreground">
          30-Day Adherence History
        </h2>
        <AdherenceCalendar doses={doses.slice(-30)} />
        <AdherenceLegend />
      </div>

      {/* Field Intervention Log */}
      <div className="border border-border bg-card p-5 rounded-md space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-display text-base font-bold text-foreground">Intervention Log</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModalOpen(true)}
            className="text-xs font-semibold h-7 border-border"
          >
            Log Entry
          </Button>
        </div>

        {patientInterventions.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No field interventions logged to date.
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
      </div>

      {/* Log Action Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Action for {patient.name}</DialogTitle>
            <DialogDescription className="text-xs">
              Record a clinical visit, call, or counselling entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
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
                    Counselling
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notes</Label>
              <Textarea
                value={notes}
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
