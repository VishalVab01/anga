import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, HardHat, Loader2, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import {
  setAuthMode,
  setPhone,
  setProfileComplete,
  setRole,
  setToken,
  saveProfile,
  type Role,
} from "@/lib/session";

export const Route = createFileRoute("/role-selection")({
  head: () => ({ meta: [{ title: "Anga - Who are you?" }] }),
  component: RoleSelect,
});

function RoleSelect() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState<Role | null>(null);

  const pick = (role: Role) => {
    setRole(role);
    navigate({ to: "/auth/phone" });
  };

  const goBack = () => {
    navigate({ to: "/app" });
  };

  const startDemo = async (role: Role) => {
    if (demoLoading) return;
    setDemoLoading(role);
    setAuthMode("login");
    setRole(role);
    setPhone("1234567890");
    try {
      const otpResult = await api.sendOtp("1234567890");
      const demoOtp = otpResult.otp || "1234";
      const result = await api.verifyOtp("1234567890", demoOtp, role);
      setToken(result.token);
      setRole(result.user.role);
      setProfileComplete(result.user.role, true);
      saveProfile(result.user.role, {
        name: result.user.name || (role === "customer" ? "Demo Customer" : "Demo Worker"),
        phone: result.user.phone || "1234567890",
        location: result.user.location || "",
        address: result.user.address || "",
      });
      toast.success(lang === "hi" ? "Demo login ready" : "Demo login ready");
      navigate({ to: role === "customer" ? "/customer" : "/worker" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Demo login failed");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-7">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="mb-3 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-muted active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <header className="shrink-0 text-center">
          <h1 className="text-[2rem] font-extrabold leading-tight tracking-normal">
            {t("whoAreYou")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("continue")} / Aage badhne ke liye chunein
          </p>
        </header>

        <div className="mt-6 grid gap-3">
          <RoleButton
            icon={<HardHat className="h-8 w-8" />}
            title={t("worker")}
            subtitle={t("workerSub")}
            tone="primary"
            onClick={() => pick("worker")}
          />
          <RoleButton
            icon={<UserRound className="h-8 w-8" />}
            title={t("customer")}
            subtitle={t("customerSub")}
            tone="accent"
            onClick={() => pick("customer")}
          />
        </div>

        <section className="mt-4 rounded-[1.35rem] border border-primary/15 bg-card p-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-foreground">
                {lang === "hi" ? "Judge demo" : "Judge demo"}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                OTP 1234 · Phone 1234567890
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase text-primary">
              Fast
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => startDemo("worker")}
              disabled={Boolean(demoLoading)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-2 py-2 text-xs font-extrabold text-primary-foreground shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {demoLoading === "worker" && <Loader2 className="h-4 w-4 animate-spin" />}
              Demo Worker
            </button>
            <button
              type="button"
              onClick={() => startDemo("customer")}
              disabled={Boolean(demoLoading)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-2 py-2 text-xs font-extrabold text-foreground shadow-sm disabled:opacity-60"
            >
              {demoLoading === "customer" && <Loader2 className="h-4 w-4 animate-spin" />}
              Demo Customer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function RoleButton({
  icon,
  title,
  subtitle,
  tone,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  tone: "primary" | "accent";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-soft card-soft-hover flex min-h-[8.2rem] items-center gap-4 p-4 text-left"
    >
      <div
        className={`grid h-16 w-16 shrink-0 place-items-center rounded-3xl ${
          tone === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold">{title}</div>
        <div className="mt-1 text-sm font-semibold leading-snug text-muted-foreground">
          {subtitle}
        </div>
      </div>
    </button>
  );
}
