import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { BottomNav } from "@/components/BottomNav";
import { jobs, services } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/worker/applications")({
  head: () => ({ meta: [{ title: "Anga - My Applications" }] }),
  component: Applications,
});

function Applications() {
  const { t } = useT();
  const statuses = ["Pending", "Accepted", "Pending"];
  return (
    <PageShell title={t("myApps")} back="/worker" bottomNav={<BottomNav role="worker" />}>
      <div className="space-y-3">
        {jobs.slice(0, 3).map((j, i) => {
          const svc = services.find((s) => s.slug === j.service);
          const st = statuses[i];
          return (
            <Link
              key={j.id}
              to="/worker/job/$id"
              params={{ id: j.id }}
              className="card-soft card-soft-hover flex items-center gap-3 p-4"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-2xl">
                {svc?.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bold">{j.title}</h3>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {j.location}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  st === "Accepted" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {st}
              </span>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
