import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin, Star, Briefcase, Bell } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { BottomNav } from "@/components/BottomNav";
import { useT, type Lang } from "@/lib/i18n";
import { services, jobs } from "@/lib/data";
import { useState } from "react";

export const Route = createFileRoute("/worker/")({
  head: () => ({ meta: [{ title: "Anga - Worker home" }] }),
  component: WorkerHome,
});

function WorkerHome() {
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <PageShell bottomNav={<BottomNav role="worker" />}>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Namaste 👋</p>
          <h1 className="text-2xl font-extrabold">{t("findWork")}</h1>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Link to="/worker/applications" className="card-soft flex flex-col items-center gap-1.5 p-3 text-center">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xs font-semibold">{t("myApps")}</span>
          </Link>
          <Link to="/worker/notifications" className="card-soft flex flex-col items-center gap-1.5 p-3 text-center">
            <Bell className="h-6 w-6 text-primary" />
            <span className="text-xs font-semibold">{t("notifications")}</span>
          </Link>
          <Link to="/worker/profile" className="card-soft flex flex-col items-center gap-1.5 p-3 text-center">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xs font-semibold">{t("nearby")}</span>
          </Link>
        </div>

        <div>
          <h2 className="mb-3 text-base font-bold">Categories</h2>
          <div className="grid grid-cols-4 gap-3">
            {services.map((s) => (
              <button
                key={s.slug}
                onClick={() => setQ(s.en)}
                className="card-soft card-soft-hover flex flex-col items-center gap-1.5 p-3"
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-[11px] font-semibold leading-tight text-center">
                  {lang === "hi" ? s.hi : s.en}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-base font-bold">{t("nearby")}</h2>
          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
                No jobs found
              </p>
            )}
            {filtered.map((j) => (
              <JobCard key={j.id} job={j} lang={lang} />
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function JobCard({ job, lang }: { job: typeof jobs[number]; lang: Lang }) {
  const svc = services.find((s) => s.slug === job.service);
  return (
    <Link
      to="/worker/job/$id"
      params={{ id: job.id }}
      className="card-soft card-soft-hover block p-4"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-2xl">
          {svc?.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold">{job.title}</h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {job.location}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-primary">₹{job.payment}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-current text-amber-500" /> {job.rating}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 text-right">
        <span className="btn-primary px-4 py-1.5 text-sm">{lang === "hi" ? "आवेदन करें" : "Apply"}</span>
      </div>
    </Link>
  );
}
