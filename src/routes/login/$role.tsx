import { createFileRoute, Link } from "@tanstack/react-router";
import { LoginForm } from "@/components/auth/LoginForm";
import type { UserRole } from "@/lib/auth/auth-types";

export const Route = createFileRoute("/login/$role")({
  head: ({ params }) => {
    const formatted = params.role ? params.role.replace("-", " ") : "Portal";
    return {
      meta: [{ title: `Sign In (${formatted}) — Malawi MoH TB Portal` }],
    };
  },
  component: LoginPage,
});

function LoginPage() {
  const { role: rawRole } = Route.useParams();

  let role: UserRole | null = null;
  if (rawRole === "health-worker" || rawRole === "health_worker") {
    role = "health_worker";
  } else if (rawRole === "patient") {
    role = "patient";
  } else if (rawRole === "guardian") {
    role = "guardian";
  }

  if (!role) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-lg font-bold text-foreground">Invalid Portal Specified</h1>
        <p className="mt-2 text-xs text-muted-foreground">
          Please select a valid portal to sign in.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-xs font-semibold text-primary hover:underline"
        >
          Return to Portal Selector →
        </Link>
      </div>
    );
  }

  return <LoginForm role={role} />;
}
