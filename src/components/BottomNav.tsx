import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Briefcase, Bell, User, ClipboardList } from "lucide-react";
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
          { to: "/worker/notifications", icon: Bell, label: t("notifications") },
          { to: "/worker/profile", icon: User, label: t("profile") },
        ]
      : [
          { to: "/customer", icon: Home, label: t("home") },
          { to: "/customer/my-requests", icon: ClipboardList, label: t("requests") },
          { to: "/customer/notifications", icon: Bell, label: t("notifications") },
          { to: "/customer/profile", icon: User, label: t("profile") },
        ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-6 w-6 ${active ? "stroke-[2.5]" : ""}`} />
              <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
