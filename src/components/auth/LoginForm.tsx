import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/lib/auth/auth-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  role: UserRole;
}

const ROLE_DETAILS = {
  health_worker: {
    title: "Health Worker Sign In",
    subtitle: "Clinicians and Health Surveillance Assistants",
    defaultRoute: "/health-worker/dashboard",
  },
  patient: {
    title: "Patient Sign In",
    subtitle: "Patients Enrolled in TB Treatment",
    defaultRoute: "/patient/dashboard",
  },
  district_officer: {
    title: "District & Zone TB Officer Sign In",
    subtitle: "District TB Officers and Zone Programme Managers",
    defaultRoute: "/district-officer/dashboard",
  },
};

export function LoginForm({ role }: LoginFormProps) {
  const details = ROLE_DETAILS[role];
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login({ username, password, role });
      if (res.success) {
        navigate({ to: details.defaultRoute, replace: true });
      } else {
        setError(res.error || "Invalid credentials. Please verify your username and password.");
      }
    } catch {
      setError("An unexpected authentication error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6 py-6 sm:py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Return to portal selection
      </Link>

      <div className="border border-border bg-card p-6 sm:p-8 rounded-md space-y-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ministry of Health
          </p>
          <h1 className="font-display text-lg font-bold text-foreground mt-0.5">{details.title}</h1>
          <p className="text-xs text-muted-foreground mt-1">{details.subtitle}</p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold">
              Username / Email
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              className="text-xs h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="text-xs h-9"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-xs font-semibold h-9 mt-2"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
