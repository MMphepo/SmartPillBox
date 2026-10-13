import { createFileRoute } from "@tanstack/react-router";
import { PortalSelector } from "@/components/auth/PortalSelector";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Portal Selector | Malawi MoH TB Adherence System" },
      {
        name: "description",
        content:
          "Entry point for Malawi Ministry of Health Smart Pill Box TB Adherence System serving health workers, patients and guardians.",
      },
      { property: "og:title", content: "Portal Selector — Malawi MoH TB Adherence System" },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return <PortalSelector />;
}
