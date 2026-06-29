import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useState, type FormEvent } from "react";
import { PageShell } from "@/components/PageShell";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { getAuthMode, getRole, setPhone } from "@/lib/session";

export const Route = createFileRoute("/auth/phone")({
  head: () => ({ meta: [{ title: "Anga - Mobile login" }] }),
  component: PhoneScreen,
});

function PhoneScreen() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [phone, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const mode = getAuthMode();
  const role = getRole();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error(lang === "hi" ? "सही मोबाइल नंबर डालें" : "Enter a valid mobile number");
      return;
    }
    setSending(true);
    try {
      const result = await api.sendOtp(phone);
      setPhone(phone);
      toast.success(
        result.otp ? `OTP: ${result.otp}` : lang === "hi" ? "OTP भेजा गया" : "OTP sent",
      );
      navigate({ to: "/auth/otp" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send OTP");
    } finally {
      setSending(false);
    }
  };

  return (
    <PageShell title={mode === "login" ? t("login") : t("createAccount")} back="/role-selection">
      <form onSubmit={submit} className="space-y-5">
        <div className="card-soft p-5">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Smartphone className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold">{t("phone")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "hi"
              ? "ईमेल/पासवर्ड नहीं। सिर्फ मोबाइल नंबर और OTP से आगे बढ़ें।"
              : "No email or password. Continue with mobile number and OTP."}
          </p>
          {mode === "signup" && role && (
            <p className="mt-3 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
              {role === "worker" ? t("worker") : t("customer")}
            </p>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">{t("phone")}</span>
          <input
            value={phone}
            onChange={(event) => setValue(event.target.value)}
            inputMode="tel"
            placeholder="+91 98765 43210"
            className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-lg outline-none focus:border-primary"
          />
        </label>

        <button
          type="submit"
          disabled={sending}
          className="btn-primary w-full text-lg disabled:opacity-60"
        >
          {sending ? (lang === "hi" ? "OTP भेज रहे हैं..." : "Sending OTP...") : t("sendOtp")}
        </button>
      </form>
    </PageShell>
  );
}
