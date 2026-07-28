import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CardListSkeleton } from "@/components/AppLoadingSkeletons";
import { PageShell } from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type ApiApplication } from "@/lib/api";
import { jobs, serviceName, services } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/worker/applications")({
  head: () => ({ meta: [{ title: "Anga - My Applications" }] }),
  component: Applications,
});

type ApplicationCardData = {
  id: string;
  title: string;
  location: string;
  wage: number;
  service: string;
  status: string;
  time: string;
};

type ApplicationFilter = "all" | "pending" | "accepted";

function Applications() {
  const { t, lang } = useT();
  const [apps, setApps] = useState<ApiApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApplicationFilter>("all");

  useEffect(() => {
    api
      .myApplications()
      .then((result) => setApps(result.applications))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const applications = useMemo<ApplicationCardData[]>(() => {
    if (apps.length) {
      return apps.map((app) => ({
        id: app.jobId._id,
        title: app.jobId.title,
        location: app.jobId.location,
        wage: app.jobId.wage,
        service: app.jobId.category,
        status: app.status,
        time: [app.jobId.date, app.jobId.time].filter(Boolean).join(", ") || "Flexible",
      }));
    }

    return jobs
      .filter((job) => job.status !== "Open")
      .map((job) => ({
        id: job.id,
        title: job.title[lang],
        location: job.location[lang],
        wage: job.payment,
        service: job.service,
        status: job.status,
        time: job.time[lang],
      }));
  }, [apps, lang]);

  const acceptedCount = applications.filter(
    (item) => normalizeStatus(item.status) === "accepted",
  ).length;
  const pendingCount = applications.filter(
    (item) => normalizeStatus(item.status) === "pending",
  ).length;
  const visibleApplications = applications.filter((item) => {
    if (filter === "all") return true;
    return normalizeStatus(item.status) === filter;
  });

  return (
    <PageShell bottomNav={<BottomNav role="worker" />}>
      <div className="-mx-4 -mb-28 -mt-4 min-h-[100dvh] bg-primary pb-28">
        <header className="relative overflow-hidden px-4 pb-7 pt-5 text-primary-foreground">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <Link
              to="/worker"
              aria-label="Back to worker home"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {loading ? (
              <Skeleton className="h-7 w-16 rounded-full bg-white/20" />
            ) : (
              <span className="rounded-full bg-white/12 px-3 py-1.5 text-[11px] text-primary-foreground/80">
                {applications.length} total
              </span>
            )}
          </div>

          <div className="relative mt-6">
            <p className="text-xs text-primary-foreground/65">Your work journey</p>
            <h1 className="worker-section-title mt-1 text-[1.85rem] leading-tight">
              {t("myApps")}
            </h1>
            <p className="mt-2 max-w-[18rem] text-sm leading-5 text-primary-foreground/70">
              Track applications, upcoming work and completed opportunities in one place.
            </p>
          </div>

          {loading ? (
            <div
              className="relative mt-5 grid grid-cols-2 gap-2.5"
              aria-label="Loading application summary"
            >
              <Skeleton className="h-[4.1rem] rounded-[1.25rem] bg-white/20" />
              <Skeleton className="h-[4.1rem] rounded-[1.25rem] bg-white/20" />
            </div>
          ) : (
            <div className="relative mt-5 grid grid-cols-2 gap-2.5">
              <StatusSummary icon={<Clock3 />} label="In review" value={pendingCount} />
              <StatusSummary icon={<CheckCircle2 />} label="Accepted" value={acceptedCount} />
            </div>
          )}
        </header>

        <main className="mx-1.5 min-h-[65dvh] rounded-t-[2.5rem] bg-background px-4 pb-7 pt-5">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(["all", "pending", "accepted"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs capitalize shadow-sm transition ${
                  filter === item
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <section className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="worker-section-title text-base">Application activity</h2>
              <span className="text-xs text-muted-foreground">Latest first</span>
            </div>

            {loading ? (
              <CardListSkeleton count={4} />
            ) : visibleApplications.length ? (
              <div className="space-y-3">
                {visibleApplications.map((application) => (
                  <ApplicationCard
                    key={`${application.id}-${application.status}`}
                    item={application}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-primary/25 bg-primary/5 px-6 py-10 text-center">
                <BriefcaseBusiness className="mx-auto h-9 w-9 text-primary" />
                <p className="worker-card-title mt-3 text-sm">
                  No {filter === "all" ? "" : `${filter} `}jobs yet
                </p>
                <p className="mx-auto mt-1 max-w-56 text-xs leading-5 text-muted-foreground">
                  New applications and status updates will appear here.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </PageShell>
  );
}

function StatusSummary({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[1.25rem] border border-white/15 bg-white/12 p-3 backdrop-blur">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <span>
        <span className="worker-card-title block text-lg leading-none">{value}</span>
        <span className="mt-1 block text-[10px] text-primary-foreground/65">{label}</span>
      </span>
    </div>
  );
}

function ApplicationCard({ item }: { item: ApplicationCardData }) {
  const service = services.find((entry) => entry.slug === item.service);
  const status = normalizeStatus(item.status);
  const StatusIcon =
    status === "accepted" ? CheckCircle2 : status === "rejected" ? XCircle : Clock3;
  const statusClass =
    status === "accepted"
      ? "bg-emerald-100 text-emerald-700"
      : status === "rejected"
        ? "bg-rose-100 text-rose-700"
        : "bg-amber-100 text-amber-700";

  return (
    <Link
      to="/worker/job/$id"
      params={{ id: item.id }}
      className="group relative block overflow-hidden rounded-[1.6rem] border border-white bg-gradient-to-br from-white via-white to-blue-50 p-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.55)] transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span className="pointer-events-none absolute -right-12 -top-14 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.1rem] bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          {service ? (
            <service.icon className="h-5 w-5" />
          ) : (
            <BriefcaseBusiness className="h-5 w-5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block truncate text-[10px] text-primary">
                {serviceName(item.service, "en")}
              </span>
              <span className="worker-card-title mt-0.5 line-clamp-2 block text-[0.95rem] leading-snug">
                {item.title}
              </span>
            </span>
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[9px] capitalize ${statusClass}`}
            >
              <StatusIcon className="h-3 w-3" /> {item.status}
            </span>
          </span>
          <span className="mt-2 flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{item.location}</span>
          </span>
        </span>
      </div>

      <div className="relative mt-3 flex items-center gap-2 border-t border-primary/10 pt-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[10px] text-primary shadow-sm">
          <Wallet className="h-3 w-3" /> ₹{item.wage}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[10px] text-muted-foreground shadow-sm">
          <CalendarClock className="h-3 w-3 shrink-0" />
          <span className="truncate">{item.time}</span>
        </span>
        <span className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-background transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function normalizeStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "accepted" || normalized === "assigned") return "accepted";
  if (normalized === "rejected" || normalized === "cancelled") return "rejected";
  return "pending";
}
