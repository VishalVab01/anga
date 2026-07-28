import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Siren,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { JobDetailsSkeleton } from "@/components/AppLoadingSkeletons";
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
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .job(id)
      .then((result) => setApiJob(result.job))
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Using demo job"),
      )
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
    if (!job || applying || job.applicationStatus === "pending") return;
    setApplying(true);
    try {
      if (apiJob) await api.apply(apiJob._id);
      toast.success(lang === "hi" ? "आवेदन भेजा गया" : "Application sent");
      navigate({ to: "/worker/applications" });
    } catch (applyError) {
      toast.error(applyError instanceof Error ? applyError.message : "Could not apply");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <JobDetailsSkeleton />
      </PageShell>
    );
  }

  if (!job) {
    return (
      <PageShell>
        <div className="grid min-h-[70dvh] place-items-center text-center">
          <div>
            <BriefcaseBusiness className="mx-auto h-10 w-10 text-primary" />
            <h1 className="worker-section-title mt-4 text-xl">Job not found</h1>
            <button onClick={() => navigate({ to: "/worker" })} className="btn-primary mt-5">
              Back to jobs
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="-mx-4 -mb-8 -mt-4 min-h-[100dvh] bg-primary pb-8 text-foreground">
        <header className="relative overflow-hidden px-4 pb-7 pt-5 text-primary-foreground">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate({ to: "/worker" })}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <p className="worker-section-title text-sm text-primary-foreground">
              {t("jobDetails")}
            </p>
            <button
              type="button"
              onClick={saveCurrentJob}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
              aria-label={t("saveJob")}
            >
              <Bookmark className="h-5 w-5" />
            </button>
          </div>

          <div className="relative mt-7 flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.35rem] bg-white text-primary shadow-xl shadow-blue-950/20">
              {service ? (
                <service.icon className="h-7 w-7" />
              ) : (
                <BriefcaseBusiness className="h-7 w-7" />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-xs text-primary-foreground/65">{serviceName(job.service, lang)}</p>
              <h1 className="worker-section-title mt-1 text-[1.45rem] leading-tight text-primary-foreground">
                {job.title}
              </h1>
              <p className="mt-2 flex items-center gap-1 text-xs text-primary-foreground/70">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{job.location}</span>
              </p>
            </div>
          </div>

          <div className="relative mt-5 flex flex-wrap gap-2 text-[10px]">
            <HeroPill icon={<ShieldCheck />} text={t("verified")} />
            <HeroPill icon={<Users />} text={`${job.workersNeeded} worker needed`} />
            <HeroPill icon={<BriefcaseBusiness />} text={job.wageType} />
          </div>
        </header>

        <main className="mx-1.5 min-h-[70dvh] rounded-t-[2.5rem] bg-background px-4 pb-5 pt-5">
          {error && (
            <div className="mb-4 rounded-[1.25rem] bg-amber-50 px-4 py-3 text-xs text-amber-700">
              Live details are unavailable, so demo job information is shown.
            </div>
          )}

          <section className="grid grid-cols-3 gap-2.5">
            <QuickFact icon={<Wallet />} label={t("payment")} value={`₹${job.payment}`} />
            <QuickFact icon={<Clock3 />} label={t("time")} value={job.time} />
            <QuickFact icon={<MapPin />} label="Distance" value={`${job.distanceKm} km`} />
          </section>

          <section className="mt-5 rounded-[1.65rem] bg-card p-4 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.55)]">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                <BriefcaseBusiness className="h-4 w-4" />
              </span>
              <h2 className="worker-section-title text-base">About this job</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{job.description}</p>
          </section>

          {job.problemImageUrl && (
            <section className="mt-4 overflow-hidden rounded-[1.65rem] bg-card p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <h2 className="worker-section-title text-sm">Problem photo</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] text-primary">
                  Customer uploaded
                </span>
              </div>
              <img
                src={job.problemImageUrl}
                alt="Customer uploaded problem"
                className="max-h-60 w-full rounded-[1.35rem] object-cover"
              />
            </section>
          )}

          <section className="mt-4 rounded-[1.65rem] bg-card p-4 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.55)]">
            <h2 className="worker-section-title text-base">
              {lang === "hi" ? "ज़रूरी बातें" : "What you’ll need"}
            </h2>
            <div className="mt-3 space-y-2.5">
              {job.requirements.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 rounded-[1.1rem] bg-primary/5 px-3 py-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-sm leading-5">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-4 rounded-[1.65rem] bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-lg text-primary-foreground shadow-lg shadow-primary/20">
                {job.customer.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="worker-card-title truncate text-base">{job.customer}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{job.customerType}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-current" /> {job.rating} · Trusted hirer
                </p>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>
          </section>

          {accepted && (
            <section className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => toast.error(t("sos"))}
                className="btn-outline border-destructive text-destructive"
              >
                <Siren className="h-4 w-4" /> {t("sos")}
              </button>
              <a href="tel:112" className="btn-outline">
                <Phone className="h-4 w-4" /> {t("emergencyContact")}
              </a>
            </section>
          )}

          <section className="mt-4 grid grid-cols-2 gap-2.5">
            <a href="tel:9000000000" className="btn-outline">
              <Phone className="h-4 w-4" /> {t("call")}
            </a>
            <button onClick={() => toast(t("reportIssue"))} className="btn-outline">
              <AlertTriangle className="h-4 w-4" /> {t("reportIssue")}
            </button>
          </section>

          <div className="sticky bottom-2 z-20 mt-5 flex gap-2.5 rounded-[1.6rem] border border-white/70 bg-card/92 p-2.5 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
            <button
              type="button"
              onClick={saveCurrentJob}
              className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center rounded-[1.15rem] bg-primary/10 text-primary"
              aria-label={t("saveJob")}
            >
              <Bookmark className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={applying || job.applicationStatus === "pending"}
              className="flex h-[3.25rem] flex-1 items-center justify-center gap-2 rounded-[1.15rem] bg-primary px-5 text-sm text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-60"
            >
              {applying && <Loader2 className="h-4 w-4 animate-spin" />}
              {job.applicationStatus === "pending" ? "Application pending" : t("apply")}
            </button>
          </div>
        </main>
      </div>
    </PageShell>
  );
}

function HeroPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-primary-foreground/80 backdrop-blur [&>svg]:h-3 [&>svg]:w-3">
      {icon}
      {text}
    </span>
  );
}

function QuickFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[1.35rem] bg-card px-2.5 py-3 text-center shadow-[0_12px_30px_-24px_rgba(15,23,42,0.5)]">
      <span className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>
      <p className="mt-2 text-[9px] text-muted-foreground">{label}</p>
      <p className="worker-card-title mt-0.5 truncate text-[11px]">{value}</p>
    </div>
  );
}

function mapApiJob(job: ApiJob) {
  return {
    id: job._id,
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
    id: job.id,
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
