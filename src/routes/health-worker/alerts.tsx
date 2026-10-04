import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

export const Route = createFileRoute("/health-worker/alerts")({
  head: () => ({
    meta: [{ title: "Triage Queue — Health Worker Portal" }],
  }),
  component: HealthWorkerAlerts,
});

function HealthWorkerAlerts() {
  const { alerts, resolveAlert, logIntervention } = useTB();
  const [modalPatient, setModalPatient] = useState<string | null>(null);
  const [type, setType] = useState<Intervention["type"]>("Home visit");
  const [notes, setNotes] = useState("");

  const unresolved = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);

  const submitIntervention = () => {
    if (!modalPatient) return;
    const patient = patients.find((p) => p.id === modalPatient)!;
    logIntervention({
      patientId: modalPatient,
      hsaId: patient.hsaId,
      type,
      notes: notes || "Triage action logged.",
    });
    setNotes("");
    setModalPatient(null);
    toast.success("Intervention recorded", { description: `${type} · ${patient.name}` });
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Triage Queue
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Clinical alert management and patient contact queue
          </p>
        </div>
        <Badge
          variant={unresolved.length > 0 ? "destructive" : "outline"}
          className="text-xs font-semibold px-2.5 py-0.5 border-border"
        >
          {unresolved.length} Unresolved
        </Badge>
      </header>

      {/* Unresolved Active Alerts */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Active Alerts ({unresolved.length})
        </h2>

        {unresolved.length === 0 ? (
          <div className="border border-border bg-card p-8 rounded-md text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
            <span className="font-medium text-foreground">Triage Queue Empty</span>
            <span>All adherence alerts have been reviewed and resolved.</span>
          </div>
        ) : (
          <div className="border border-border bg-card rounded-md divide-y divide-border">
            {unresolved.map((a) => {
              const p = patients.find((x) => x.id === a.patientId)!;
              return (
                <div
                  key={a.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to="/health-worker/patients/$id"
                        params={{ id: p.id }}
                        className="font-bold text-foreground text-sm hover:underline"
                      >
                        {p.name}
                      </Link>
                      <Badge
                        variant={a.severity === "high" ? "destructive" : "secondary"}
                        className="text-[10px] uppercase font-semibold"
                      >
                        {a.kind.replaceAll("_", " ")}
                      </Badge>
                      <span className="text-muted-foreground">Facility: {p.facility}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{a.message}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Box Serial: {p.boxId}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t border-border/40 pt-3 sm:border-0 sm:pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setModalPatient(p.id)}
                      className="text-xs h-8 border-border font-medium"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Log Action
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        resolveAlert(a.id);
                        toast.success("Alert resolved");
                      }}
                      className="text-xs font-semibold h-8"
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

      {/* Resolved Alert History Table */}
      {resolved.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-border">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Resolved Alerts ({resolved.length})
          </h2>
          <div className="border border-border bg-card rounded-md divide-y divide-border text-xs">
            {resolved.map((a) => {
              const p = patients.find((x) => x.id === a.patientId)!;
              return (
                <div key={a.id} className="p-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="font-bold text-foreground">{p?.name}</span>:{" "}
                    <span className="text-muted-foreground">{a.message}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0 font-medium">
                    Resolved
                  </Badge>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Log Action Dialog */}
      <Dialog open={modalPatient !== null} onOpenChange={(o) => !o && setModalPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Action</DialogTitle>
            <DialogDescription className="text-xs">
              Record follow-up action for this alert.
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
              <Label className="text-xs font-semibold">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of action taken..."
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
