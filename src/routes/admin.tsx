import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AdminShell } from "@/components/layout/AdminShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Administrator Portal — Malawi MoH Digital TB System" }],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AuthGuard allowedRole="admin">
      <AdminShell>
        <Outlet />
      </AdminShell>
    </AuthGuard>
  );
}
