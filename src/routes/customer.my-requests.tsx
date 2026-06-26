import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { BottomNav } from "@/components/BottomNav";
import { useT } from "@/lib/i18n";
import { seedRequests, services } from "@/lib/data";
import { useState } from "react";

export const Route = createFileRoute("/customer/my-requests")({
  head: () => ({ meta: [{ title: "Anga — My Requests" }] }),
  component: MyRequests,
});

function MyRequests() {
  const { t, lang } = useT();
  const [list, setList] = useState(seedRequests);

  return (
    <PageShell title={t("myRequests")} back="/customer" bottomNav={<BottomNav role="customer" />}>
      <div className="space-y-3">
        {list.length === 0 && (
          <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
            No requests yet
          </p>
        )}
        {list.map((r) => {
          const svc = services.find((s) => s.slug === r.service);
          const Icon = svc?.icon;
          return (
            <div key={r.id} className="card-soft p-4">
              <div className="flex items-start gap-3">
                
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10">
                  {Icon && <Icon className="h-6 w-6 text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold">{lang === "hi" ? svc?.hi : svc?.en}</h3>
                  <p className="text-xs text-muted-foreground">{r.date[lang]}</p>
                  {r.worker && <p className="mt-0.5 text-xs">👷 {r.worker}</p>}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    r.status[lang] === "Open"
                      ? "bg-accent/15 text-accent"
                      : r.status[lang] === "Assigned"
                      ? "bg-success/15 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {r.status[lang]}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button onClick={() => toast("Edit coming soon")} className="btn-outline px-2 py-2 text-xs">
                  {t("editRequest")}
                </button>
                <button
                  onClick={() => {
                    setList((p) => p.filter((x) => x.id !== r.id));
                    toast.success("Cancelled");
                  }}
                  className="btn-outline px-2 py-2 text-xs"
                >
                  {t("cancelRequest")}
                </button>
                <button onClick={() => toast(`${r.applicants} applicants`)} className="btn-primary px-2 py-2 text-xs">
                  {t("viewApplicants")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
