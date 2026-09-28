import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, AlertTriangle, BatteryWarning, ShieldCheck, Stethoscope, User, Users } from "lucide-react";

import { StatCard } from "@/components/tb/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { guardians, healthWorkers, patients } from "@/lib/tb-data";
import { useTB } from "@/lib/tb-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Programme Overview — Malawi MoH TB Adherence Portal" },
      {
        name: "description",
        content:
          "National overview of Smart Pill Box TB adherence: cohort adherence, active alerts and portals for health workers, patients and guardians.",
      },
      { property: "og:title", content: "Programme Overview — Malawi MoH TB Adherence Portal" },
      {
        property: "og:description",
        content:
          "Track TB treatment adherence across Malawian facilities with smart pill box telemetry, guardian support and health worker triage.",
      },
    ],
  }),
  component: Overview,
});

const portals = [
  {
    to: "/health-worker",
    icon: Stethoscope,
    title: "Health Worker Portal",
    who: "HSA / TB Assistant",
    points: ["Cohort dashboard & triage queue", "Smart box assignment & SMS logs", "Field intervention logger"],
  },
  {
    to: "/patient",
    icon: User,
    title: "Patient Portal",
    who: "Person on treatment",
    points: ["Next dose countdown & streak", "180-day regimen progress", "Discreet mode + Chichewa"],
  },
  {
    to: "/guardian",
    icon: ShieldCheck,
    title: "Guardian Portal",
    who: "Treatment supporter",
    points: ["Daily dose feed & alerts", "Mark assisted dose", "Direct line to the HSA"],
  },
] as const;

function Overview() {
  const { alerts, adherenceRate } = useTB();
  const openAlerts = alerts.filter((a) => !a.resolved);
  const cohort = Math.round(
    patients.reduce((sum, p) => sum + adherenceRate(p.id), 0) / patients.length,
  );
  const lowBattery = patients.filter((p) => p.battery < 30).length;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-gradient-moh p-6 text-primary-foreground sm:p-10">
        <Badge variant="secondary" className="mb-4">
          Ministry of Health · National TB Control Programme
        </Badge>
        <h1 className="max-w-3xl font-display text-2xl font-bold sm:text-4xl">
          Digital TB Treatment Adherence System
        </h1>
        <p className="mt-3 max-w-2xl text-sm opacity-90 sm:text-base">
          Smart pill boxes across Zomba, Bwaila and Machinga send an SMS every time a dose is opened.
          This portal turns that telemetry into action for health workers, patients and guardians.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/health-worker">Open clinical dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/patient">View patient portal</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active patients" value={patients.length} icon={Users} hint="3 facilities" />
        <StatCard
          label="Cohort adherence"
          value={`${cohort}%`}
          icon={Activity}
          tone="success"
          hint="Last 30 days"
        />
        <StatCard
          label="Open alerts"
          value={openAlerts.length}
          icon={AlertTriangle}
          tone="danger"
          hint="Awaiting HSA action"
        />
        <StatCard
          label="Low battery boxes"
          value={lowBattery}
          icon={BatteryWarning}
          tone="warning"
          hint="Below 30%"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {portals.map((p) => (
          <Link key={p.to} to={p.to} className="card-surface group p-5 transition-colors hover:border-primary">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
              <p.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold">{p.title}</h2>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.who}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {pt}
                </li>
              ))}
            </ul>
            <span className="mt-4 inline-block text-sm font-semibold text-primary group-hover:underline">
              Enter portal →
            </span>
          </Link>
        ))}
      </section>

      <section className="card-surface p-5">
        <h2 className="font-display text-lg font-bold">Care triads in the programme</h2>
        <p className="text-sm text-muted-foreground">
          Every patient is linked to a guardian and an assigned health surveillance assistant.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {patients.map((p) => {
            const g = guardians.find((x) => x.patientId === p.id)!;
            const h = healthWorkers.find((x) => x.id === p.hsaId)!;
            return (
              <div key={p.id} className="rounded-xl border border-border p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                  <p className="truncate font-semibold">{p.name}</p>
                  <Badge variant={p.phase === "Intensive" ? "destructive" : "secondary"}>{p.phase}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.boxId} · {p.facility}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Guardian: <span className="text-foreground">{g.name}</span> ({g.relation}) · HSA:{" "}
                  <span className="text-foreground">{h.name}</span>
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
