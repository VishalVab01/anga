import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MoreHorizontal,
  Phone,
  ShieldCheck,
  Siren,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { api, type ApiJob } from "@/lib/api";
import { jobs as fallbackJobs, serviceName, services } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { saveJob } from "@/lib/savedJobs";

export const Route = createFileRoute("/worker/job/$id")({
  head: () => ({ meta: [{ title: "Anga - Job details" }] }),
  component: JobDetails,
});

function JobDetails() {
  const { id } = Route.useParams();
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [apiJob, setApiJob] = useState<ApiJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .job(id)
      .then((result) => setApiJob(result.job))
      .catch((err) => setError(err instanceof Error ? err.message : "Using demo job"))
      .finally(() => setLoading(false));
  }, [id]);

  const fallback = fallbackJobs.find((item) => item.id === id);
  const job = apiJob ? mapApiJob(apiJob) : fallback ? mapFallbackJob(fallback, lang) : null;
  const accepted = job?.status === "assigned" || job?.applicationStatus === "accepted";
  const service = job ? services.find((item) => item.slug === job.service) : null;

  const saveCurrentJob = () => {
    if (!job) return;
    saveJob({
      id: job.id,
      title: job.title,
      service: job.service,
      location: job.location,
      payment: job.payment,
      time: job.time,
      distanceKm: job.distanceKm,
      rating: job.rating,
    });
    toast.success(t("saved"));
  };

  const apply = async () => {
    if (!apiJob) {
      toast.success(lang === "hi" ? "आवेदन भेजा गया" : "Application sent");
      navigate({ to: "/worker/applications" });
      return;
    }
    try {
      await api.apply(apiJob._id);
      toast.success(lang === "hi" ? "आवेदन भेजा गया" : "Application sent");
      navigate({ to: "/worker/applications" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not apply");
    }
  };

  if (!job && !loading) {
    return (
      <PageShell title="Not found" back="/worker">
        <p>Job not found</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {loading && (
        <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
          Loading job...
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-2xl bg-accent/10 p-3 text-xs font-semibold text-accent">
          {error}
        </p>
      )}

      {job && (
        <div className="-mx-4 -mt-4 min-h-screen bg-background text-foreground">
          <section className="relative overflow-hidden rounded-b-[2.25rem] bg-gradient-to-br from-primary via-[#2f6fec] to-[#5f8df7] px-4 pb-12 pt-5 text-primary-foreground shadow-2xl shadow-primary/25">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.32),transparent_58%)]" />
            <div className="pointer-events-none absolute -left-24 top-20 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 top-8 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate({ to: "/worker" })}
                className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-primary-foreground shadow-lg backdrop-blur"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-base font-extrabold text-primary-foreground">
                {t("jobDetails")}
              </h1>
              <button
                type="button"
                onClick={saveCurrentJob}
                className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-primary-foreground shadow-lg backdrop-blur"
                aria-label="More"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <div className="relative z-10 mt-7 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/30 bg-white/18 text-primary-foreground shadow-2xl shadow-primary/25 backdrop-blur">
                {service ? <service.icon className="h-8 w-8" /> : <MapPin className="h-8 w-8" />}
              </div>
              <p className="mt-4 text-sm font-bold text-primary-foreground/70">
                {serviceName(job.service, lang)}
              </p>
              <h2 className="mx-auto mt-1 max-w-[19rem] text-2xl font-black leading-tight tracking-normal">
                {job.title}
              </h2>
              <p className="mx-auto mt-2 max-w-[17rem] text-xs font-semibold leading-5 text-primary-foreground/70">
                {job.customerType} hiring for local daily-wage work
              </p>
            </div>

            <div className="relative z-10 mx-auto mt-5 grid max-w-sm grid-cols-2 overflow-hidden rounded-[1.35rem] border border-white/20 bg-white/18 shadow-2xl shadow-primary/20 backdrop-blur">
              <HeroMetric
                label={lang === "hi" ? "काम का प्रकार" : "Job type"}
                value={job.wageType}
              />
              <HeroMetric label={t("payment")} value={`₹${job.payment}`} />
            </div>
          </section>

          <section className="relative z-10 -mt-6 mx-4 rounded-[2rem] bg-card px-4 pb-5 pt-5 text-foreground shadow-2xl shadow-primary/10">
            <div className="grid grid-cols-2 gap-3">
              <DetailTile
                tone="primary"
                icon={<CalendarDays className="h-5 w-5" />}
                title={t("time")}
                text={job.time}
              />
              <DetailTile
                tone="mint"
                icon={<MapPin className="h-5 w-5" />}
                title={t("location")}
                text={`${job.location} · ${job.distanceKm} km`}
              />
              <div className="col-span-2">
                <DetailTile
                  tone="primarySoft"
                  icon={<Users className="h-5 w-5" />}
                  title={t("fullDetails")}
                  text={job.description}
                />
              </div>
            </div>

            {job.problemImageUrl && (
              <div className="mt-4 overflow-hidden rounded-[1.65rem] bg-background p-3 shadow-xl shadow-primary/5">
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <h3 className="text-sm font-black">Problem photo</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-black uppercase text-primary">
                    Customer uploaded
                  </span>
                </div>
                <img
                  src={job.problemImageUrl}
                  alt="Customer uploaded problem"
                  className="max-h-56 w-full rounded-[1.35rem] object-cover"
                />
              </div>
            )}

            <div className="mt-4 rounded-[1.65rem] bg-background p-4 shadow-xl shadow-primary/5">
              <h3 className="text-sm font-black">
                {lang === "hi" ? "जरूरी बातें" : "Work requirements"}
              </h3>
              <div className="mt-3 grid gap-2">
                {job.requirements.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm font-semibold"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <section className="mt-4 rounded-[1.65rem] bg-background p-4 shadow-xl shadow-primary/5">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-sm font-black text-primary">
                  {job.customer.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-black">{job.customer}</p>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {job.customerType} · {job.workersNeeded}{" "}
                    {lang === "hi" ? "वर्कर चाहिए" : "worker needed"}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-current" /> {job.rating} · 123+ Applicants
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                  <ShieldCheck className="h-3 w-3" /> {t("verified")}
                </span>
              </div>
            </section>

            {accepted && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => toast.error(t("sos"))}
                  className="btn-outline border-destructive text-destructive"
                >
                  <Siren className="h-4 w-4" /> {t("sos")}
                </button>
                <a href="tel:112" className="btn-outline">
                  <Phone className="h-4 w-4" /> {t("emergencyContact")}
                </a>
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button onClick={saveCurrentJob} className="btn-outline px-2 text-xs">
                <Bookmark className="h-4 w-4" /> {t("saveJob")}
              </button>
              <a href="tel:9000000000" className="btn-outline px-2 text-xs">
                <Phone className="h-4 w-4" /> {t("call")}
              </a>
              <button onClick={() => toast(t("reportIssue"))} className="btn-outline px-2 text-xs">
                <AlertTriangle className="h-4 w-4" /> {t("reportIssue")}
              </button>
            </div>

            <button
              onClick={apply}
              disabled={job.applicationStatus === "pending"}
              className="mt-4 w-full rounded-[1.4rem] bg-foreground px-5 py-4 text-base font-black text-background shadow-2xl shadow-foreground/20 disabled:opacity-60"
            >
              {job.applicationStatus === "pending" ? "Applied / Pending" : t("apply")}
            </button>
          </section>
        </div>
      )}
    </PageShell>
  );
}

function mapApiJob(job: ApiJob) {
  return {
    title: job.title,
    service: job.category,
    location: job.location,
    payment: job.wage,
    time: [job.date, job.time].filter(Boolean).join(", ") || "Today",
    workersNeeded: job.workersNeeded,
    rating: 4.7,
    distanceKm: 2.5,
    status: job.status,
    applicationStatus: job.applicationStatus,
    description: job.description,
    problemImageUrl: job.problemImageUrl || "",
    customer: "Verified customer",
    customerType: "Local customer",
    wageType: job.urgent ? "Urgent" : "Daily wage",
    requirements: [
      job.urgent ? "Urgent work" : "Daily wage work",
      "Payment after work confirmation",
    ],
  };
}

function mapFallbackJob(job: (typeof fallbackJobs)[number], lang: "en" | "hi") {
  return {
    title: job.title[lang],
    service: job.service,
    location: job.location[lang],
    payment: job.payment,
    time: job.time[lang],
    workersNeeded: job.workersNeeded,
    rating: job.customerRating,
    distanceKm: job.distanceKm,
    status: job.status,
    applicationStatus: null,
    description: job.description[lang],
    problemImageUrl: "",
    customer: job.customer[lang],
    customerType: job.customerType[lang],
    wageType: job.wageType[lang],
    requirements: job.requirements.map((item) => item[lang]),
  };
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-white/20 px-4 py-3 text-center last:border-r-0">
      <p className="text-[11px] font-bold text-primary-foreground/65">{label}</p>
      <p className="mt-1 text-base font-black text-primary-foreground">{value}</p>
    </div>
  );
}

function DetailTile({
  icon,
  title,
  text,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  tone: "primary" | "mint" | "primarySoft";
}) {
  const classes = {
    primary: "bg-primary/12 text-foreground",
    mint: "bg-emerald-100 text-foreground",
    primarySoft: "bg-card text-foreground ring-1 ring-primary/10",
  }[tone];
  const iconClasses = {
    primary: "bg-white text-primary",
    mint: "bg-white text-emerald-600",
    primarySoft: "bg-primary/10 text-primary",
  }[tone];

  return (
    <div className={`min-h-28 rounded-[1.5rem] p-4 shadow-sm ${classes}`}>
      <div className={`grid h-10 w-10 place-items-center rounded-full ${iconClasses}`}>{icon}</div>
      <p className="mt-4 text-xs font-bold text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm font-black leading-5">{text}</p>
    </div>
  );
}
