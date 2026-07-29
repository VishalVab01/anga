import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Smartphone } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api, type ApiAuthUser } from "@/lib/api";
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
  const [submitting, setSubmitting] = useState(false);
  const [useMobile, setUseMobile] = useState(false);
  const [mobilePhone, setMobilePhone] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    setAuthMode(mode);
    void api.warmup();
  }, [mode]);

  const finishAuthentication = (token: string, user: ApiAuthUser) => {
    setToken(token);
    setRole(user.role);
    setPhone(user.phone || "");
    setProfileComplete(user.role, user.isProfileComplete);
    saveProfile(user.role, {
      name: user.name || "",
      phone: user.phone || "",
      email: user.email || "",
      location: user.location || "",
      address: user.address || "",
    });
    navigate({
      to: user.isProfileComplete
        ? user.role === "customer"
          ? "/customer"
          : "/worker"
        : user.role === "customer"
          ? "/customer/setup"
          : "/worker/setup",
    });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setFormMessage("");

    if (isSignup && password !== confirmPassword) {
      setFormMessage("Passwords do not match.");
      return;
    }

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "")
      .trim()
      .toLowerCase();
    setAuthMethod("credentials");
    setAuthMode(mode);

    if (isSignup) {
      sessionStorage.setItem(
        "anga.pendingCredentials",
        JSON.stringify({
          name: String(data.get("name") || "").trim(),
          email,
          password,
        }),
      );
      navigate({ to: "/role-selection" });
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.loginCredentials(email, password);
      finishAuthentication(result.token, { ...result.user, email: result.user.email || email });
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  };

  const continueWithMobile = () => {
    setAuthMethod("mobile");
    setAuthMode(mode);
    setFormMessage("");
    setUseMobile(true);
  };

  const sendMobileOtp = async () => {
    const phone = mobilePhone.replace(/\D/g, "").slice(-10);
    if (phone.length !== 10) {
      setFormMessage("Enter a valid 10-digit mobile number.");
      return;
    }

    setOtpLoading(true);
    setFormMessage("");
    try {
      const result = await api.sendOtp(phone);
      setMobilePhone(phone);
      setPhone(phone);
      setOtpSent(true);
      if (result.otp) setMobileOtp(result.otp.slice(0, 4));
      toast.success(result.otp ? `OTP: ${result.otp}` : "OTP sent to your mobile number");
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : "Could not send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const continueMobileWithRole = (phone: string) => {
    sessionStorage.setItem("anga.pendingMobileAuth", JSON.stringify({ phone, otp: mobileOtp }));
    setAuthMethod("mobile");
    setAuthMode(mode);
    navigate({ to: "/role-selection" });
  };

  const submitMobile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const phone = mobilePhone.replace(/\D/g, "").slice(-10);
    if (phone.length !== 10) {
      setFormMessage("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!otpSent) {
      setFormMessage("Send an OTP to this number first.");
      return;
    }
    if (mobileOtp.length !== 4) {
      setFormMessage("Enter the 4-digit OTP.");
      return;
    }

    setSubmitting(true);
    setFormMessage("");
    try {
      const result = await api.verifyOtpCode(phone, mobileOtp);
      if (result.token && result.user) {
        finishAuthentication(result.token, result.user);
        return;
      }

      if (!isSignup) {
        setFormMessage("No account exists for this number. Please sign up first.");
        return;
      }

      continueMobileWithRole(phone);
    } catch (error) {
      if (error instanceof Error && /valid role required/i.test(error.message)) {
        continueMobileWithRole(phone);
        return;
      }
      setFormMessage(error instanceof Error ? error.message : "Could not verify OTP");
    } finally {
      setSubmitting(false);
    }
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
    <main className="anga-app-shell auth-reference-page min-h-[100dvh] overflow-y-auto text-foreground">
      <div
        className={`auth-reference-card mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] ${isSignup ? "is-signup" : "is-login"}`}
      >
        <Link
          to="/app"
          className="auth-reference-brand mx-auto inline-flex items-center gap-2"
          aria-label="Anga home"
        >
          <span className="auth-brand leading-none text-white">anga</span>
        </Link>

        {isSignup ? (
          <div
            className="auth-reference-spacer h-[clamp(1rem,3dvh,1.75rem)] shrink-0"
            aria-hidden="true"
          />
        ) : (
          <div
            className="auth-reference-spacer h-[clamp(1.75rem,5dvh,3rem)] shrink-0"
            aria-label="Reserved space for login illustration"
            role="img"
          />
        )}

        <section className="auth-reference-intro">
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

        {useMobile ? (
          <form
            key="mobile"
            onSubmit={submitMobile}
            className="auth-reference-form mt-4 grid gap-3"
          >
            <div className="mb-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary">
                <Smartphone className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>Verify your mobile number securely with an OTP.</span>
            </div>

            <label className="block">
              <span className="auth-reference-label">Mobile number</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={mobilePhone}
                onChange={(event) => {
                  setMobilePhone(event.target.value.replace(/\D/g, "").slice(0, 10));
                  if (otpSent) {
                    setOtpSent(false);
                    setMobileOtp("");
                  }
                }}
                required
                maxLength={10}
                placeholder="Mobile Number"
                className="min-h-11 w-full rounded-full border border-border bg-card px-5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label className="block">
              <span className="auth-reference-label">One-time password</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={mobileOtp}
                onChange={(event) =>
                  setMobileOtp(event.target.value.replace(/\D/g, "").slice(0, 4))
                }
                required
                maxLength={4}
                placeholder="Enter 4-digit OTP"
                className="min-h-11 w-full rounded-full border border-border bg-card px-5 text-sm tracking-[0.2em] outline-none transition placeholder:tracking-normal focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            {formMessage && (
              <p className="px-2 text-center text-xs text-destructive" role="status">
                {formMessage}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={sendMobileOtp}
                disabled={otpLoading}
                className="auth-reference-secondary flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm transition active:scale-[0.98] disabled:opacity-60"
              >
                {otpLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {otpSent ? "Resend OTP" : "Send OTP"}
              </button>
              <button
                type="submit"
                disabled={submitting || !otpSent}
                className="auth-reference-primary flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm transition active:scale-[0.98] disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify & continue
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setUseMobile(false);
                setFormMessage("");
                setAuthMethod("credentials");
              }}
              className="auth-reference-text-button mx-auto min-h-8 px-3 text-xs"
            >
              Use email and password instead
            </button>
          </form>
        ) : (
          <form key="credentials" onSubmit={submit} className="auth-reference-form mt-4 grid gap-3">
            {isSignup && (
              <label className="block">
                <span className="auth-reference-label">Full name</span>
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
              <span className="auth-reference-label">Email address</span>
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
              <span className="auth-reference-label">
                {isSignup ? "Create password" : "Password"}
              </span>
              <input
                type="password"
                name="password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isSignup ? "Create Password" : "Enter Password"}
                className="min-h-11 w-full rounded-full border border-border bg-card px-5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            {isSignup && (
              <label className="block">
                <span className="auth-reference-label">Confirm password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  minLength={8}
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
              disabled={submitting}
              className="auth-reference-primary mt-1 min-h-11 w-full rounded-xl px-5 text-sm transition active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </span>
              ) : isSignup ? (
                "Register"
              ) : (
                "Sign in"
              )}
            </button>

            <button
              type="button"
              onClick={continueWithMobile}
              className="auth-reference-secondary flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm transition active:scale-[0.98]"
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              {isSignup ? "Sign up with mobile number" : "Sign in with mobile number"}
            </button>

            {!isSignup && (
              <button
                type="button"
                onClick={continueWithMobile}
                className="auth-reference-text-button mx-auto text-xs"
              >
                Forgot your password?
              </button>
            )}
          </form>
        )}

        <div className="auth-reference-divider my-4 flex items-center gap-3 text-[0.7rem]">
          <span className="h-px flex-1 bg-border" />
          <span>Or use a demo account</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="auth-reference-demo-grid grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => startDemo("worker")}
            disabled={Boolean(demoLoading)}
            className="auth-reference-demo flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs transition active:scale-[0.98]"
          >
            {demoLoading === "worker" && <Loader2 className="h-4 w-4 animate-spin" />}
            Demo Worker
          </button>
          <button
            type="button"
            onClick={() => startDemo("customer")}
            disabled={Boolean(demoLoading)}
            className="auth-reference-demo flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs transition active:scale-[0.98]"
          >
            {demoLoading === "customer" && <Loader2 className="h-4 w-4 animate-spin" />}
            Demo Customer
          </button>
        </div>
      </div>
    </main>
  );
}
