import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  Stethoscope,
  User,
  Lock,
  AlertCircle,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { DEMO_CREDENTIALS_INFO } from "@/lib/auth/demo-auth";
import type { UserRole } from "@/lib/auth/auth-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  role: UserRole;
}

const ROLE_DETAILS = {
  health_worker: {
    title: "Health Worker Portal",
    subtitle: "Sign in to access cohort triage, patients & SMS telemetry",
    icon: Stethoscope,
    defaultRoute: "/health-worker/dashboard",
    demoUsername: "healthworker",
  },
  patient: {
    title: "Patient Portal",
    subtitle: "Sign in to view dose schedule, streak & treatment progress",
    icon: User,
    defaultRoute: "/patient/dashboard",
    demoUsername: "patient",
  },
  guardian: {
    title: "Guardian Portal",
    subtitle: "Sign in to monitor supported patient adherence & assisted doses",
    icon: ShieldCheck,
    defaultRoute: "/guardian/patient",
    demoUsername: "guardian",
  },
};

export function LoginForm({ role }: LoginFormProps) {
  const details = ROLE_DETAILS[role];
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState(details.demoUsername);
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demoInfo = DEMO_CREDENTIALS_INFO.find((c) => c.role === role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login({ username, password, role });
      if (res.success) {
        navigate({ to: details.defaultRoute, replace: true });
      } else {
        setError(res.error || "Failed to sign in. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const Icon = details.icon;

  return (
    <div className="mx-auto max-w-md space-y-6 py-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Portal Selection
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ministry of Health · Malawi
          </p>
          <h1 className="mt-1 font-display text-xl font-bold text-foreground sm:text-2xl">
            {details.title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{details.subtitle}</p>
        </div>

        {/* Demo Credentials Box */}
        {demoInfo && (
          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <KeyRound className="h-3.5 w-3.5" />
              <span>Demo Credentials</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px] text-foreground">
              <div>
                <span className="text-muted-foreground font-sans">Username:</span>{" "}
                <strong className="select-all">{demoInfo.username}</strong>
              </div>
              <div>
                <span className="text-muted-foreground font-sans">Password:</span>{" "}
                <strong className="select-all">{demoInfo.password}</strong>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground border-t border-primary/10 pt-1.5">
              {demoInfo.description}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-medium">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-xs font-semibold py-2.5 mt-2"
          >
            {isSubmitting ? (
              "Signing in..."
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Sign in to {details.title}
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center">
          <p className="text-[11px] text-muted-foreground">
            Smart Pill Box Programme · Digital Health Division
          </p>
        </div>
      </div>
    </div>
  );
}
