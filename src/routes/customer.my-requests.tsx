import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CardListSkeleton } from "@/components/AppLoadingSkeletons";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type ApiJob } from "@/lib/api";
import { seedRequests, services } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/customer/my-requests")({
  head: () => ({ meta: [{ title: "Anga - My Posted Jobs" }] }),
  component: MyRequests,
});

type RequestFilter = "all" | "open" | "assigned" | "completed";

type RequestItem = {
  id: string;
  title: string;
  service: string;
  date: string;
  location: string;
  budget: number;
  status: string;
  applicants: number;
  apiBacked: boolean;
};

function MyRequests() {
  const { t, lang } = useT();
  const [apiJobs, setApiJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [filter, setFilter] = useState<RequestFilter>("all");

  const loadJobs = useCallback(() => {
    setLoading(true);
    api
      .jobs("?mine=true")
      .then((result) => {
        setApiJobs(result.jobs);
        setLoadFailed(false);
      })
      .catch(() => {
        setApiJobs([]);
        setLoadFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const requests = useMemo<RequestItem[]>(() => {
    if (apiJobs.length) {
      return apiJobs.map((job) => ({
        id: job._id,
        title: job.title,
        service: job.category,
        date: [job.date, job.time].filter(Boolean).join(", "),
        location: job.location,
        budget: job.wage,
        status: job.status,
        applicants: job.applicants.length,
        apiBacked: true,
      }));
    }

    if (!loadFailed) return [];
    return seedRequests.map((request) => ({
      id: request.id,
      title: request.title[lang],
      service: request.service,
      date: request.date[lang],
      location: request.location[lang],
      budget: request.budget,
      status: request.status.en,
      applicants: request.applicants,
      apiBacked: false,
    }));
  }, [apiJobs, lang, loadFailed]);

  const activeCount = requests.filter((item) =>
    ["open", "assigned"].includes(normalizeStatus(item.status)),
  ).length;
  const completedCount = requests.filter(
    (item) => normalizeStatus(item.status) === "completed",
  ).length;
  const visibleRequests = requests.filter(
    (item) => filter === "all" || normalizeStatus(item.status) === filter,
  );

  return (
    <PageShell bottomNav={<BottomNav role="customer" />}>
      <div className="-mx-4 -mb-28 -mt-4 min-h-[100dvh] bg-primary pb-28">
        <header className="relative overflow-hidden px-4 pb-7 pt-5 text-primary-foreground">
          <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <Link
              to="/customer"
              aria-label="Back to customer home"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {loading ? (
              <Skeleton className="h-7 w-16 rounded-full bg-white/20" />
            ) : (
              <span className="rounded-full bg-white/12 px-3 py-1.5 text-[11px] text-primary-foreground/80">
                {requests.length} total
              </span>
            )}
          </div>

          <div className="relative mt-6">
            <p className="text-xs text-primary-foreground/65">Your hiring activity</p>
            <h1 className="customer-section-title mt-1 text-[1.85rem] leading-tight">
              {t("myRequests")}
            </h1>
            <p className="mt-2 max-w-[19rem] text-sm leading-5 text-primary-foreground/70">
              Track open jobs, applicants, assigned workers and completed work.
            </p>
          </div>

          {loading ? (
            <div className="relative mt-5 grid grid-cols-2 gap-2.5">
              <Skeleton className="h-[4.1rem] rounded-[1.25rem] bg-white/20" />
              <Skeleton className="h-[4.1rem] rounded-[1.25rem] bg-white/20" />
            </div>
          ) : (
            <div className="relative mt-5 grid grid-cols-2 gap-2.5">
              <StatusSummary icon={<Clock3 />} label="Active jobs" value={activeCount} />
              <StatusSummary icon={<CheckCircle2 />} label="Completed" value={completedCount} />
            </div>
          )}
        </header>

        <main className="mx-1.5 min-h-[65dvh] rounded-t-[2.5rem] bg-background px-4 pb-7 pt-5">
          <Link
            to="/customer/request"
            className="mb-4 flex items-center justify-between rounded-[1.4rem] bg-primary px-4 py-3.5 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/18">
                <Plus className="h-4 w-4" />
              </span>
              <span>
                <span className="customer-card-title block text-sm">Post a new job</span>
                <span className="mt-0.5 block text-[10px] text-primary-foreground/70">
                  Tell Anga what help you need
                </span>
              </span>
            </span>
          </Link>

          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(["all", "open", "assigned", "completed"] as const).map((item) => (
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
              <h2 className="customer-section-title text-base">Posted jobs</h2>
              <span className="text-xs text-muted-foreground">Latest first</span>
            </div>

            {loading ? (
              <CardListSkeleton count={4} />
            ) : visibleRequests.length ? (
              <div className="space-y-3">
                {visibleRequests.map((request) => (
                  <RequestCard key={request.id} item={request} onChanged={loadJobs} />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-primary/25 bg-primary/5 px-6 py-10 text-center">
                <BriefcaseBusiness className="mx-auto h-9 w-9 text-primary" />
                <p className="customer-card-title mt-3 text-sm">
                  No {filter === "all" ? "posted" : filter} jobs yet
                </p>
                <p className="mx-auto mt-1 max-w-56 text-xs leading-5 text-muted-foreground">
                  New posts and hiring updates will appear here.
                </p>
              </div>
            )}
          </section>
        </main>
      </div>
    </PageShell>
  );
}

function StatusSummary({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-[1.25rem] bg-white/12 p-3 backdrop-blur">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <span>
        <span className="customer-card-title block text-lg leading-none">{value}</span>
        <span className="mt-1 block text-[10px] text-primary-foreground/65">{label}</span>
      </span>
    </div>
  );
}

function RequestCard({ item, onChanged }: { item: RequestItem; onChanged: () => void }) {
  const { t, lang } = useT();
  const [action, setAction] = useState<"cancel" | "complete" | null>(null);
  const service = services.find((entry) => entry.slug === item.service);
  const Icon = service?.icon ?? BriefcaseBusiness;
  const status = normalizeStatus(item.status);
  const canCancel = item.apiBacked && status === "open";
  const canComplete = item.apiBacked && status === "assigned";

  const cancelJob = async () => {
    if (!canCancel || action) return;
    setAction("cancel");
    try {
      await api.cancelJob(item.id);
      toast.success(lang === "hi" ? "Kaam cancel ho gaya" : "Job cancelled");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel job");
    } finally {
      setAction(null);
    }
  };

  const completeJob = async () => {
    if (!canComplete || action) return;
    setAction("complete");
    try {
      await api.complete(item.id);
      toast.success(lang === "hi" ? "Kaam poora mark ho gaya" : "Job marked completed");
      onChanged();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete job");
    } finally {
      setAction(null);
    }
  };

  return (
    <article className="relative overflow-hidden rounded-[1.55rem] border border-white bg-gradient-to-br from-white via-white to-blue-50 p-3.5 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.6)]">
      <span className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-primary" />
      <div className="flex items-start gap-3">
        <span className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center rounded-[1.15rem] bg-blue-50 text-primary shadow-sm ring-1 ring-blue-100">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] text-primary">{service?.en || item.service}</p>
              <h3 className="customer-card-title mt-0.5 line-clamp-2 text-sm leading-snug">
                {item.title}
              </h3>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] capitalize ${statusClass(status)}`}
            >
              {item.status}
            </span>
          </div>
          <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
            {item.location} · {item.date || "Flexible"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-primary/10 pt-3">
        <span className="rounded-full bg-white px-2.5 py-1.5 text-[9px] text-primary shadow-sm">
          ₹{item.budget}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[9px] text-muted-foreground shadow-sm">
          <Users className="h-3 w-3" /> {item.applicants} {t("applicants")}
        </span>
        <Link
          to="/customer/applicants/$id"
          params={{ id: item.id }}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3 text-[10px] text-background"
        >
          <Eye className="h-3.5 w-3.5" /> View
        </Link>
        {canComplete && (
          <button
            type="button"
            onClick={completeJob}
            disabled={Boolean(action)}
            className="grid h-9 w-9 place-items-center rounded-full bg-success/10 text-success disabled:opacity-60"
            aria-label="Mark completed"
          >
            {action === "complete" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </button>
        )}
        {canCancel && (
          <button
            type="button"
            onClick={cancelJob}
            disabled={Boolean(action)}
            className="grid h-9 w-9 place-items-center rounded-full bg-destructive/10 text-destructive disabled:opacity-60"
            aria-label={t("cancelRequest")}
          >
            {action === "cancel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </article>
  );
}

function normalizeStatus(status: string) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function statusClass(status: string) {
  if (status === "open") return "bg-success/10 text-success";
  if (status === "assigned") return "bg-primary/10 text-primary";
  if (status === "completed") return "bg-muted text-muted-foreground";
  return "bg-destructive/10 text-destructive";
}
