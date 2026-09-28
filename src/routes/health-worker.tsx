import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BatteryWarning,
  ClipboardPlus,
  PhoneCall,
  Radio,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdherenceLegend } from "@/components/tb/AdherenceCalendar";
import { StatCard } from "@/components/tb/StatCard";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  facilities,
  guardians,
  healthWorkers,
  patients,
  type Intervention,
} from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/health-worker")({
  head: () => ({
    meta: [
      { title: "Health Worker Dashboard — Malawi MoH TB Adherence Portal" },
      {
        name: "description",
        content:
          "Clinical dashboard for HSAs and TB assistants: missed-dose triage, smart pill box telemetry and field intervention logging.",
      },
      { property: "og:title", content: "Health Worker Dashboard — Malawi MoH TB Adherence Portal" },
      {
        property: "og:description",
        content: "Triage missed doses, monitor pill box telemetry and log home visits across Malawian TB facilities.",
      },
    ],
  }),
  component: HealthWorkerPortal,
});

function HealthWorkerPortal() {
  const { alerts, telemetry, interventions, adherenceRate, resolveAlert, logIntervention } = useTB();
  const [facility, setFacility] = useState("all");
  const [phase, setPhase] = useState("all");
  const [guardian, setGuardian] = useState("all");
  const [modalPatient, setModalPatient] = useState<string | null>(null);
  const [type, setType] = useState<Intervention["type"]>("Home visit");
  const [notes, setNotes] = useState("");

  const openAlerts = alerts.filter((a) => !a.resolved);
  const cohort = Math.round(
    patients.reduce((sum, p) => sum + adherenceRate(p.id), 0) / patients.length,
  );
  const avgBattery = Math.round(patients.reduce((s, p) => s + p.battery, 0) / patients.length);

  const rows = useMemo(
    () =>
      patients.filter((p) => {
        const g = guardians.find((x) => x.patientId === p.id)!;
        return (
          (facility === "all" || p.facility === facility) &&
          (phase === "all" || p.phase === phase) &&
          (guardian === "all" || g.id === guardian)
        );
      }),
    [facility, phase, guardian],
  );

  const triage = [...openAlerts].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 } as const;
    return rank[a.severity] - rank[b.severity];
  });

  const submitIntervention = () => {
    if (!modalPatient) return;
    const patient = patients.find((p) => p.id === modalPatient)!;
    logIntervention({
      patientId: modalPatient,
      hsaId: patient.hsaId,
      type,
      notes: notes || "No additional notes.",
    });
    setNotes("");
    setModalPatient(null);
    toast.success("Field action logged", { description: `${type} · ${patient.name}` });
  };

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold sm:text-2xl">Clinical Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            HSA John Phiri · Zomba Central Hospital · TB Assistant
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {openAlerts.length} open alerts
        </Badge>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total active patients" value={patients.length} icon={Users} />
        <StatCard label="Cohort adherence" value={`${cohort}%`} icon={Activity} tone="success" />
        <StatCard
          label="Missed dose alerts"
          value={openAlerts.filter((a) => a.kind === "MISSED_DOSE_ALERT").length}
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard label="Avg box battery" value={`${avgBattery}%`} icon={BatteryWarning} tone="warning" />
      </section>

      <Tabs defaultValue="triage">
        <TabsList>
          <TabsTrigger value="triage">Triage queue</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="telemetry">SMS telemetry</TabsTrigger>
          <TabsTrigger value="field">Field log</TabsTrigger>
        </TabsList>

        <TabsContent value="triage" className="mt-4 space-y-3">
          {triage.length === 0 ? (
            <p className="card-surface p-6 text-sm text-muted-foreground">
              No open alerts. The cohort is fully triaged.
            </p>
          ) : (
            triage.map((a) => {
              const p = patients.find((x) => x.id === a.patientId)!;
              return (
                <div
                  key={a.id}
                  className="card-surface grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{p.name}</span>
                      <Badge variant={p.phase === "Intensive" ? "destructive" : "secondary"}>
                        {p.phase} phase
                      </Badge>
                      <Badge
                        variant={a.severity === "high" ? "destructive" : "outline"}
                        className="uppercase"
                      >
                        {a.kind.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.boxId} · {p.facility} · Day {p.treatmentDay} of 180
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setModalPatient(p.id)}>
                      <ClipboardPlus className="h-4 w-4" />
                      Log action
                    </Button>
                    <Button size="sm" onClick={() => { resolveAlert(a.id); toast.success("Alert resolved"); }}>
                      Resolve
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="patients" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Facility</Label>
              <Select value={facility} onValueChange={setFacility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All facilities</SelectItem>
                  {facilities.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Treatment phase</Label>
              <Select value={phase} onValueChange={setPhase}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All phases</SelectItem>
                  <SelectItem value="Intensive">Intensive</SelectItem>
                  <SelectItem value="Continuation">Continuation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Guardian</Label>
              <Select value={guardian} onValueChange={setGuardian}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All guardians</SelectItem>
                  {guardians.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="card-surface overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Phase / Day</TableHead>
                  <TableHead>Smart box</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Adherence</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => {
                  const g = guardians.find((x) => x.patientId === p.id)!;
                  const rate = adherenceRate(p.id);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.facility}</TableCell>
                      <TableCell>
                        <Badge variant={p.phase === "Intensive" ? "destructive" : "secondary"}>
                          {p.phase}
                        </Badge>
                        <span className="ml-2 text-xs text-muted-foreground">Day {p.treatmentDay}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.boxId}</TableCell>
                      <TableCell className={p.battery < 30 ? "text-destructive" : ""}>{p.battery}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={rate} className="h-2 w-16" />
                          <span className="text-xs">{rate}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {g.name} ({g.relation})
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setModalPatient(p.id)}>
                          Log visit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <AdherenceLegend />
        </TabsContent>

        <TabsContent value="telemetry" className="mt-4 space-y-2">
          {telemetry.map((t) => (
            <div key={t.id} className="card-surface grid gap-1 p-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Radio className="h-4 w-4 text-primary" />
                <span className="font-semibold">{t.boxId}</span>
                <Badge variant={t.event === "MISSED_DOSE_ALERT" ? "destructive" : "secondary"}>
                  {t.event}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(t.receivedAt).toLocaleString()}
                </span>
              </div>
              <code className="overflow-x-auto text-xs text-muted-foreground">{t.raw}</code>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="field" className="mt-4 space-y-3">
          <Button onClick={() => setModalPatient(patients[0].id)}>
            <ClipboardPlus className="h-4 w-4" />
            New field action
          </Button>
          {interventions.map((i) => {
            const p = patients.find((x) => x.id === i.patientId)!;
            const h = healthWorkers.find((x) => x.id === i.hsaId)!;
            return (
              <div key={i.id} className="card-surface p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{i.type}</Badge>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{i.loggedAt} · {h.name}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{i.notes}</p>
                <a
                  href={`tel:${p.phone.replaceAll(" ", "")}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <PhoneCall className="h-4 w-4" /> Call {p.phone}
                </a>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>

      <Dialog open={modalPatient !== null} onOpenChange={(o) => !o && setModalPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log field action</DialogTitle>
            <DialogDescription>
              Record a home visit, phone check-in, resupply or counselling session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={modalPatient ?? ""} onValueChange={setModalPatient}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action type</Label>
              <Select value={type} onValueChange={(v) => setType(v as Intervention["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home visit">Home visit</SelectItem>
                  <SelectItem value="Phone check-in">Phone check-in</SelectItem>
                  <SelectItem value="Pill resupply">Pill resupply</SelectItem>
                  <SelectItem value="Counselling">Counselling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What was observed or agreed with the patient?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submitIntervention}>Save action</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
