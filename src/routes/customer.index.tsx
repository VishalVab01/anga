import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Plus } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { BottomNav } from "@/components/BottomNav";
import { useT } from "@/lib/i18n";
import { services } from "@/lib/data";
import { useState } from "react";

export const Route = createFileRoute("/customer/")({
  head: () => ({ meta: [{ title: "Anga — Book a service" }] }),
  component: CustomerHome,
});

function CustomerHome() {
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const list = services.filter((s) =>
    (lang === "hi" ? s.hi : s.en).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <PageShell bottomNav={<BottomNav role="customer" />}>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {t("greeting")}
          </p>
          <h1 className="text-2xl font-extrabold">{t("whatService")}</h1>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("selectService")}
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
        </div>

        <Link
          to="/customer/request"
          className="card-soft card-soft-hover flex items-center gap-4 bg-primary/5 p-5"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Plus className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-bold">{t("newRequest")}</div>
            <div className="text-xs text-muted-foreground">{t("postJob")}</div>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.map((s) => {
            const Icon = s.icon;

            return (
              <Link
                key={s.slug}
                to="/customer/service/$slug"
                params={{ slug: s.slug }}
                className="card-soft card-soft-hover flex flex-col items-center gap-2 p-5 text-center"
              >
                <Icon className="h-10 w-10 text-primary" />

                <span className="text-sm font-bold leading-tight">
                  {lang === "hi" ? s.hi : s.en}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
