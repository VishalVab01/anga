import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NotificationListSkeleton } from "@/components/AppLoadingSkeletons";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { api, type ApiNotification } from "@/lib/api";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/customer/notifications")({
  head: () => ({ meta: [{ title: "Anga - Notifications" }] }),
  component: Notifications,
});

function Notifications() {
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
      toast.success(
        lang === "hi" ? "Sabhi notifications padh liye gaye" : "Notifications marked read",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update notifications");
    } finally {
      setMarking(false);
    }
  };

  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <PageShell bottomNav={<BottomNav role="customer" />}>
      <div className="-mx-4 -mb-28 -mt-4 min-h-[100dvh] bg-primary pb-28">
        <header className="relative overflow-hidden px-4 pb-8 pt-5 text-primary-foreground">
          <span className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <Link
              to="/customer"
              aria-label="Back to customer home"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="rounded-full bg-white/12 px-3 py-1.5 text-[11px] text-primary-foreground/80">
              {unreadCount} unread
            </span>
          </div>
          <div className="relative mt-6">
            <p className="text-xs text-primary-foreground/65">Hiring updates</p>
            <h1 className="customer-section-title mt-1 text-[1.85rem] leading-tight">
              {t("notifications")}
            </h1>
            <p className="mt-2 max-w-[19rem] text-sm leading-5 text-primary-foreground/70">
              Applications, assignments and important job activity appear here.
            </p>
          </div>
        </header>

        <main className="mx-1.5 min-h-[70dvh] rounded-t-[2.5rem] bg-background px-4 pb-7 pt-5">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              disabled={marking}
              className="mb-4 ml-auto flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2.5 text-xs text-primary disabled:opacity-60"
            >
              {marking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {lang === "hi" ? "Sabhi padhein" : "Mark all read"}
            </button>
          )}

          {loading && <NotificationListSkeleton />}
          {!loading && items.length === 0 && (
            <div className="rounded-[1.75rem] border border-dashed border-primary/25 bg-primary/5 px-6 py-10 text-center">
              <Bell className="mx-auto h-9 w-9 text-primary" />
              <p className="customer-card-title mt-3 text-sm">{t("noNotifications")}</p>
            </div>
          )}
          <div className="space-y-3">
            {items.map((item) => {
              const Icon = item.type === "application" ? CheckCircle2 : Bell;
              return (
                <article
                  key={item._id}
                  className={`relative flex items-start gap-3 overflow-hidden rounded-[1.45rem] border border-white bg-gradient-to-br from-white via-white to-blue-50 p-4 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.6)] ${
                    item.read ? "opacity-75" : ""
                  }`}
                >
                  {!item.read && (
                    <span className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-primary" />
                  )}
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="customer-card-title truncate text-sm">{item.title}</span>
                      <span className="shrink-0 text-[9px] text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString(
                          lang === "hi" ? "hi-IN" : "en-IN",
                        )}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {item.message}
                    </span>
                  </span>
                  {!item.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </PageShell>
  );
}
