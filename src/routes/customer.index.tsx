import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, MapPin, Plus, Search, ShieldCheck, Star, Users, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { api, type ApiWorkerProfile } from "@/lib/api";
import { serviceName, services, workers } from "@/lib/data";
import { useT, type Lang } from "@/lib/i18n";

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
  const [q, setQ] = useState("");
  const [apiWorkers, setApiWorkers] = useState<ApiWorkerProfile[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const list = services.filter((service) =>
    (lang === "hi" ? service.hi : service.en).toLowerCase().includes(q.toLowerCase()),
  );

  useEffect(() => {
    api
      .workers("?availableToday=true")
      .then((result) => setApiWorkers(result.workers))
      .catch(() => setApiWorkers([]))
      .finally(() => setLoadingWorkers(false));
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

  return (
    <PageShell bottomNav={<BottomNav role="customer" />}>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] bg-primary p-5 text-primary-foreground shadow-xl shadow-primary/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-primary-foreground/75">{t("greeting")}</p>
              <h1 className="mt-1 text-3xl font-black leading-tight tracking-normal">
                {t("whatService")}
              </h1>
            </div>
            <Link
              to="/customer/my-requests"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 text-primary-foreground"
              aria-label={t("myRequests")}
            >
              <Users className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-full bg-white p-2 pl-4 text-foreground shadow-lg shadow-primary/20">
            <Search className="h-5 w-5 shrink-0 text-primary" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder={t("selectService")}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
            />
            <Link
              to="/customer/request"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
              aria-label={t("postJob")}
            >
              <Plus className="h-5 w-5" />
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/customer/request"
            className="card-soft card-soft-hover flex items-center gap-3 bg-primary/5 p-4"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold">{t("newRequest")}</div>
              <div className="text-xs text-muted-foreground">{t("postJob")}</div>
            </div>
          </Link>
          <Link to="/assistant" className="card-soft card-soft-hover flex items-center gap-3 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold">{t("assistant")}</div>
              <div className="text-xs text-muted-foreground">Hindi / English</div>
            </div>
          </Link>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-extrabold">
              {lang === "hi" ? "काम की कैटेगरी" : "Job categories"}
            </h2>
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="text-xs font-bold text-primary"
              >
                {lang === "hi" ? "सभी" : "All"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {list.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.slug}
                  to="/customer/service/$slug"
                  params={{ slug: service.slug }}
                  className="card-soft card-soft-hover flex min-h-28 flex-col justify-between p-4"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-extrabold leading-tight">
                    {lang === "hi" ? service.hi : service.en}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold">
                {lang === "hi" ? "आज उपलब्ध भरोसेमंद मजदूर" : "Trusted workers available today"}
              </h2>
              <p className="text-xs font-semibold text-muted-foreground">
                {lang === "hi"
                  ? "रेटिंग, वेज और वेरिफिकेशन के साथ"
                  : "With rating, wage and verification"}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
              {trustedWorkers.length}
            </span>
          </div>

          <div className="space-y-3">
            {loadingWorkers && (
              <p className="rounded-2xl bg-muted p-4 text-center text-sm text-muted-foreground">
                Loading workers...
              </p>
            )}
            {!loadingWorkers &&
              trustedWorkers
                .slice(0, 4)
                .map((worker) => <WorkerCard key={worker.id} worker={worker} lang={lang} />)}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function WorkerCard({ worker, lang }: { worker: WorkerCardData; lang: Lang }) {
  return (
    <Link
      to="/customer/worker/$id"
      params={{ id: worker.id }}
      className="card-soft card-soft-hover flex items-center gap-3 p-4"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-lg font-black text-primary">
        {worker.name.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-extrabold">{worker.name}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600">
            <Star className="h-3 w-3 fill-current" /> {worker.rating}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs font-semibold text-muted-foreground">
          {serviceName(worker.skill, lang)} · {worker.experience}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 font-bold text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {worker.area} · {worker.distanceKm} km
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">
            <Wallet className="h-3 w-3" />₹{worker.expectedWage}
          </span>
          {worker.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 font-bold text-success">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>
      </div>
    </Link>
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
