import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ClipboardPlus } from "lucide-react";
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
    meta: [{ title: "Alerts & Triage Queue — Health Worker Portal" }],
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
      notes: notes || "Triage follow-up intervention logged.",
    });
    setNotes("");
    setModalPatient(null);
    toast.success("Field action logged", { description: `${type} · ${patient.name}` });
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Missed-Dose & Hardware Triage Queue
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            System-generated alerts for missed doses, low box batteries, and patient assistance
            requests
          </p>
        </div>
        <Badge
          variant={unresolved.length > 0 ? "destructive" : "secondary"}
          className="text-xs font-bold px-3 py-1"
        >
          {unresolved.length} Unresolved
        </Badge>
      </header>

      {/* Unresolved Active Alerts */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Unresolved Priority Alerts ({unresolved.length})
        </h2>
        {unresolved.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-foreground">All Alerts Fully Triaged</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              There are currently no active unresolved alerts requiring health worker follow-up.
            </p>
          </div>
        ) : (
          unresolved.map((a) => {
            const p = patients.find((x) => x.id === a.patientId)!;
            return (
              <div
                key={a.id}
                className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTriangle
                      className={`h-4 w-4 shrink-0 ${a.severity === "high" ? "text-destructive" : "text-amber-500"}`}
                    />
                    <Link
                      to="/health-worker/patients/$id"
                      params={{ id: p.id }}
                      className="font-bold text-sm text-foreground hover:underline"
                    >
                      {p.name}
                    </Link>
                    <Badge
                      variant={a.severity === "high" ? "destructive" : "outline"}
                      className="text-[10px] uppercase font-bold"
                    >
                      {a.kind.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.message}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Facility: {p.facility} · Pill Box:{" "}
                    <span className="font-mono font-bold text-foreground">{p.boxId}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t border-border pt-3 sm:border-0 sm:pt-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setModalPatient(p.id)}
                    className="text-xs font-semibold h-8"
                  >
                    <ClipboardPlus className="mr-1.5 h-3.5 w-3.5" /> Log Visit / Call
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      resolveAlert(a.id);
                      toast.success("Alert marked as resolved");
                    }}
                    className="text-xs font-bold h-8"
                  >
                    Resolve Alert
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Resolved Alert History */}
      {resolved.length > 0 && (
        <section className="space-y-3 pt-6 border-t border-border">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Resolved Alert History ({resolved.length})
          </h2>
          <div className="space-y-2 opacity-85">
            {resolved.map((a) => {
              const p = patients.find((x) => x.id === a.patientId)!;
              return (
                <div
                  key={a.id}
                  className="rounded-lg border border-border bg-muted/30 p-3 text-xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-foreground">{p?.name}</span>:{" "}
                    <span className="text-muted-foreground">{a.message}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-semibold shrink-0">
                    Resolved
                  </Badge>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Log Triage Action Modal */}
      <Dialog open={modalPatient !== null} onOpenChange={(o) => !o && setModalPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Triage Follow-up Action</DialogTitle>
            <DialogDescription>
              Record a home visit, phone consultation, or counselling note for this alert.
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
              <Label className="text-xs font-semibold">Clinical Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of observations or action taken..."
                className="text-xs min-h-[90px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={submitIntervention} className="text-xs font-bold">
              Save Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
