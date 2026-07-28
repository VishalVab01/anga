import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  Bot,
  ClipboardList,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CustomerWorkerMatchesSkeleton } from "@/components/AppLoadingSkeletons";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { api, type ApiNotification, type ApiWorkerProfile } from "@/lib/api";
import { serviceName, services, workers } from "@/lib/data";
import { useT, type Lang } from "@/lib/i18n";
import { getProfile } from "@/lib/session";

export const Route = createFileRoute("/customer/")({
  head: () => ({ meta: [{ title: "Anga - Hire local workers" }] }),
  component: CustomerHome,
});

type WorkerCardData = {
  id: string;
  name: string;
  phone: string;
  skill: string;
  area: string;
  distanceKm: number;
  rating: number;
  experience: string;
  expectedWage: number;
  verified: boolean;
  documentUploaded: boolean;
  availableToday: boolean;
  completedJobs: number;
};

function CustomerHome() {
  const { t, lang } = useT();
  const [query, setQuery] = useState("");
  const [apiWorkers, setApiWorkers] = useState<ApiWorkerProfile[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  useEffect(() => {
    setProfile(getProfile("customer"));
    let cancelled = false;

    void Promise.allSettled([api.workers("?availableToday=true"), api.notifications()]).then(
      ([workerResult, notificationResult]) => {
        if (cancelled) return;
        if (workerResult.status === "fulfilled") setApiWorkers(workerResult.value.workers);
        if (notificationResult.status === "fulfilled") {
          setNotifications(notificationResult.value.notifications);
        }
        setLoadingWorkers(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const trustedWorkers = useMemo(() => {
    const live = apiWorkers.map(mapApiWorker);
    const fallback = workers.map((worker) => ({
      id: worker.id,
      name: worker.name,
      phone: worker.phone,
      skill: worker.skill,
      area: worker.area,
      distanceKm: worker.distanceKm,
      rating: worker.rating,
      experience: worker.experience,
      expectedWage: worker.expectedWage,
      verified: worker.verified,
      documentUploaded: worker.documentUploaded,
      availableToday: worker.availableToday,
      completedJobs: worker.completedJobs,
    }));
    return live.length ? live : fallback.filter((worker) => worker.availableToday);
  }, [apiWorkers]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleServices = services.filter((service) => {
    if (!normalizedQuery) return true;
    return `${service.en} ${service.hi}`.toLowerCase().includes(normalizedQuery);
  });
  const visibleWorkers = trustedWorkers.filter((worker) => {
    if (!normalizedQuery) return true;
    return `${worker.name} ${worker.area} ${serviceName(worker.skill, lang)}`
      .toLowerCase()
      .includes(normalizedQuery);
  });
  const recommendedWorkers = visibleWorkers.slice(0, 5);
  const popularWorkers = (
    visibleWorkers.length > 4 ? visibleWorkers.slice(4, 8) : visibleWorkers
  ).slice(0, 4);
  const customerName = String(profile?.name || "Demo Customer");
  const customerAddress = String(profile?.address || profile?.location || "Add hiring location");
  const hasUnreadNotifications = notifications.some((item) => !item.read);

  return (
    <PageShell bottomNav={<BottomNav role="customer" />}>
      <div className="customer-home-screen -mx-4 -mb-28 -mt-4 min-h-[100dvh] overflow-hidden bg-primary pb-28">
        <header className="relative z-20 bg-primary px-4 pb-5 pt-5 text-primary-foreground">
          <span className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="customer-profile-name truncate text-base leading-tight">
                Hi, {customerName}
              </h1>
              <Link
                to="/customer/profile"
                className="mt-1 flex max-w-[13rem] items-center gap-1 text-[11px] text-primary-foreground/70"
              >
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{customerAddress}</span>
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/customer/my-requests"
                aria-label={t("myRequests")}
                className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
              >
                <ClipboardList className="h-5 w-5" />
              </Link>
              <Link
                to="/customer/notifications"
                aria-label={t("notifications")}
                className="relative grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25"
              >
                <Bell className="h-5 w-5" />
                {hasUnreadNotifications && (
                  <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-accent" />
                )}
              </Link>
            </div>
          </div>
        </header>

        <main className="customer-content relative z-10 mx-1.5 min-h-[78dvh] space-y-5 rounded-[2.5rem] bg-background pb-6 pt-4">
          <section className="relative mx-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-white to-blue-100 p-4 text-foreground shadow-xl shadow-blue-950/15">
            <span className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-violet-300/25 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
            <p className="customer-hero-copy relative max-w-[18rem] text-[1.75rem] leading-[1.08] tracking-[-0.045em]">
              Find <span className="text-primary">trusted help</span> for every task around you
            </p>
            <p className="relative mt-2 max-w-[17rem] text-xs leading-5 text-muted-foreground">
              Compare verified local workers by skill, rating, wage and availability.
            </p>

            <div className="relative mt-5 flex items-center gap-2.5">
              <div className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-full bg-card p-0.5 pr-3 shadow-lg shadow-primary/10">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <Search className="h-[18px] w-[18px]" />
                </span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search a service or worker"
                  aria-label="Search services and workers"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Link
                to="/customer/request"
                aria-label={t("postJob")}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20"
              >
                <Plus className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </section>

          <section className="px-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="customer-section-title text-base">Popular services</h2>
              {query && (
                <button type="button" onClick={() => setQuery("")} className="text-xs text-primary">
                  Clear
                </button>
              )}
            </div>
            {visibleServices.length ? (
              <div className="grid grid-cols-4 gap-2">
                {visibleServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Link
                      key={service.slug}
                      to="/customer/service/$slug"
                      params={{ slug: service.slug }}
                      className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-[1.15rem] bg-card px-1.5 py-2 text-center shadow-sm transition active:scale-[0.98]"
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="line-clamp-2 text-[9px] leading-3 text-muted-foreground">
                        {lang === "hi" ? service.hi : service.en}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl bg-muted p-5 text-center text-xs text-muted-foreground">
                No service matches that search.
              </p>
            )}
          </section>

          <section className="grid grid-cols-2 gap-3 px-4">
            <Link
              to="/customer/request"
              className="group flex min-h-[7.2rem] flex-col justify-between rounded-[1.45rem] bg-primary p-4 text-primary-foreground shadow-lg shadow-primary/20 transition active:scale-[0.98]"
            >
              <span className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/18">
                  <Plus className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-primary-foreground/55 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span>
                <span className="customer-card-title block text-sm leading-5">Post a job</span>
                <span className="mt-0.5 block text-[10px] leading-4 text-primary-foreground/70">
                  Get matching workers
                </span>
              </span>
            </Link>
            <Link
              to="/assistant"
              className="group flex min-h-[7.2rem] flex-col justify-between rounded-[1.45rem] border border-primary/10 bg-gradient-to-br from-indigo-50 to-violet-100 p-4 text-foreground shadow-sm transition active:scale-[0.98]"
            >
              <span className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-primary shadow-sm">
                  <Bot className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-primary/45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span>
                <span className="customer-card-title block text-sm leading-5">Ask Anga AI</span>
                <span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">
                  Describe what you need
                </span>
              </span>
            </Link>
          </section>

          {loadingWorkers ? (
            <CustomerWorkerMatchesSkeleton />
          ) : (
            <>
              <section className="px-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="customer-section-title text-base">Recommended for you</h2>
                  <span className="text-xs text-primary">{visibleWorkers.length} available</span>
                </div>
                {recommendedWorkers.length ? (
                  <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {recommendedWorkers.map((worker) => (
                      <RecommendedWorkerCard key={worker.id} worker={worker} lang={lang} />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-muted p-6 text-center text-xs text-muted-foreground">
                    No workers match your search.
                  </p>
                )}
              </section>

              {popularWorkers.length > 0 && (
                <section className="px-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="customer-section-title text-base">Popular workers nearby</h2>
                    <Link to="/customer/request" className="text-xs text-primary">
                      Post job
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {popularWorkers.map((worker) => (
                      <PopularWorkerCard key={worker.id} worker={worker} lang={lang} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          <section className="mx-4 grid grid-cols-3 gap-2 rounded-[1.6rem] bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 shadow-sm">
            <TrustItem icon={<ShieldCheck />} label="Verified" />
            <TrustItem icon={<Wallet />} label="Clear wages" />
            <TrustItem icon={<Users />} label="Local help" />
          </section>
        </main>
      </div>
    </PageShell>
  );
}

function RecommendedWorkerCard({ worker, lang }: { worker: WorkerCardData; lang: Lang }) {
  const service = services.find((item) => item.slug === worker.skill);
  const Icon = service?.icon ?? Users;

  return (
    <Link
      to="/customer/worker/$id"
      params={{ id: worker.id }}
      className="group relative flex min-h-[12.5rem] w-[68%] shrink-0 snap-start flex-col overflow-hidden rounded-[1.45rem] bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100 p-3.5 text-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5"
    >
      <span className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
      <div className="relative flex items-start justify-between gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/85 text-primary shadow-sm">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1.5 text-[9px] text-amber-600">
          <Star className="h-3 w-3 fill-current" /> {worker.rating}
        </span>
      </div>

      <div className="relative mt-3">
        <p className="text-[10px] text-primary">{serviceName(worker.skill, lang)}</p>
        <h3 className="customer-card-title mt-0.5 truncate text-base">{worker.name}</h3>
        <p className="mt-1.5 flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {worker.area} · {worker.distanceKm} km
          </span>
        </p>
      </div>

      <div className="relative mt-3 flex gap-1.5 text-[9px]">
        <span className="rounded-full bg-white/75 px-2 py-1 text-primary">
          ₹{worker.expectedWage}
        </span>
        <span className="min-w-0 truncate rounded-full bg-white/75 px-2 py-1 text-muted-foreground">
          {worker.experience}
        </span>
      </div>

      <div className="relative mt-auto flex items-center justify-between gap-2 pt-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-2.5 py-1.5 text-[9px] text-success shadow-sm">
          <ShieldCheck className="h-3 w-3" /> Verified worker
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function PopularWorkerCard({ worker, lang }: { worker: WorkerCardData; lang: Lang }) {
  const service = services.find((item) => item.slug === worker.skill);
  const Icon = service?.icon ?? Users;

  return (
    <Link
      to="/customer/worker/$id"
      params={{ id: worker.id }}
      className="group relative flex items-center gap-3 overflow-hidden rounded-[1.55rem] border border-white bg-gradient-to-br from-white via-white to-blue-50 p-3.5 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5"
    >
      <span className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-primary" />
      <span className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center rounded-[1.15rem] bg-blue-50 text-primary shadow-sm ring-1 ring-blue-100">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[9px] text-primary">{serviceName(worker.skill, lang)}</span>
        <span className="customer-card-title mt-0.5 block truncate text-sm">{worker.name}</span>
        <span className="mt-1 flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{worker.area}</span>
        </span>
        <span className="mt-2 flex gap-1.5 text-[9px]">
          <span className="rounded-full bg-white px-2 py-1 text-success shadow-sm">Verified</span>
          <span className="rounded-full bg-white px-2 py-1 text-primary shadow-sm">
            ₹{worker.expectedWage}
          </span>
          <span className="rounded-full bg-white px-2 py-1 text-amber-600 shadow-sm">
            ★ {worker.rating}
          </span>
        </span>
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-background transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center text-[9px] text-muted-foreground">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-primary shadow-sm [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>
      {label}
    </div>
  );
}

function mapApiWorker(worker: ApiWorkerProfile): WorkerCardData {
  return {
    id: worker.userId,
    name: worker.name,
    phone: worker.phone,
    skill: worker.skills[0] || "electrician",
    area: worker.location || "Nearby",
    distanceKm: 2.5,
    rating: worker.rating,
    experience: worker.experience,
    expectedWage: worker.expectedWage,
    verified: worker.verified,
    documentUploaded: worker.documentsUploaded,
    availableToday: worker.availableToday,
    completedJobs: worker.totalJobsCompleted,
  };
}
