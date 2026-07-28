import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  ClipboardCheck,
  ImagePlus,
  Loader2,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { PageShell } from "@/components/PageShell";
import { api } from "@/lib/api";
import { services, type Service } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/customer/request")({
  head: () => ({ meta: [{ title: "Anga - Post job" }] }),
  component: NewRequest,
});

function NewRequest() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [service, setService] = useState(services[0].slug);
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);
  const [draft, setDraft] = useState<AssistantDraft | null>(null);
  const [problemImageUrl, setProblemImageUrl] = useState("");
  const [problemImageName, setProblemImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [preferredWorkerName, setPreferredWorkerName] = useState("");

  useEffect(() => {
    const selectedService = sessionStorage.getItem("anga.customerSelectedService");
    if (selectedService && services.some((item) => item.slug === selectedService)) {
      setService(selectedService);
    }
    sessionStorage.removeItem("anga.customerSelectedService");
    const preferredWorker = sessionStorage.getItem("anga.preferredWorkerName");
    if (preferredWorker) setPreferredWorkerName(preferredWorker);
    sessionStorage.removeItem("anga.preferredWorkerName");

    const raw = sessionStorage.getItem("anga.assistantDraft");
    if (!raw) return;
    try {
      const nextDraft = JSON.parse(raw) as AssistantDraft;
      setDraft(nextDraft);
      if (nextDraft.service && services.some((item) => item.slug === nextDraft.service)) {
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
    const description = String(data.get("description") || "").trim();
    const location = String(data.get("location") || "").trim();
    const budget = Number(data.get("budget"));
    const workersNeeded = Number(data.get("workers"));
    if (!description || !location || !data.get("date") || budget < 1 || workersNeeded < 1) {
      toast.error(
        lang === "hi" ? "Please fill all required details" : "Please fill all required fields",
      );
      return;
    }
    setLoading(true);
    api
      .createJob({
        category: service,
        title: description.slice(0, 52),
        description,
        problemImageUrl,
        location,
        date: data.get("date"),
        time: data.get("time"),
        wage: budget,
        workersNeeded,
        urgency: data.get("urgency"),
      })
      .then(() => {
        toast.success(lang === "hi" ? "Job posted" : "Job posted");
        navigate({ to: "/customer/my-requests" });
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Could not post job");
      })
      .finally(() => setLoading(false));
  };

  return (
    <PageShell bottomNav={<BottomNav role="customer" />}>
      <div className="-mx-4 -mb-28 -mt-4 min-h-[100dvh] bg-primary pb-28">
        <header className="relative overflow-hidden px-4 pb-8 pt-5 text-primary-foreground">
          <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <Link
              to="/customer"
              aria-label="Back to customer home"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/15">
              <ClipboardCheck className="h-5 w-5" />
            </span>
          </div>
          <div className="relative mt-6">
            <p className="text-xs text-primary-foreground/65">Create a clear hiring request</p>
            <h1 className="customer-section-title mt-1 text-[1.85rem] leading-tight">
              {t("newRequest")}
            </h1>
            <p className="mt-2 max-w-[19rem] text-sm leading-5 text-primary-foreground/70">
              Add the work, location, timing and budget so Anga can find better worker matches.
            </p>
          </div>
          <div className="relative mt-5 flex items-center gap-2 rounded-[1.25rem] bg-white/12 p-3 text-xs text-primary-foreground/75 backdrop-blur">
            <Sparkles className="h-4 w-4 shrink-0" />
            You can also describe the work naturally to Anga AI.
          </div>
        </header>

        <main className="mx-1.5 min-h-[70dvh] rounded-t-[2.5rem] bg-background px-4 pb-7 pt-5">
          {preferredWorkerName && (
            <div className="mb-4 flex items-center gap-3 rounded-[1.35rem] border border-primary/15 bg-primary/[0.055] p-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="customer-card-title truncate text-sm">
                  Request for {preferredWorkerName}
                </p>
                <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                  Post the job now; this worker can review and apply to it.
                </p>
              </div>
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <section className="space-y-4 rounded-[1.6rem] bg-card p-4 shadow-sm">
              <Field label={t("serviceType")}>
                <ServicePicker
                  value={service}
                  open={serviceMenuOpen}
                  onOpenChange={setServiceMenuOpen}
                  onChange={setService}
                  lang={lang}
                />
              </Field>

              <Field label={t("description")}>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={draft?.summary ?? ""}
                  placeholder={
                    lang === "hi"
                      ? "Describe the work in simple words"
                      : "Describe the work in simple words"
                  }
                  className="field min-h-28 resize-none"
                  required
                />
              </Field>

              <ProblemImageUpload
                previewUrl={problemImageUrl}
                fileName={problemImageName}
                onRemove={() => {
                  setProblemImageUrl("");
                  setProblemImageName("");
                }}
                onFileSelect={async (file) => {
                  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
                    toast.error("Choose an image smaller than 5 MB");
                    return;
                  }
                  setProblemImageName(file.name);
                  try {
                    const dataUrl = await fileToProblemImageDataUrl(file);
                    setProblemImageUrl(dataUrl);
                    toast.success(
                      lang === "hi" ? "Problem photo added" : "Problem photo added successfully",
                    );
                  } catch {
                    setProblemImageName("");
                    setProblemImageUrl("");
                    toast.error(lang === "hi" ? "Could not add photo" : "Could not add photo");
                  }
                }}
              />
            </section>

            <section className="space-y-4 rounded-[1.6rem] bg-card p-4 shadow-sm">
              <Field label={t("location")}>
                <LocationAutocomplete
                  name="location"
                  defaultValue={draft?.location ?? ""}
                  placeholder="Area, City"
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label={t("date")}>
                  <input
                    name="date"
                    type="date"
                    defaultValue={draftDate(draft?.when)}
                    min={todayInputValue()}
                    className="field"
                    required
                  />
                </Field>
                <Field label={t("time")}>
                  <input name="time" type="time" className="field" />
                </Field>
              </div>
            </section>

            <section className="space-y-4 rounded-[1.6rem] bg-card p-4 shadow-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("budget")}>
                  <input
                    name="budget"
                    type="number"
                    defaultValue={draft?.budget ?? ""}
                    placeholder="900"
                    min="1"
                    className="field"
                    required
                  />
                </Field>
                <Field label={t("workersNeeded")}>
                  <input
                    name="workers"
                    type="number"
                    min="1"
                    defaultValue={draft?.workersNeeded ?? 1}
                    className="field"
                    required
                  />
                </Field>
              </div>

              <Field label={t("urgency")}>
                <select name="urgency" defaultValue={draftUrgency(draft)} className="field">
                  <option>{lang === "hi" ? "Today" : "Today"}</option>
                  <option>{lang === "hi" ? "Tomorrow" : "Tomorrow"}</option>
                  <option>{lang === "hi" ? "This week" : "This week"}</option>
                  <option>{lang === "hi" ? "Urgent" : "Urgent"}</option>
                </select>
              </Field>
            </section>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate({ to: "/customer" })}
                className="btn-outline"
              >
                {t("cancel")}
              </button>
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {lang === "hi" ? "Posting..." : "Posting..."}
                  </>
                ) : (
                  t("postJob")
                )}
              </button>
            </div>
          </form>
        </main>
      </div>
    </PageShell>
  );
}

function ServicePicker({
  value,
  open,
  onOpenChange,
  onChange,
  lang,
}: {
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  lang: "en" | "hi";
}) {
  const selected = services.find((item) => item.slug === value) || services[0];
  const SelectedIcon = selected.icon;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="field flex items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <SelectedIcon className="h-5 w-5" />
          </span>
          <span className="truncate">{serviceLabel(selected, lang)}</span>
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 max-h-72 overflow-y-auto rounded-[1.35rem] border border-border bg-card p-2 shadow-2xl shadow-primary/15">
          {services.map((item) => {
            const Icon: LucideIcon = item.icon;
            const active = item.slug === value;
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => {
                  onChange(item.slug);
                  onOpenChange(false);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${
                    active ? "bg-white/18" : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black">
                    {serviceLabel(item, lang)}
                  </span>
                  <span
                    className={`block text-xs font-semibold ${
                      active ? "text-primary-foreground/75" : "text-muted-foreground"
                    }`}
                  >
                    Nearby verified workers
                  </span>
                </span>
                {active && <Check className="h-5 w-5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProblemImageUpload({
  previewUrl,
  fileName,
  onFileSelect,
  onRemove,
}: {
  previewUrl: string;
  fileName: string;
  onFileSelect: (file: File) => void | Promise<void>;
  onRemove: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground/80">Problem photo</span>
        <span className="text-xs font-bold text-muted-foreground">Optional</span>
      </div>
      <div className="relative overflow-hidden rounded-[1.35rem] border border-dashed border-primary/30 bg-card shadow-sm transition hover:border-primary/60">
        <label className="flex min-h-36 cursor-pointer items-center gap-3 p-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Problem preview"
              className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-sm"
            />
          ) : (
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-primary/10 text-primary">
              <ImagePlus className="h-7 w-7" />
            </span>
          )}

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black">
              {previewUrl ? "Photo attached" : "Upload issue photo"}
            </span>
            <span className="mt-1 block text-xs font-semibold leading-5 text-muted-foreground">
              Add a clear image of leakage, wiring, painting area or broken part.
            </span>
            {fileName && (
              <span className="mt-2 inline-flex max-w-full items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                <Camera className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
              </span>
            )}
          </span>

          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void onFileSelect(file);
              event.target.value = "";
            }}
          />
        </label>
        {previewUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-destructive shadow-md"
            aria-label="Remove problem photo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-semibold text-foreground/80">{label}</span>
      {children}
    </div>
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

function serviceLabel(service: Service, lang: "en" | "hi") {
  return lang === "hi" ? service.hi : service.en;
}

function draftDate(when?: string) {
  if (!when) return "";
  const date = new Date();
  if (when === "Tomorrow") date.setDate(date.getDate() + 1);
  if (when !== "Today" && when !== "Tomorrow") return "";
  return date.toISOString().slice(0, 10);
}

function todayInputValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function draftUrgency(draft: AssistantDraft | null) {
  if (draft?.urgency === "Urgent") return "Urgent";
  if (draft?.when === "Tomorrow") return "Tomorrow";
  if (draft?.when === "Today") return "Today";
  return "Today";
}

function fileToProblemImageDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const maxSize = 720;
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not prepare image"));
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image"));
    };

    image.src = objectUrl;
  });
}
