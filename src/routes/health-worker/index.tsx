import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/health-worker/")({
  component: () => <Navigate to="/health-worker/dashboard" replace />,
});
