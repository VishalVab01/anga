import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { PageShell } from "@/components/PageShell";
import { api } from "@/lib/api";
import { services } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/customer/request")({
  head: () => ({ meta: [{ title: "Anga - Post job" }] }),
  component: NewRequest,
});

function NewRequest() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [service, setService] = useState(services[0].slug);
  const [draft, setDraft] = useState<AssistantDraft | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("anga.assistantDraft");
    if (!raw) return;
    try {
      const nextDraft = JSON.parse(raw) as AssistantDraft;
      setDraft(nextDraft);
      if (
        nextDraft.service &&
        services.some((item) => item.slug === nextDraft.service)
      ) {
        setService(nextDraft.service);
      }
      sessionStorage.removeItem("anga.assistantDraft");
    } catch {
      sessionStorage.removeItem("anga.assistantDraft");
    }
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (
      !data.get("description") ||
      !data.get("location") ||
      !data.get("date") ||
      !data.get("budget")
    ) {
      toast.error(lang === "hi" ? "सभी जरूरी जानकारी भरें" : "Please fill all required fields");
      return;
    }
    setLoading(true);
    api
      .createJob({
        category: service,
        title: String(data.get("description") || "Local job").slice(0, 52),
        description: data.get("description"),
        location: data.get("location"),
        date: data.get("date"),
        time: data.get("time"),
        wage: data.get("budget"),
        workersNeeded: data.get("workers"),
        urgency: data.get("urgency"),
      })
      .then(() => {
        toast.success(lang === "hi" ? "काम पोस्ट हो गया" : "Job posted");
        navigate({ to: "/customer/my-requests" });
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Could not post job");
      })
      .finally(() => setLoading(false));
  };

  return (
    <PageShell title={t("newRequest")} back="/customer">
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("serviceType")}>
          <select
            value={service}
            onChange={(event) => setService(event.target.value)}
            className="field"
          >
            {services.map((item) => (
              <option key={item.slug} value={item.slug}>
                {lang === "hi" ? item.hi : item.en}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("description")}>
          <textarea
            name="description"
            rows={4}
            defaultValue={draft?.summary ?? ""}
            placeholder={
              lang === "hi"
                ? "काम की आसान भाषा में जानकारी लिखें"
                : "Describe the work in simple words"
            }
            className="field min-h-28 resize-none"
          />
        </Field>

        <Field label={t("location")}>
          <input
            name="location"
            defaultValue={draft?.location ?? ""}
            placeholder="Area, City"
            className="field"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("date")}>
            <input
              name="date"
              type="date"
              defaultValue={draftDate(draft?.when)}
              className="field"
            />
          </Field>
          <Field label={t("time")}>
            <input name="time" type="time" className="field" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t("budget")}>
            <input
              name="budget"
              type="number"
              defaultValue={draft?.budget ?? ""}
              placeholder="₹900"
              className="field"
            />
          </Field>
          <Field label={t("workersNeeded")}>
            <input
              name="workers"
              type="number"
              min="1"
              defaultValue={draft?.workersNeeded ?? 1}
              className="field"
            />
          </Field>
        </div>

        <Field label={t("urgency")}>
          <select name="urgency" defaultValue={draftUrgency(draft)} className="field">
            <option>{lang === "hi" ? "आज" : "Today"}</option>
            <option>{lang === "hi" ? "कल" : "Tomorrow"}</option>
            <option>{lang === "hi" ? "इस सप्ताह" : "This week"}</option>
            <option>{lang === "hi" ? "तुरंत" : "Urgent"}</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/customer" })}
            className="btn-outline"
          >
            {t("cancel")}
          </button>
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? (lang === "hi" ? "पोस्ट हो रहा है..." : "Posting...") : t("postJob")}
          </button>
        </div>
      </form>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground/80">{label}</span>
      {children}
    </label>
  );
}

type AssistantDraft = {
  service?: string;
  when?: string;
  location?: string;
  urgency?: string;
  budget?: number;
  workersNeeded?: number;
  summary?: string;
};

function draftDate(when?: string) {
  if (!when) return "";
  const date = new Date();
  if (when === "Tomorrow") date.setDate(date.getDate() + 1);
  if (when !== "Today" && when !== "Tomorrow") return "";
  return date.toISOString().slice(0, 10);
}

function draftUrgency(draft: AssistantDraft | null) {
  if (draft?.urgency === "Urgent") return "Urgent";
  if (draft?.when === "Tomorrow") return "Tomorrow";
  if (draft?.when === "Today") return "Today";
  return "Today";
}
