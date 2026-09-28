import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/patient/")({
  component: () => <Navigate to="/patient/dashboard" replace />,
});
