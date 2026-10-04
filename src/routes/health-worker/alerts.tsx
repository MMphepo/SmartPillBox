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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { useTB } from "@/lib/tb-store";
import type { Intervention } from "@/lib/tb-data";

export const Route = createFileRoute("/health-worker/alerts")({
  head: () => ({
    meta: [{ title: "Alerts — Health Worker Portal" }],
  }),
  component: HealthWorkerAlerts,
});

export function HealthWorkerAlerts() {
  const { patientList, alerts, resolveAlert, logIntervention } = useTB();
  const [modalPatient, setModalPatient] = useState<string | null>(null);
  const [type, setType] = useState<Intervention["type"]>("Home visit");
  const [notes, setNotes] = useState("");

  const unresolved = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);

  const submitIntervention = () => {
    if (!modalPatient) return;
    const patient = patientList.find((p) => p.id === modalPatient)!;
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
            Missed-Dose Alerts & Triage
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active alerts requiring clinical review, patient follow-up, or hardware maintenance
          </p>
        </div>
        <Badge
          variant={unresolved.length > 0 ? "destructive" : "outline"}
          className="text-xs font-semibold border-border px-2.5 py-0.5"
        >
          {unresolved.length} Unresolved
        </Badge>
      </header>

      {/* Unresolved Alerts Table */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Requires Attention ({unresolved.length})
        </h2>

        {unresolved.length === 0 ? (
          <div className="border border-border bg-card p-8 rounded-md text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-foreground">No alerts require attention.</span>
          </div>
        ) : (
          <div className="border border-border bg-card rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-foreground">Patient</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">
                    Alert Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">
                    Alert Message
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">Time</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unresolved.map((a) => {
                  const p = patientList.find((x) => x.id === a.patientId)!;
                  const time = new Date(a.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <TableRow key={a.id} className="hover:bg-muted/20 transition-colors text-xs">
                      <TableCell className="font-bold text-foreground">
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
                      <TableCell>
                        <Badge
                          variant={a.severity === "high" ? "destructive" : "secondary"}
                          className="text-[10px] font-semibold uppercase"
                        >
                          {a.kind.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs leading-relaxed">
                        {a.message}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        Today, {time}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 border-border font-medium"
                          >
                            <Link to="/health-worker/patients/$id" params={{ id: p.id }}>
                              Review
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setModalPatient(p.id)}
                            className="text-xs h-7 border-border font-medium"
                          >
                            <Plus className="mr-1 h-3 w-3" /> Action
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              resolveAlert(a.id);
                              toast.success("Alert resolved");
                            }}
                            className="text-xs h-7 font-semibold"
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

      {/* Resolved Alerts Log */}
      {resolved.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-border">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Resolved Alerts ({resolved.length})
          </h2>
          <div className="border border-border bg-card rounded-md divide-y divide-border text-xs">
            {resolved.map((a) => {
              const p = patientList.find((x) => x.id === a.patientId)!;
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
            <DialogTitle>Log Intervention</DialogTitle>
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
