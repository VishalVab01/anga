import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { useT } from "@/lib/i18n";
import { services } from "@/lib/data";
import { useState } from "react";

export const Route = createFileRoute("/customer/request")({
  head: () => ({ meta: [{ title: "Rozgaar — New request" }] }),
  component: NewRequest,
});

function NewRequest() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [service, setService] = useState(services[0].slug);
  const [desc, setDesc] = useState("");
  const [loc, setLoc] = useState("");
  const [date, setDate] = useState("");
  const [pay, setPay] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !loc || !date || !pay) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Request posted ✓");
      navigate({ to: "/customer/my-requests" });
    }, 700);
  };

  return (
    <PageShell title={t("newRequest")} back="/customer">
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("serviceType")}>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-base outline-none focus:border-primary"
          >
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.emoji} {lang === "hi" ? s.hi : s.en}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("description")}>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="Briefly describe the work"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-base outline-none focus:border-primary"
          />
        </Field>

        <Field label={t("location")}>
          <input
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            placeholder="Area, City"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-base outline-none focus:border-primary"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("date")}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-base outline-none focus:border-primary"
            />
          </Field>
          <Field label={t("payment")}>
            <input
              type="number"
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              placeholder="₹"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-base outline-none focus:border-primary"
            />
          </Field>
        </div>

        <div className="pt-2 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => navigate({ to: "/customer" })} className="btn-outline">
            {t("cancel")}
          </button>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? "Posting…" : t("postJob")}
          </button>
        </div>
      </form>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground/80">{label}</span>
      {children}
    </label>
  );
}
