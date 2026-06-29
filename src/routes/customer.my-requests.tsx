import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
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

  useEffect(() => {
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
          <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
            {lang === "hi" ? "अभी कोई काम पोस्ट नहीं किया" : "No requests yet"}
          </p>
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
}: {
  id: string;
  title: string;
  service: string;
  date: string;
  location: string;
  budget: number;
  status: string;
  applicants: number;
}) {
  const { t } = useT();
  const svc = services.find((item) => item.slug === service);
  const Icon = svc?.icon;
  return (
    <div className="card-soft p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {location} · {date} · ₹{budget}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
          {status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button onClick={() => toast("Edit coming soon")} className="btn-outline px-2 py-2 text-xs">
          {t("editRequest")}
        </button>
        <button
          onClick={() => toast.success("Cancelled")}
          className="btn-outline px-2 py-2 text-xs"
        >
          {t("cancelRequest")}
        </button>
        <Link
          to="/customer/applicants/$id"
          params={{ id }}
          className="btn-primary px-2 py-2 text-xs"
        >
          {t("viewApplicants")} ({applicants})
        </Link>
      </div>
    </div>
  );
}
