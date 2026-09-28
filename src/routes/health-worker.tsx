import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { HealthWorkerShell } from "@/components/layout/HealthWorkerShell";

export const Route = createFileRoute("/health-worker")({
  head: () => ({
    meta: [{ title: "Health Worker Portal — Malawi MoH Digital TB System" }],
  }),
  component: HealthWorkerLayout,
});

function HealthWorkerLayout() {
  return (
    <AuthGuard allowedRole="health_worker">
      <HealthWorkerShell>
        <Outlet />
      </HealthWorkerShell>
    </AuthGuard>
  );
}
