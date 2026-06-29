import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Briefcase, MapPin, Search, ShieldCheck, Star, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { api, type ApiJob } from "@/lib/api";
import { jobs as fallbackJobs, serviceName, services } from "@/lib/data";
import { useT, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/worker/")({
  head: () => ({ meta: [{ title: "Anga - Worker home" }] }),
  component: WorkerHome,
});

type JobCardData = {
  id: string;
  title: string;
  service: string;
  location: string;
  payment: number;
  time: string;
  status: string;
  distanceKm: number;
  rating: number;
  verified: boolean;
  wageType: string;
  applicationStatus?: string | null;
};

function WorkerHome() {
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const [apiJobs, setApiJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .nearbyJobs()
      .then((result) => setApiJobs(result.jobs))
      .catch((err) => setError(err instanceof Error ? err.message : "Using demo jobs"))
      .finally(() => setLoading(false));
  }, []);

  const list = useMemo(() => {
    const live = [...apiJobs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(mapApiJob);
    const fallback = fallbackJobs.map((job) => ({
      id: job.id,
      title: job.title[lang],
      service: job.service,
      location: job.location[lang],
      payment: job.payment,
      time: job.time[lang],
      status: job.status,
      distanceKm: job.distanceKm,
      rating: job.customerRating,
      verified: job.verifiedCustomer,
      wageType: job.wageType[lang],
    }));
    return live.length ? live : fallback;
  }, [apiJobs, lang]);

  const filtered = list.filter((job) => {
    const haystack = `${job.title} ${job.location} ${serviceName(job.service, lang)}`.toLowerCase();
    return haystack.includes(q.toLowerCase());
  });

  return (
    <PageShell bottomNav={<BottomNav role="worker" />}>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">{t("greeting")}!</p>
          <h1 className="text-2xl font-extrabold">{t("findWork")}</h1>
        </div>

        {error && (
          <p className="rounded-2xl bg-accent/10 p-3 text-xs font-semibold text-accent">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Stat label={lang === "hi" ? "आज" : "Today"} value={`${list.length}`} />
          <Stat label={lang === "hi" ? "औसत मजदूरी" : "Avg wage"} value="₹950" />
          <Stat label={lang === "hi" ? "पास में" : "Nearby"} value="5 km" />
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder={t("search")}
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <QuickLink
            to="/worker/applications"
            icon={<Briefcase className="h-6 w-6 text-primary" />}
            label={t("myApps")}
          />
          <QuickLink
            to="/assistant"
            icon={<Search className="h-6 w-6 text-primary" />}
            label={t("assistant")}
          />
          <QuickLink
            to="/worker/notifications"
            icon={<Bell className="h-6 w-6 text-primary" />}
            label={t("notifications")}
          />
        </div>

        <div>
          <h2 className="mb-3 text-base font-bold">{t("skills")}</h2>
          <div className="grid grid-cols-4 gap-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.slug}
                  onClick={() => setQ(lang === "hi" ? service.hi : service.en)}
                  className="card-soft card-soft-hover flex flex-col items-center gap-1.5 p-3"
                >
                  <Icon className="h-7 w-7 text-primary" strokeWidth={2} />
                  <span className="text-center text-[11px] font-semibold leading-tight">
                    {lang === "hi" ? service.hi : service.en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-base font-bold">{t("nearby")}</h2>
          <div className="space-y-3">
            {loading && (
              <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
                Loading jobs...
              </p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
                {lang === "hi" ? "काम नहीं मिला" : "No jobs found"}
              </p>
            )}
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} lang={lang} />
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function mapApiJob(job: ApiJob): JobCardData {
  return {
    id: job._id,
    title: job.title,
    service: job.category,
    location: job.location,
    payment: job.wage,
    time: [job.date, job.time].filter(Boolean).join(", ") || "Today",
    status: job.applicationStatus ? job.applicationStatus : job.status,
    distanceKm: 2.5,
    rating: 4.7,
    verified: true,
    wageType: job.urgent ? "Urgent" : "Daily wage",
    applicationStatus: job.applicationStatus,
  };
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="card-soft flex flex-col items-center gap-1.5 p-3 text-center">
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-soft p-3 text-center">
      <div className="text-lg font-extrabold text-primary">{value}</div>
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
    </div>
  );
}

function JobCard({ job, lang }: { job: JobCardData; lang: Lang }) {
  const service = services.find((item) => item.slug === job.service);
  const statusClass =
    job.status === "accepted" || job.status === "assigned"
      ? "bg-success/15 text-success"
      : job.status === "rejected" || job.status === "cancelled"
        ? "bg-destructive/10 text-destructive"
        : "bg-accent/15 text-accent";

  return (
    <Link
      to="/worker/job/$id"
      params={{ id: job.id }}
      className="card-soft card-soft-hover block p-4"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10">
          {service && <service.icon className="h-6 w-6 text-primary" strokeWidth={2} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 text-base font-bold leading-tight">{job.title}</h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass}`}
            >
              {job.applicationStatus === "pending" ? "Applied" : job.status}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {job.location} · {job.distanceKm} km
          </p>
          <div className="mt-3 grid grid-cols-[0.9fr_1.45fr_0.8fr] gap-2 text-xs">
            <span className="flex min-h-11 min-w-0 items-center justify-center rounded-xl bg-primary/10 px-2 py-1.5 text-center font-bold leading-tight text-primary">
              ₹{job.payment}
            </span>
            <span className="flex min-h-11 min-w-0 items-center justify-center rounded-xl bg-muted px-2 py-1.5 text-center font-semibold leading-tight">
              <span className="line-clamp-2">{job.time}</span>
            </span>
            <span className="flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-xl bg-muted px-2 py-1.5 text-center font-semibold leading-tight">
              <Star className="h-3 w-3 shrink-0 fill-current text-amber-500" /> {job.rating}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.verified && (
              <TrustPill
                icon={<ShieldCheck className="h-3 w-3" />}
                text={lang === "hi" ? "सत्यापित" : "Verified"}
              />
            )}
            <TrustPill icon={<Wallet className="h-3 w-3" />} text={job.wageType} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function TrustPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
      {icon}
      {text}
    </span>
  );
}
