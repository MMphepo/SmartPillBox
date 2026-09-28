import { createFileRoute } from "@tanstack/react-router";
import { PortalSelector } from "@/components/auth/PortalSelector";

export const Route = createFileRoute("/login/")({
  head: () => ({
    meta: [{ title: "Select Portal — Malawi MoH TB Adherence Portal" }],
  }),
  component: LoginIndex,
});

function LoginIndex() {
  return <PortalSelector />;
}
