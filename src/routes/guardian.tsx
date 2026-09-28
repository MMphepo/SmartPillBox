import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { GuardianShell } from "@/components/layout/GuardianShell";

export const Route = createFileRoute("/guardian")({
  head: () => ({
    meta: [{ title: "Guardian Portal — Malawi MoH Digital TB System" }],
  }),
  component: GuardianLayout,
});

function GuardianLayout() {
  return (
    <AuthGuard allowedRole="guardian">
      <GuardianShell>
        <Outlet />
      </GuardianShell>
    </AuthGuard>
  );
}
