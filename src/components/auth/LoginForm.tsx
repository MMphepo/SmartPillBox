import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Stethoscope, User, Lock, AlertCircle, ArrowLeft, KeyRound, Building2 } from "lucide-react";
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
    icon: Stethoscope,
    defaultRoute: "/health-worker/dashboard",
    demoUsername: "healthworker",
  },
  patient: {
    title: "Patient Portal",
    icon: User,
    defaultRoute: "/patient/dashboard",
    demoUsername: "patient",
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
        setError(res.error || "Invalid username or password.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillDemo = () => {
    if (demoInfo) {
      setUsername(demoInfo.username);
      setPassword(demoInfo.password);
    }
  };

  const Icon = details.icon;

  return (
    <div className="mx-auto max-w-md space-y-6 py-6 sm:py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xs">
        <div className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1.5">
            <Building2 className="h-3 w-3" />
            Ministry of Health · Malawi
          </p>
          <h1 className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
            {details.title}
          </h1>
        </div>

        {/* Demo Credentials Container */}
        {demoInfo && (
          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <KeyRound className="h-3.5 w-3.5" />
                <span>Demo Account</span>
              </div>
              <button
                type="button"
                onClick={autofillDemo}
                className="text-[11px] font-semibold text-primary underline hover:text-primary/80"
              >
                Auto-fill
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-xs text-foreground bg-background/80 p-2 rounded-lg border border-border">
              <div>
                <span className="text-muted-foreground font-sans text-[11px]">User:</span>{" "}
                <strong className="select-all font-semibold">{demoInfo.username}</strong>
              </div>
              <div>
                <span className="text-muted-foreground font-sans text-[11px]">Pass:</span>{" "}
                <strong className="select-all font-semibold">{demoInfo.password}</strong>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="text-xs sm:text-sm h-10"
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
              placeholder="Password"
              required
              className="text-xs sm:text-sm h-10"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-xs font-bold h-10 mt-2"
          >
            {isSubmitting ? (
              "Signing in..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                Sign In
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
