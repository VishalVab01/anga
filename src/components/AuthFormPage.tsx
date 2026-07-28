import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Smartphone } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  saveProfile,
  setAuthMethod,
  setAuthMode,
  setPhone,
  setProfileComplete,
  setRole,
  setToken,
  type AuthMode,
  type Role,
} from "@/lib/session";

type AuthFormPageProps = {
  mode: AuthMode;
};

export function AuthFormPage({ mode }: AuthFormPageProps) {
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [demoLoading, setDemoLoading] = useState<Role | null>(null);

  useEffect(() => {
    setAuthMode(mode);
  }, [mode]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage("");

    if (isSignup && password !== confirmPassword) {
      setFormMessage("Passwords do not match.");
      return;
    }

    setAuthMethod("credentials");
    setAuthMode(mode);
    navigate({ to: "/role-selection" });
  };

  const continueWithMobile = () => {
    setAuthMethod("mobile");
    setAuthMode(mode);
    navigate({ to: "/role-selection" });
  };

  const startDemo = async (role: Role) => {
    if (demoLoading) return;

    setDemoLoading(role);
    setAuthMode("login");
    setRole(role);
    setPhone("1234567890");

    try {
      const otpResult = await api.sendOtp("1234567890");
      const result = await api.verifyOtp("1234567890", otpResult.otp || "1234", role);

      setToken(result.token);
      setRole(result.user.role);
      setProfileComplete(result.user.role, true);
      saveProfile(result.user.role, {
        name: result.user.name || (role === "customer" ? "Demo Customer" : "Demo Worker"),
        phone: result.user.phone || "1234567890",
        location: result.user.location || "",
        address: result.user.address || "",
      });
      toast.success("Demo login ready");
      navigate({ to: role === "customer" ? "/customer" : "/worker" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Demo login failed");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <main className="anga-app-shell h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-full max-w-md flex-col px-6 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-[max(0.875rem,env(safe-area-inset-top))]">
        <Link to="/app" className="mx-auto inline-flex items-center gap-2" aria-label="Anga home">
          <span className="auth-brand text-[2.25rem] leading-none tracking-[-0.045em] text-primary">
            anga
          </span>
        </Link>

        {isSignup ? (
          <div className="h-[clamp(1.25rem,4dvh,2.5rem)] shrink-0" aria-hidden="true" />
        ) : (
          <div
            className="h-[clamp(2.5rem,9dvh,5rem)] shrink-0"
            aria-label="Reserved space for login illustration"
            role="img"
          />
        )}

        <section>
          <h1 className="auth-heading text-[2.2rem] leading-none tracking-[-0.045em]">
            {isSignup ? "Sign Up" : "Welcome Back"}
          </h1>
          <p className="mt-2 text-[0.8rem] text-muted-foreground">
            {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
            <Link
              to={isSignup ? "/auth/login" : "/auth/signup"}
              className="text-primary underline-offset-4 hover:underline"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </section>

        <form onSubmit={submit} className="mt-4 grid gap-2.5">
          {isSignup && (
            <label className="block">
              <span className="sr-only">Full name</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                required
                placeholder="Full Name"
                className="min-h-11 w-full rounded-full border border-border bg-card px-5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
          )}

          <label className="block">
            <span className="sr-only">Email address</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="Email Address"
              className="min-h-11 w-full rounded-full border border-border bg-card px-5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          <label className="block">
            <span className="sr-only">{isSignup ? "Create password" : "Enter password"}</span>
            <input
              type="password"
              name="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isSignup ? "Create Password" : "Enter Password"}
              className="min-h-11 w-full rounded-full border border-border bg-card px-5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>

          {isSignup && (
            <label className="block">
              <span className="sr-only">Re-enter password</span>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter Password"
                className="min-h-11 w-full rounded-full border border-border bg-card px-5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
          )}

          {formMessage && (
            <p className="px-2 text-center text-xs text-destructive" role="status">
              {formMessage}
            </p>
          )}

          <button
            type="submit"
            className="mt-1 min-h-11 w-full rounded-full bg-primary px-5 text-sm text-primary-foreground shadow-lg shadow-primary/20 transition active:scale-[0.98]"
          >
            {isSignup ? "Register" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={continueWithMobile}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-primary bg-card px-5 text-sm text-primary transition active:scale-[0.98]"
          >
            <Smartphone className="h-4 w-4" aria-hidden="true" />
            {isSignup ? "Sign up with mobile number" : "Sign in with mobile number"}
          </button>

          {!isSignup && (
            <button
              type="button"
              onClick={() => setFormMessage("You’ll verify your account by OTP in the next step.")}
              className="mx-auto text-xs text-primary"
            >
              Forgot your password?
            </button>
          )}
        </form>

        <div className="my-3 flex items-center gap-3 text-[0.7rem] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>Or use a demo account</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => startDemo("worker")}
            disabled={Boolean(demoLoading)}
            className="flex min-h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-xs transition active:scale-[0.98]"
          >
            {demoLoading === "worker" && <Loader2 className="h-4 w-4 animate-spin" />}
            Demo Worker
          </button>
          <button
            type="button"
            onClick={() => startDemo("customer")}
            disabled={Boolean(demoLoading)}
            className="flex min-h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-xs transition active:scale-[0.98]"
          >
            {demoLoading === "customer" && <Loader2 className="h-4 w-4 animate-spin" />}
            Demo Customer
          </button>
        </div>
      </div>
    </main>
  );
}
