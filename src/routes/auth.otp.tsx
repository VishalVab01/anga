import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, LockKeyhole, RotateCcw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { api, ApiError } from "@/lib/api";
import { useT } from "@/lib/i18n";
import {
  getAuthMode,
  getPhone,
  getRole,
  setProfileComplete,
  setRole,
  setToken,
  saveProfile,
  type Role,
} from "@/lib/session";

export const Route = createFileRoute("/auth/otp")({
  head: () => ({ meta: [{ title: "Anga - Verify OTP" }] }),
  component: OtpScreen,
});

function OtpScreen() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const phone = getPhone();
  const maskedPhone = maskPhone(phone);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (verifying) return;
    if (otp.length !== 4) {
      toast.error(lang === "hi" ? "4 digit OTP daalein" : "Enter the 4 digit OTP");
      return;
    }
    const role = getRole();
    if (!role) {
      navigate({ to: "/role-selection" });
      return;
    }
    setVerifying(true);
    try {
      const result = await verifyWithDemoFallback(phone, otp, role);
      setToken(result.token);
      setRole(result.user.role);
      setProfileComplete(result.user.role, result.user.isProfileComplete);
      if (result.user.name || result.user.phone) {
        saveProfile(result.user.role, {
          name: result.user.name || "",
          phone: result.user.phone || phone,
          location: result.user.location || "",
          address: result.user.address || "",
        });
      }
      toast.success(lang === "hi" ? "Mobile verified" : "Mobile verified");
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

  const resendOtp = async () => {
    if (resending) return;
    setResending(true);
    try {
      const result = await api.sendOtp(phone);
      setOtp(result.otp?.slice(0, 4) || "");
      toast.success(
        result.otp ? `OTP: ${result.otp}` : lang === "hi" ? "OTP dobara bheja gaya" : "OTP resent",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="anga-app-shell min-h-screen overflow-hidden bg-background">
      <form
        onSubmit={submit}
        className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-8 pt-7"
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/auth/phone" })}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card text-foreground shadow-sm ring-1 ring-border"
          aria-label={lang === "hi" ? "Wapas" : "Back"}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="relative mb-8 mt-3 grid h-36 w-36 place-items-center rounded-[2rem] bg-primary/5">
            <span className="absolute left-3 top-5 h-3 w-3 rounded-full border border-primary/50 bg-background" />
            <span className="absolute right-5 top-7 h-4 w-4 rounded-full border border-border bg-background" />
            <span className="absolute bottom-7 left-6 h-3 w-3 rounded-full border border-accent/40 bg-background" />
            <div className="relative h-24 w-20 rounded-[1.3rem] border-[5px] border-foreground bg-background shadow-sm">
              <div className="absolute left-1/2 top-2 h-1.5 w-8 -translate-x-1/2 rounded-full bg-foreground" />
              <div className="absolute bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-foreground" />
              <div className="absolute -right-8 top-10 rounded-xl border-[4px] border-foreground bg-background px-3 py-1.5 shadow-sm">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-foreground" />
                  <span className="h-2 w-2 rounded-full bg-foreground" />
                  <span className="h-2 w-2 rounded-full bg-foreground" />
                </div>
                <LockKeyhole className="absolute -right-3 top-3 h-7 w-7 rounded-full bg-background p-1 text-foreground" />
              </div>
              <div className="absolute -bottom-3 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-foreground" />
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-normal text-foreground">{t("verifyOtp")}</h1>
          <p className="mt-3 text-base font-bold text-foreground">
            {lang === "hi" ? "Namaste," : "Namaste,"}
          </p>
          <p className="mt-3 max-w-xs text-sm font-medium leading-6 text-muted-foreground">
            {lang === "hi"
              ? `${maskedPhone} par bheja gaya 4 digit OTP daalein.`
              : `Enter the 4 digit OTP sent to your mobile ${maskedPhone}.`}
          </p>

          <div className="mt-9 w-full max-w-xs">
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={4}
              inputMode="numeric"
              containerClassName="grid grid-cols-4 gap-4"
              className="w-full"
            >
              <InputOTPGroup className="contents">
                {Array.from({ length: 4 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="h-20 w-full rounded-2xl border border-border bg-card text-3xl font-black shadow-sm transition-all first:rounded-2xl first:border last:rounded-2xl data-[active=true]:border-primary data-[active=true]:shadow-lg data-[active=true]:shadow-primary/15 data-[active=true]:ring-2 data-[active=true]:ring-primary/15"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <button
            type="button"
            onClick={resendOtp}
            disabled={resending}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-muted-foreground disabled:opacity-60"
          >
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {lang === "hi" ? "OTP nahi mila? RESEND" : "OTP not received? RESEND"}
          </button>
        </section>

        <button
          type="submit"
          disabled={verifying}
          className="btn-primary mt-auto min-h-14 w-full text-base disabled:opacity-60"
        >
          {verifying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {lang === "hi" ? "Verifying..." : "Verifying..."}
            </>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </main>
  );
}

async function verifyWithDemoFallback(phone: string, otp: string, role: Role) {
  try {
    return await api.verifyOtp(phone, otp, role);
  } catch (error) {
    const digits = phone.replace(/\D/g, "");
    const canUseLegacyDemoOtp =
      error instanceof ApiError &&
      error.status === 400 &&
      digits === "1234567890" &&
      otp === "1234";

    if (canUseLegacyDemoOtp) {
      return api.verifyOtp(phone, "123456", role);
    }

    throw error;
  }
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "XXXX";
  return `XXXXXX${digits.slice(-4)}`;
}
