import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Eye, Loader2, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { api, type ApiJob } from "@/lib/api";
import { seedRequests, services } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/customer/my-requests")({
  head: () => ({ meta: [{ title: "Anga - My Posted Jobs" }] }),
  component: MyRequests,
});

function MyRequests() {
  const { t, lang } = useT();
  const [apiJobs, setApiJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

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

  const demoRequests = loadFailed ? seedRequests : [];
  const hasRequests = apiJobs.length > 0 || demoRequests.length > 0;

  return (
    <PageShell title={t("myRequests")} back="/customer" bottomNav={<BottomNav role="customer" />}>
      <div className="space-y-3">
        {loading && (
          <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
            Loading requests...
          </p>
        )}
        {!loading && !hasRequests && (
          <div className="rounded-[1.5rem] border border-dashed border-primary/25 bg-card p-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground">
              {lang === "hi" ? "अभी कोई काम पोस्ट नहीं किया" : "No requests yet"}
            </p>
            <Link to="/customer/request" className="btn-primary mt-4">
              {t("postJob")}
            </Link>
          </div>
        )}
        {apiJobs.length > 0
          ? apiJobs.map((job) => (
              <RequestCard
                key={job._id}
                id={job._id}
                title={job.title}
                service={job.category}
                date={[job.date, job.time].filter(Boolean).join(", ")}
                location={job.location}
                budget={job.wage}
                status={job.status}
                applicants={job.applicants.length}
                apiBacked
                onChanged={loadJobs}
              />
            ))
          : demoRequests.map((request) => (
              <RequestCard
                key={request.id}
                id={request.id}
                title={request.title[lang]}
                service={request.service}
                date={request.date[lang]}
                location={request.location[lang]}
                budget={request.budget}
                status={request.status[lang]}
                applicants={request.applicants}
              />
            ))}
      </div>
    </PageShell>
  );
}

function RequestCard({
  id,
  title,
  service,
  date,
  location,
  budget,
  status,
  applicants,
  apiBacked = false,
  onChanged,
}: {
  id: string;
  title: string;
  service: string;
  date: string;
  location: string;
  budget: number;
  status: string;
  applicants: number;
  apiBacked?: boolean;
  onChanged?: () => void;
}) {
  const { t, lang } = useT();
  const [action, setAction] = useState<"cancel" | "complete" | null>(null);
  const svc = services.find((item) => item.slug === service);
  const Icon = svc?.icon;
  const normalizedStatus = status.toLowerCase();
  const canCancel = apiBacked && normalizedStatus === "open";
  const canComplete = apiBacked && normalizedStatus === "assigned";

  const cancelJob = async () => {
    if (!canCancel || action) return;
    setAction("cancel");
    try {
      await api.cancelJob(id);
      toast.success(lang === "hi" ? "काम कैंसल हो गया" : "Job cancelled");
      onChanged?.();
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
      await api.complete(id);
      toast.success(lang === "hi" ? "काम पूरा मार्क हो गया" : "Job marked completed");
      onChanged?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete job");
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="card-soft card-soft-hover overflow-hidden p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-extrabold leading-tight">{title}</h3>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                normalizedStatus === "open"
                  ? "bg-success/10 text-success"
                  : normalizedStatus === "assigned"
                    ? "bg-primary/10 text-primary"
                    : normalizedStatus === "completed"
                      ? "bg-muted text-muted-foreground"
                      : "bg-destructive/10 text-destructive"
              }`}
            >
              {status}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">
            {location} · {date || "Flexible"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
              ₹{budget}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {applicants} {t("applicants")}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto_auto] gap-2">
        <Link
          to="/customer/applicants/$id"
          params={{ id }}
          className="btn-primary justify-center px-2 py-2 text-xs"
        >
          <Eye className="h-4 w-4" />
          {t("viewApplicants")}
        </Link>
        {canComplete && (
          <button
            type="button"
            onClick={completeJob}
            disabled={Boolean(action)}
            className="grid h-10 w-10 place-items-center rounded-2xl bg-success/10 text-success disabled:opacity-60"
            aria-label={lang === "hi" ? "काम पूरा करें" : "Mark completed"}
          >
            {action === "complete" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={cancelJob}
          disabled={!canCancel || Boolean(action)}
          className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card text-destructive disabled:text-muted-foreground disabled:opacity-60"
          aria-label={t("cancelRequest")}
        >
          {action === "cancel" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
