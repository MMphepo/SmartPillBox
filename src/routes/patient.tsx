import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PatientShell } from "@/components/layout/PatientShell";

export const Route = createFileRoute("/patient")({
  head: () => ({
    meta: [{ title: "Patient Portal — Malawi MoH Digital TB System" }],
  }),
  component: PatientLayout,
});

function PatientLayout() {
  return (
    <AuthGuard allowedRole="patient">
      <PatientShell>
        <Outlet />
      </PatientShell>
    </AuthGuard>
  );
}
