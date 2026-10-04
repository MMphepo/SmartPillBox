import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Eye, UserX, Plus, CheckCircle } from "lucide-react";
import { toast } from "sonner";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { facilities, type Facility, type Patient, type Phase } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/health-worker/patients/")({
  head: () => ({
    meta: [{ title: "Patients — Health Worker Portal" }],
  }),
  component: HealthWorkerPatientsIndex,
});

type FilterStatus = "all" | "active" | "attention" | "missed" | "offline";

export function HealthWorkerPatientsIndex() {
  const { patientList, adherenceRate, alerts, enrolPatient } = useTB();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [facilityFilter, setFacilityFilter] = useState<string>("all");

  // Enrolment dialog state
  const [enrolOpen, setEnrolOpen] = useState(false);
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("30");
  const [sex, setSex] = useState<"Male" | "Female">("Male");
  const [phone, setPhone] = useState("+265 ");
  const [facility, setFacility] = useState<Facility>("Zomba Central Hospital");
  const [regimen, setRegimen] = useState("2HRZE / 4HR");
  const [phase, setPhase] = useState<Phase>("Intensive");
  const [doseTime, setDoseTime] = useState("08:00");
  const [boxId, setBoxId] = useState("BOX-ZOMBA-101");

  const openAlerts = alerts.filter((a) => !a.resolved);
  const attentionPatientIds = new Set(openAlerts.map((a) => a.patientId));
  const missedPatientIds = new Set(
    openAlerts.filter((a) => a.kind === "MISSED_DOSE_ALERT").map((a) => a.patientId),
  );

  const filteredPatients = useMemo(() => {
    return patientList.filter((p) => {
      const query = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.boxId.toLowerCase().includes(query);

      const matchesFacility = facilityFilter === "all" || p.facility === facilityFilter;

      let matchesStatus = true;
      if (statusFilter === "active") matchesStatus = p.battery > 15;
      if (statusFilter === "attention") matchesStatus = attentionPatientIds.has(p.id);
      if (statusFilter === "missed") matchesStatus = missedPatientIds.has(p.id);
      if (statusFilter === "offline") matchesStatus = p.battery <= 15;

      return matchesSearch && matchesFacility && matchesStatus;
    });
  }, [patientList, search, statusFilter, facilityFilter, attentionPatientIds, missedPatientIds]);

  const handleEnrolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Patient full name is required");
      return;
    }

    const created = enrolPatient({
      name,
      age: Number(age) || 30,
      sex,
      facility,
      phase,
      treatmentDay: 1,
      boxId: boxId || `BOX-${facility.substring(0, 3).toUpperCase()}-101`,
      battery: 100,
      guardianId: "grd-1",
      hsaId: "hsa-1",
      phone: phone || "+265 990 000 000",
      regimen,
      doseTime,
    });

    setCreatedPatient(created);
    toast.success("Patient enrolled successfully");
  };

  const resetFormAndClose = () => {
    setName("");
    setAge("30");
    setCreatedPatient(null);
    setEnrolOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
            Enrolled Patients
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Registered patient cohort monitoring and anti-TB therapy management
          </p>
        </div>
        <Button
          onClick={() => {
            setCreatedPatient(null);
            setEnrolOpen(true);
          }}
          size="sm"
          className="text-xs font-semibold h-8 shrink-0 self-start sm:self-auto"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Enrol Patient
        </Button>
      </header>

      {/* Search and Filters */}
      <div className="border border-border bg-card p-3.5 rounded-md space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID (e.g. TB-00482)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
            <SelectTrigger className="text-xs h-9 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Statuses
              </SelectItem>
              <SelectItem value="active" className="text-xs">
                Active Monitoring
              </SelectItem>
              <SelectItem value="attention" className="text-xs">
                Requires Attention
              </SelectItem>
              <SelectItem value="missed" className="text-xs">
                Missed Dose
              </SelectItem>
              <SelectItem value="offline" className="text-xs">
                Device Offline / Battery Low
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={facilityFilter} onValueChange={setFacilityFilter}>
            <SelectTrigger className="text-xs h-9 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Catchment Facilities
              </SelectItem>
              {facilities.map((f) => (
                <SelectItem key={f} value={f} className="text-xs">
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cohort Table */}
      <div className="border border-border bg-card rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-semibold text-foreground">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Patient ID</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Facility</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Treatment</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Adherence</TableHead>
              <TableHead className="text-xs font-semibold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-foreground text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                  <div className="space-y-1">
                    <UserX className="mx-auto h-5 w-5 text-muted-foreground/60" />
                    <p className="font-medium text-foreground">No matching patients found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((p) => {
                const rate = adherenceRate(p.id);
                const hasAttention = attentionPatientIds.has(p.id);
                const currentWeek = Math.ceil(p.treatmentDay / 7);

                return (
                  <TableRow key={p.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-bold text-xs text-foreground">
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
                    <TableCell className="font-mono text-xs text-foreground font-semibold">
                      {p.id.toUpperCase()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.facility}</TableCell>
                    <TableCell className="text-xs">
                      <span className="font-medium">Week {currentWeek}</span>
                      <span className="ml-1.5 text-[11px] text-muted-foreground">({p.phase})</span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <Progress value={rate} className="h-1.5 w-14" />
                        <span className="font-semibold">{rate}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {hasAttention ? (
                        <Badge variant="destructive" className="text-[10px] font-semibold">
                          Attention
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] font-medium">
                          Normal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-medium border-border"
                      >
                        <Link to="/health-worker/patients/$id" params={{ id: p.id }}>
                          <Eye className="mr-1 h-3.5 w-3.5" /> Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Patient Enrolment Modal Dialog */}
      <Dialog open={enrolOpen} onOpenChange={setEnrolOpen}>
        <DialogContent className="max-w-xl">
          {!createdPatient ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Enrol New Patient</DialogTitle>
                <DialogDescription className="text-xs">
                  Register a patient into the Digital TB Adherence System.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleEnrolSubmit} className="space-y-5 text-xs py-2">
                {/* 1. Patient Information */}
                <div className="space-y-3 border-b border-border pb-4">
                  <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                    1. Patient Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label className="text-xs font-semibold">Full Name *</Label>
                      <Input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Banda"
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label className="text-xs font-semibold">Contact Phone</Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+265..."
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Age</Label>
                      <Input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Sex</Label>
                      <Select value={sex} onValueChange={(v) => setSex(v as "Male" | "Female")}>
                        <SelectTrigger className="text-xs h-9 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male" className="text-xs">
                            Male
                          </SelectItem>
                          <SelectItem value="Female" className="text-xs">
                            Female
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 2. Treatment Information */}
                <div className="space-y-3 border-b border-border pb-4">
                  <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                    2. Treatment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Facility</Label>
                      <Select value={facility} onValueChange={(v) => setFacility(v as Facility)}>
                        <SelectTrigger className="text-xs h-9 font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {facilities.map((f) => (
                            <SelectItem key={f} value={f} className="text-xs">
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Regimen</Label>
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
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Scheduled Dose Time</Label>
                      <Input
                        type="time"
                        value={doseTime}
                        onChange={(e) => setDoseTime(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Device Assignment */}
                <div className="space-y-3">
                  <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                    3. Device Assignment
                  </h3>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Smart Pill Box Serial ID</Label>
                    <Input
                      value={boxId}
                      onChange={(e) => setBoxId(e.target.value)}
                      placeholder="BOX-ZOMBA-101"
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEnrolOpen(false)}
                    className="text-xs h-9 border-border"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="text-xs font-semibold h-9">
                    Enrol Patient
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-6 py-4 text-xs">
              <div className="border border-border bg-card p-4 rounded-md space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span>Patient Enrolled Successfully</span>
                </div>
                <p className="text-muted-foreground">
                  <strong>{createdPatient.name}</strong> has been enrolled and assigned to box{" "}
                  <code className="font-mono text-foreground font-bold">
                    {createdPatient.boxId}
                  </code>
                  .
                </p>
                <div className="border-t border-border pt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Patient ID:</span>{" "}
                    <strong className="text-foreground">{createdPatient.id.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Scheduled Dose:</span>{" "}
                    <strong className="text-foreground">{createdPatient.doseTime}</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Button
                  onClick={() => {
                    const pid = createdPatient.id;
                    resetFormAndClose();
                    navigate({ to: "/health-worker/patients/$id", params: { id: pid } });
                  }}
                  className="text-xs font-semibold flex-1 h-9"
                >
                  Set Dose Schedule / View Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={resetFormAndClose}
                  className="text-xs font-medium border-border flex-1 h-9"
                >
                  Return to Patient List
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
