import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
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
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return (
      <PageShell title="Not found" back="/customer">
        <p>Service not found</p>
      </PageShell>
    );
  }

  const Icon = service.icon;
  const label = lang === "hi" ? service.hi : service.en;

  return (
    <PageShell bottomNav={<BottomNav role="customer" />}>
      <div className="-mx-4 -mb-28 -mt-4 min-h-[100dvh] bg-primary pb-28">
        <header className="relative overflow-hidden px-4 pb-8 pt-5 text-primary-foreground">
          <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <Link
              to="/customer"
              aria-label="Back"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <p className="customer-section-title text-sm">Service details</p>
            <span className="h-11 w-11" aria-hidden="true" />
          </div>

          <div className="relative mt-7 flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.35rem] bg-white text-primary shadow-xl shadow-blue-950/20">
              <Icon className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-primary-foreground/65">Trusted local professionals</p>
              <h1 className="customer-section-title mt-1 text-[1.65rem] leading-tight">{label}</h1>
              <p className="mt-2 flex items-center gap-1 text-xs text-primary-foreground/70">
                <MapPin className="h-3.5 w-3.5" /> Available near your location
              </p>
            </div>
          </div>

          <div className="relative mt-5 flex flex-wrap gap-2 text-[10px]">
            <HeroPill icon={<BadgeCheck />} text="Verified workers" />
            <HeroPill icon={<CalendarClock />} text="Flexible timing" />
            <HeroPill icon={<Wallet />} text="Clear wages" />
          </div>
        </header>

        <main className="mx-1.5 min-h-[70dvh] rounded-t-[2.5rem] bg-background px-4 pb-7 pt-5">
          <section className="grid grid-cols-3 gap-2.5">
            <QuickFact icon={<Wallet />} label="Starting wage" value="₹299" />
            <QuickFact icon={<CalendarClock />} label="Availability" value="Today" />
            <QuickFact icon={<ShieldCheck />} label="Trust" value="Verified" />
          </section>

          <section className="mt-5 rounded-[1.65rem] bg-card p-4 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.55)]">
            <h2 className="customer-section-title text-base">What you get</h2>
            <div className="mt-3 space-y-2.5">
              {[
                "Nearby professionals matched to your request",
                "Ratings, experience and expected wage before hiring",
                "Direct call and assignment after comparing profiles",
                "Clear job status and applicant tracking in Anga",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2.5 rounded-[1.1rem] bg-primary/5 px-3 py-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-sm leading-5">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-4 rounded-[1.65rem] bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 shadow-sm">
            <p className="text-[10px] text-primary">How it works</p>
            <h2 className="customer-section-title mt-1 text-base">
              Post once, compare confidently
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {["Describe work", "Review matches", "Hire safely"].map((step, index) => (
                <div key={step} className="rounded-[1.1rem] bg-white p-3 shadow-sm">
                  <span className="mx-auto grid h-7 w-7 place-items-center rounded-full bg-primary text-[10px] text-white">
                    {index + 1}
                  </span>
                  <p className="mt-2 text-[10px] leading-4 text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </section>

          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem("anga.customerSelectedService", service.slug);
              navigate({ to: "/customer/request" });
            }}
            className="btn-primary mt-5 min-h-14 w-full text-base"
          >
            {t("bookNow")}
          </button>
        </main>
      </div>
    </PageShell>
  );
}

function HeroPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-2 backdrop-blur [&>svg]:h-3.5 [&>svg]:w-3.5">
      {icon} {text}
    </span>
  );
}

function QuickFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.25rem] bg-card p-3 text-center shadow-sm">
      <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <p className="mt-2 text-[9px] text-muted-foreground">{label}</p>
      <p className="customer-card-title mt-1 truncate text-xs">{value}</p>
    </div>
  );
}
