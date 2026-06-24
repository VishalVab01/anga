import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { services } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/customer/service/$slug")({
  head: () => ({ meta: [{ title: "Anga - Book service" }] }),
  component: BookService,
});

function BookService() {
  const { slug } = Route.useParams();
  const { t, lang } = useT();
  const navigate = useNavigate();
  const svc = services.find((s) => s.slug === slug);
  if (!svc) return <PageShell title="Not found" back="/customer"><p>Service not found</p></PageShell>;

  return (
    <PageShell title={lang === "hi" ? svc.hi : svc.en} back="/customer">
      <div className="space-y-5">
        <div className="card-soft flex flex-col items-center gap-2 p-8 text-center">
          <span className="text-6xl">{svc.emoji}</span>
          <h2 className="text-2xl font-extrabold">{lang === "hi" ? svc.hi : svc.en}</h2>
          <p className="text-sm text-muted-foreground">Starting from ₹299</p>
        </div>

        <ul className="card-soft divide-y divide-border">
          {["Verified workers", "On-time service", "Cash or UPI"].map((f) => (
            <li key={f} className="px-4 py-3 text-sm">✓ {f}</li>
          ))}
        </ul>

        <button onClick={() => navigate({ to: "/customer/request" })} className="btn-primary w-full text-lg">
          {t("bookNow")}
        </button>
      </div>
    </PageShell>
  );
}
