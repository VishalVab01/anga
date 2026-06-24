import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { BottomNav } from "@/components/BottomNav";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/customer/notifications")({
  head: () => ({ meta: [{ title: "Rozgaar — Notifications" }] }),
  component: Notifs,
});

const items = [
  { icon: CheckCircle2, title: "Worker assigned", desc: "Suresh accepted your electrician request.", time: "1h" },
  { icon: Bell, title: "Reminder", desc: "Rate your last service.", time: "3h" },
];

function Notifs() {
  const { t } = useT();
  return (
    <PageShell title={t("notifications")} back="/customer" bottomNav={<BottomNav role="customer" />}>
      <div className="space-y-3">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div key={i} className="card-soft flex items-start gap-3 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="truncate font-bold">{it.title}</h3>
                  <span className="shrink-0 text-xs text-muted-foreground">{it.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{it.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
