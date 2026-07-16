import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { api, type ApiNotification } from "@/lib/api";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/worker/notifications")({
  head: () => ({ meta: [{ title: "Anga - Notifications" }] }),
  component: Notifs,
});

function Notifs() {
  const { t, lang } = useT();
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    api
      .notifications()
      .then((result) => setItems(result.notifications))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    if (marking || items.every((item) => item.read)) return;
    setMarking(true);
    try {
      await api.markNotificationsRead();
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      toast.success(lang === "hi" ? "सभी नोटिफिकेशन पढ़े गए" : "Notifications marked read");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update notifications");
    } finally {
      setMarking(false);
    }
  };

  return (
    <PageShell title={t("notifications")} back="/worker" bottomNav={<BottomNav role="worker" />}>
      <div className="space-y-3">
        {items.some((item) => !item.read) && (
          <button
            type="button"
            onClick={markAllRead}
            disabled={marking}
            className="ml-auto flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold text-primary disabled:opacity-60"
          >
            {marking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {lang === "hi" ? "सभी पढ़ें" : "Mark all read"}
          </button>
        )}
        {loading && (
          <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
            Loading notifications...
          </p>
        )}
        {!loading && items.length === 0 && (
          <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
            {t("noNotifications")}
          </p>
        )}
        {items.map((item) => {
          const Icon = item.type === "assigned" || item.type === "completed" ? CheckCircle2 : Bell;
          return (
            <div
              key={item._id}
              className={`card-soft flex items-start gap-3 p-4 ${
                item.read ? "opacity-75" : "ring-1 ring-primary/15"
              }`}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="truncate font-bold">{item.title}</h3>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{item.message}</p>
              </div>
              {!item.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
