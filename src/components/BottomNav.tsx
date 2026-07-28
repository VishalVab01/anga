import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Briefcase, Bell, User, ClipboardList, Bot } from "lucide-react";
import { useT } from "@/lib/i18n";

type Item = { to: string; icon: React.ComponentType<{ className?: string }>; label: string };

export function BottomNav({ role }: { role: "worker" | "customer" }) {
  const { t } = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items: Item[] =
    role === "worker"
      ? [
          { to: "/worker", icon: Home, label: t("home") },
          { to: "/worker/applications", icon: Briefcase, label: t("jobs") },
          { to: "/assistant", icon: Bot, label: t("assistant") },
          { to: "/worker/notifications", icon: Bell, label: t("notifications") },
          { to: "/worker/profile", icon: User, label: t("profile") },
        ]
      : [
          { to: "/customer", icon: Home, label: t("home") },
          { to: "/customer/my-requests", icon: ClipboardList, label: t("requests") },
          { to: "/assistant", icon: Bot, label: t("assistant") },
          { to: "/customer/notifications", icon: Bell, label: t("notifications") },
          { to: "/customer/profile", icon: User, label: t("profile") },
        ];

  return (
    <nav className="fixed bottom-[max(0.65rem,env(safe-area-inset-bottom))] left-1/2 z-40 w-[calc(100%-2.25rem)] max-w-[25.5rem] -translate-x-1/2 overflow-hidden rounded-[2rem] border border-border bg-card/95 shadow-[0_14px_38px_-16px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="flex items-stretch justify-around px-1.5 py-1">
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-[1.25rem] py-1.5 text-[11px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-[1.35rem] w-[1.35rem] ${active ? "stroke-[2.5]" : ""}`} />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
