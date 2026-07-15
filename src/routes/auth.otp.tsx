import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useState, type FormEvent } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { PageShell } from "@/components/PageShell";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import {
  getAuthMode,
  getPhone,
  getRole,
  setProfileComplete,
  setRole,
  setToken,
} from "@/lib/session";

export const Route = createFileRoute("/auth/otp")({
  head: () => ({ meta: [{ title: "Anga - Verify OTP" }] }),
  component: OtpScreen,
});

function OtpScreen() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("123456");
  const [verifying, setVerifying] = useState(false);
  const phone = getPhone();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (verifying) return;
    const role = getRole();
    if (!role) {
      navigate({ to: "/role-selection" });
      return;
    }
    setVerifying(true);
    try {
      const result = await api.verifyOtp(phone, otp, role);
      setToken(result.token);
      setRole(result.user.role);
      setProfileComplete(result.user.role, result.user.isProfileComplete);
      toast.success(lang === "hi" ? "मोबाइल सत्यापित" : "Mobile verified");
      const mode = getAuthMode();
      if (mode === "signup" || !result.user.isProfileComplete) {
        navigate({ to: result.user.role === "customer" ? "/customer/setup" : "/worker/setup" });
      } else {
        navigate({ to: result.user.role === "customer" ? "/customer" : "/worker" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not verify OTP");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <PageShell title={t("verifyOtp")} back="/auth/phone">
      <form onSubmit={submit} className="space-y-5">
        <div className="card-soft p-5">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-success/10 text-success">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold">{t("verifyOtp")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "hi" ? `${phone} पर भेजा गया OTP डालें` : `Enter the OTP sent to ${phone}`}
          </p>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">OTP</span>
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={6}
            inputMode="numeric"
            containerClassName="grid grid-cols-6 gap-2"
            className="w-full"
          >
            <InputOTPGroup className="contents">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="h-14 w-full rounded-2xl border border-border bg-card text-2xl font-extrabold shadow-sm transition-all first:rounded-2xl first:border last:rounded-2xl data-[active=true]:border-primary"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </label>

        <button
          type="submit"
          disabled={verifying}
          className="btn-primary w-full text-lg disabled:opacity-60"
        >
          {verifying ? (lang === "hi" ? "सत्यापित हो रहा है..." : "Verifying...") : t("verifyOtp")}
        </button>
      </form>
    </PageShell>
  );
}
