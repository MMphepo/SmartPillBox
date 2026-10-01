import { createFileRoute } from "@tanstack/react-router";
import { Users, UserCheck, Stethoscope, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { healthWorkers, patients } from "@/lib/tb-data";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [{ title: "User Management — Administrator Portal" }],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">
          System Users & Personnel Directory
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Authorized personnel accounts across Health Surveillance Assistants, Program
          Administrators, and Enrolled Patients
        </p>
      </header>

      {/* Health Workers Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden space-y-3 p-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-bold text-foreground">
            Health Surveillance Assistants & Clinicians
          </h2>
        </div>

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-semibold">Staff Name</TableHead>
              <TableHead className="text-xs font-semibold">Role</TableHead>
              <TableHead className="text-xs font-semibold">Facility Assignment</TableHead>
              <TableHead className="text-xs font-semibold">Contact Phone</TableHead>
              <TableHead className="text-xs font-semibold text-right">Account Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {healthWorkers.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-bold text-xs text-foreground">{h.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{h.role}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{h.facility}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{h.phone}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="text-[10px]">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Patients Accounts Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden space-y-3 p-4">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <UserCheck className="h-4 w-4 text-emerald-600" />
          <h2 className="font-display text-sm font-bold text-foreground">
            Enrolled Patient Accounts
          </h2>
        </div>

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-semibold">Patient Name</TableHead>
              <TableHead className="text-xs font-semibold">Facility</TableHead>
              <TableHead className="text-xs font-semibold">Treatment Phase</TableHead>
              <TableHead className="text-xs font-semibold">Smart Box Serial</TableHead>
              <TableHead className="text-xs font-semibold text-right">Account Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-bold text-xs text-foreground">{p.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{p.facility}</TableCell>
                <TableCell className="text-xs">
                  <Badge
                    variant={p.phase === "Intensive" ? "destructive" : "secondary"}
                    className="text-[10px]"
                  >
                    {p.phase}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{p.boxId}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary" className="text-[10px]">
                    Enrolled
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
