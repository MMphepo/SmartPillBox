import { Radio, Zap } from "lucide-react";
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

const events: { value: SimEvent; label: string; desc: string }[] = [
  {
    value: "DOSE_TAKEN_ON_TIME",
    label: "DOSE_TAKEN_ON_TIME",
    desc: "Simulate on-time box opening within scheduled window",
  },
  {
    value: "DOSE_TAKEN_LATE",
    label: "DOSE_TAKEN_LATE",
    desc: "Simulate delayed box opening after scheduled window",
  },
  {
    value: "MISSED_DOSE_ALERT",
    label: "MISSED_DOSE_ALERT",
    desc: "Trigger automated missed-dose alert & triage queue entry",
  },
  {
    value: "LOW_BATTERY_WARNING",
    label: "LOW_BATTERY_WARNING",
    desc: "Trigger hardware low battery alert for maintenance",
  },
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
    toast.success("Telemetry Packet Transmitted", {
      description: `${patient.boxId} → ${event}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full justify-start text-xs font-bold gap-2">
          <Radio className="h-4 w-4 text-emerald-400 animate-pulse shrink-0" />
          <span>Smart Box Simulator</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">
              Smart Box Hardware Telemetry Simulator
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs leading-relaxed pt-1">
            Simulate real-time GSM/SMS transmissions from deployed smart pill box hardware modules
            to verify automated adherence calendar updates, guardian alerts, and triage queueing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Target Patient & Smart Box Serial</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name} — <span className="font-mono font-bold">{p.boxId}</span> ({p.facility})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Telemetry Event Signal</Label>
            <Select value={event} onValueChange={(v) => setEvent(v as SimEvent)}>
              <SelectTrigger className="text-xs h-9 font-mono font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e.value} value={e.value} className="text-xs">
                    <div>
                      <span className="font-mono font-bold">{e.label}</span>
                      <span className="block text-[10px] text-muted-foreground font-sans">
                        {e.desc}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Synthetic GSM/SMS Packet Stream
            </Label>
            <pre className="overflow-x-auto rounded-lg bg-muted/80 p-3 font-mono text-[11px] text-foreground border border-border">
              {`SB|${patient.boxId}|EVT:${event}|BAT:${patient.battery}%|SIG:4|RSI:-72dBm`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={run} className="text-xs font-bold w-full sm:w-auto">
            Transmit SMS Payload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
