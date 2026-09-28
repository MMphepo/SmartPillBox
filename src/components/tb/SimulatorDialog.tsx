import { Radio } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { patients } from "@/lib/tb-data";
import { useTB, type SimEvent } from "@/lib/tb-store";

const events: { value: SimEvent; label: string }[] = [
  { value: "DOSE_TAKEN_ON_TIME", label: "DOSE_TAKEN_ON_TIME" },
  { value: "DOSE_TAKEN_LATE", label: "DOSE_TAKEN_LATE" },
  { value: "MISSED_DOSE_ALERT", label: "MISSED_DOSE_ALERT" },
  { value: "LOW_BATTERY_WARNING", label: "LOW_BATTERY_WARNING" },
];

export function SimulatorDialog() {
  const { simulate, setActivePatientId } = useTB();
  const [open, setOpen] = useState(false);
  const [patientId, setPatientId] = useState("pat-1");
  const [event, setEvent] = useState<SimEvent>("DOSE_TAKEN_ON_TIME");

  const patient = patients.find((p) => p.id === patientId)!;

  const run = () => {
    simulate(patientId, event);
    setActivePatientId(patientId);
    setOpen(false);
    toast.success("Smart box transmission received", {
      description: `${patient.boxId} → ${event}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="shrink-0">
          <Radio className="h-4 w-4" />
          <span className="hidden sm:inline">Simulate Smart Box</span>
          <span className="sm:hidden">Simulate</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simulate Smart Box Transmission</DialogTitle>
          <DialogDescription>
            Push a synthetic SMS from a pill box into the system. Patient calendars, guardian feeds
            and the triage queue update immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Patient / Pill Box ID</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.boxId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Event type</Label>
            <Select value={event} onValueChange={(v) => setEvent(v as SimEvent)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            {`SB|${patient.boxId}|EVT:${event}|BAT:${patient.battery}|SIG:4`}
          </pre>
        </div>

        <DialogFooter>
          <Button onClick={run}>Trigger transmission</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
