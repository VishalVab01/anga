import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Banknote,
  BellRing,
  Building2,
  Check,
  CreditCard,
  Languages,
  Save,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { useT } from "@/lib/i18n";
import { getRole, type Role } from "@/lib/session";

export const Route = createFileRoute("/settings/preferences")({
  head: () => ({ meta: [{ title: "Anga - Preferences" }] }),
  component: Preferences,
});

type PaymentMethod = "cash" | "upi" | "bank";

const PAYMENT_METHODS: Array<{
  value: PaymentMethod;
  title: string;
  text: string;
  icon: ReactNode;
}> = [
  { value: "cash", title: "Cash", text: "Pay or receive after work", icon: <Banknote /> },
  { value: "upi", title: "UPI", text: "Fast digital payment", icon: <Smartphone /> },
  { value: "bank", title: "Bank transfer", text: "Direct account transfer", icon: <Building2 /> },
];

function Preferences() {
  const navigate = useNavigate();
  const { lang, setLang } = useT();
  const [role] = useState<Role>(() => getRole() || "worker");
  const [payments, setPayments] = useState<PaymentMethod[]>(() => readPayments(role));
  const [jobAlerts, setJobAlerts] = useState(() => readBoolean(`${role}.jobAlerts`, true));
  const [statusUpdates, setStatusUpdates] = useState(() =>
    readBoolean(`${role}.statusUpdates`, true),
  );
  const [safetyAlerts, setSafetyAlerts] = useState(() => readBoolean(`${role}.safetyAlerts`, true));

  const togglePayment = (method: PaymentMethod) => {
    setPayments((current) => {
      if (current.includes(method)) {
        return current.length === 1 ? current : current.filter((item) => item !== method);
      }
      return [...current, method];
    });
  };

  const save = () => {
    localStorage.setItem(`anga.preferences.${role}.payments`, JSON.stringify(payments));
    localStorage.setItem(`anga.preferences.${role}.jobAlerts`, String(jobAlerts));
    localStorage.setItem(`anga.preferences.${role}.statusUpdates`, String(statusUpdates));
    localStorage.setItem(`anga.preferences.${role}.safetyAlerts`, String(safetyAlerts));
    toast.success("Preferences saved");
    navigate({ to: role === "customer" ? "/customer/profile" : "/worker/profile" });
  };

  return (
    <PageShell bottomNav={<BottomNav role={role} />}>
      <div className="-mx-4 -mb-28 -mt-4 min-h-[100dvh] bg-primary pb-28">
        <header className="relative overflow-hidden px-4 pb-9 pt-5 text-primary-foreground">
          <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/12 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                navigate({ to: role === "customer" ? "/customer/profile" : "/worker/profile" })
              }
              aria-label="Back"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15">
              <CreditCard className="h-5 w-5" />
            </span>
          </div>
          <div className="relative mt-6">
            <p className="text-xs text-primary-foreground/65">Your Anga experience</p>
            <h1 className="worker-section-title mt-1 text-[1.85rem] leading-tight">Preferences</h1>
            <p className="mt-2 max-w-[20rem] text-sm leading-5 text-primary-foreground/72">
              Choose payment, language and alerts that work for you.
            </p>
          </div>
        </header>

        <main className="mx-1.5 min-h-[70dvh] space-y-5 rounded-t-[2.5rem] bg-background px-4 pb-7 pt-6">
          <section className="rounded-[1.65rem] bg-card p-4 shadow-sm">
            <SectionHeading
              icon={<CreditCard />}
              title="Payment methods"
              text={
                role === "customer" ? "How you prefer to pay workers" : "How you prefer to be paid"
              }
            />
            <div className="mt-4 grid gap-2.5">
              {PAYMENT_METHODS.map((method) => {
                const active = payments.includes(method.value);
                return (
                  <button
                    type="button"
                    key={method.value}
                    onClick={() => togglePayment(method.value)}
                    aria-pressed={active}
                    className={`flex min-h-[4.4rem] items-center gap-3 rounded-[1.2rem] border p-3 text-left transition ${
                      active ? "border-primary bg-primary/[0.055]" : "border-border bg-background"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full [&>svg]:h-4 [&>svg]:w-4 ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
                    >
                      {method.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="worker-card-title block text-sm">{method.title}</span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">
                        {method.text}
                      </span>
                    </span>
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[1.65rem] bg-card p-4 shadow-sm">
            <SectionHeading
              icon={<BellRing />}
              title="Notifications"
              text="Control the updates Anga sends you"
            />
            <div className="mt-4 space-y-2.5">
              <PreferenceSwitch
                title={role === "customer" ? "Worker matches" : "Nearby job matches"}
                text="Relevant opportunities and recommendations"
                checked={jobAlerts}
                onChange={setJobAlerts}
              />
              <PreferenceSwitch
                title="Status updates"
                text={
                  role === "customer"
                    ? "Applications and job progress"
                    : "Application and assignment progress"
                }
                checked={statusUpdates}
                onChange={setStatusUpdates}
              />
              <PreferenceSwitch
                title="Safety alerts"
                text="Important trust and account notices"
                checked={safetyAlerts}
                onChange={setSafetyAlerts}
              />
            </div>
          </section>

          <section className="rounded-[1.65rem] bg-card p-4 shadow-sm">
            <SectionHeading
              icon={<Languages />}
              title="App language"
              text="Switch between English and Hindi"
            />
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {(["en", "hi"] as const).map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setLang(value)}
                  className={`min-h-12 rounded-full border px-4 text-sm transition ${
                    lang === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {value === "en" ? "English" : "हिन्दी"}
                </button>
              ))}
            </div>
          </section>

          <section className="flex items-start gap-3 rounded-[1.4rem] bg-blue-50 p-4 text-blue-950">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <p className="text-[11px] leading-5 text-blue-950/70">
              Anga never changes payment terms automatically. Confirm the amount with the other
              person before work begins.
            </p>
          </section>

          <button type="button" onClick={save} className="btn-primary min-h-14 w-full">
            <Save className="h-4 w-4" /> Save preferences
          </button>
        </main>
      </div>
    </PageShell>
  );
}

function SectionHeading({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <div>
        <h2 className="worker-card-title text-sm">{title}</h2>
        <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function PreferenceSwitch({
  title,
  text,
  checked,
  onChange,
}: {
  title: string;
  text: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-[1.15rem] bg-background p-3 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="worker-card-title block text-xs">{title}</span>
        <span className="mt-0.5 block text-[10px] text-muted-foreground">{text}</span>
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`}
        />
      </span>
    </button>
  );
}

function readPayments(role: Role): PaymentMethod[] {
  if (typeof window === "undefined") return ["cash", "upi"];
  try {
    const value = JSON.parse(localStorage.getItem(`anga.preferences.${role}.payments`) || "[]");
    const valid = Array.isArray(value)
      ? value.filter((item): item is PaymentMethod => ["cash", "upi", "bank"].includes(item))
      : [];
    return valid.length ? valid : ["cash", "upi"];
  } catch {
    return ["cash", "upi"];
  }
}

function readBoolean(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const value = localStorage.getItem(`anga.preferences.${key}`);
  return value === null ? fallback : value === "true";
}
