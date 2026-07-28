import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Briefcase,
  CheckCircle2,
  FileCheck,
  Languages,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WorkerDetailsSkeleton } from "@/components/AppLoadingSkeletons";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { api, type ApiWorkerProfile } from "@/lib/api";
import { serviceName, services, workers } from "@/lib/data";
import { useT, type Lang } from "@/lib/i18n";
import { isWorkerSaved, removeSavedWorker, saveWorker } from "@/lib/savedWorkers";

export const Route = createFileRoute("/customer/worker/$id")({
  head: () => ({ meta: [{ title: "Anga - Worker profile" }] }),
  component: WorkerProfileDetail,
});

type WorkerDetail = {
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
  bio: Record<Lang, string>;
  languages: string[];
  photoUrl?: string;
};

function WorkerProfileDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<WorkerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [, setSaveVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fallback = workers.find((item) => item.id === id);
    if (fallback) {
      setWorker(mapDemoWorker(fallback));
      setError("");
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setWorker(null);
    setError("");
    setLoading(true);
    const loadWorker = async () => {
      try {
        const result = await api.worker(id);
        if (!cancelled) setWorker(mapApiWorker(result.worker));
      } catch (detailError) {
        try {
          // Keeps the profile working while older API deployments roll forward.
          const result = await api.workers();
          const matched = result.workers.find((item) => item.userId === id || item._id === id);
          if (!matched) throw detailError;
          if (!cancelled) setWorker(mapApiWorker(matched));
        } catch (requestError) {
          if (!cancelled) {
            setError(requestError instanceof Error ? requestError.message : "Worker not found");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadWorker();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PageShell bottomNav={<BottomNav role="customer" />}>
        <WorkerDetailsSkeleton />
      </PageShell>
    );
  }

  if (!worker) {
    return (
      <PageShell bottomNav={<BottomNav role="customer" />}>
        <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Briefcase className="h-6 w-6" />
          </span>
          <h1 className="customer-section-title mt-4 text-xl">Worker unavailable</h1>
          <p className="mt-2 max-w-64 text-sm leading-6 text-muted-foreground">
            {error || "This worker profile is no longer available."}
          </p>
          <Link to="/customer" className="btn-primary mt-6 min-h-12 px-6">
            Browse other workers
          </Link>
        </div>
      </PageShell>
    );
  }

  const service = services.find((item) => item.slug === worker.skill);
  const ServiceIcon = service?.icon ?? Briefcase;
  const saved = isWorkerSaved(worker.id);
  const toggleSaved = () => {
    if (saved) {
      removeSavedWorker(worker.id);
      toast.message(`${worker.name} removed from saved workers`);
    } else {
      saveWorker({
        id: worker.id,
        name: worker.name,
        phone: worker.phone,
        skill: worker.skill,
        area: worker.area,
        rating: worker.rating,
        expectedWage: worker.expectedWage,
        verified: worker.verified,
        photoUrl: worker.photoUrl,
      });
      toast.success(`${worker.name} saved`);
    }
    setSaveVersion((value) => value + 1);
  };
  const hireWorker = () => {
    sessionStorage.setItem("anga.customerSelectedService", worker.skill);
    sessionStorage.setItem("anga.preferredWorkerName", worker.name);
    toast.message(`Preparing a ${serviceName(worker.skill, lang)} request for ${worker.name}`);
    navigate({ to: "/customer/request" });
  };

  return (
    <PageShell bottomNav={<BottomNav role="customer" />}>
      <div className="-mx-4 -mb-28 -mt-4 min-h-[100dvh] bg-primary pb-28">
        <header className="relative overflow-hidden px-4 pb-8 pt-5 text-primary-foreground">
          <span className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <span className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <Link
              to="/customer"
              aria-label="Back"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <p className="customer-section-title text-sm">{t("workerProfile")}</p>
            <button
              type="button"
              onClick={toggleSaved}
              aria-label={saved ? "Remove saved worker" : "Save worker"}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
            >
              <Bookmark className={`h-5 w-5 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="relative mt-7 flex items-start gap-4">
            {worker.photoUrl ? (
              <img
                src={worker.photoUrl}
                alt={`${worker.name} profile`}
                className="h-16 w-16 shrink-0 rounded-[1.35rem] border-2 border-white/30 bg-white object-cover shadow-xl shadow-blue-950/20"
              />
            ) : (
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.35rem] bg-white text-xl text-primary shadow-xl shadow-blue-950/20">
                {worker.name.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-primary-foreground/65">
                {serviceName(worker.skill, lang)}
              </p>
              <h1 className="customer-section-title mt-1 truncate text-[1.55rem] leading-tight">
                {worker.name}
              </h1>
              <p className="mt-2 flex items-center gap-1 text-xs text-primary-foreground/70">
                <MapPin className="h-3.5 w-3.5" /> {worker.area}
                {worker.distanceKm > 0 ? ` · ${worker.distanceKm} km` : ""}
              </p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15">
              <ServiceIcon className="h-5 w-5" />
            </span>
          </div>

          <div className="relative mt-5 flex flex-wrap gap-2 text-[10px]">
            {worker.verified && <HeroPill icon={<BadgeCheck />} text={t("verified")} />}
            {worker.documentUploaded && (
              <HeroPill icon={<FileCheck />} text={t("documentUploaded")} />
            )}
            <HeroPill
              icon={<CheckCircle2 />}
              text={worker.availableToday ? "Available today" : "Currently offline"}
            />
          </div>
        </header>

        <main className="mx-1.5 min-h-[70dvh] rounded-t-[2.5rem] bg-background px-4 pb-7 pt-5">
          <section className="grid grid-cols-3 gap-2.5">
            <QuickFact
              icon={<Star className="fill-amber-400 text-amber-400" />}
              label={t("rating")}
              value={`${worker.rating}`}
            />
            <QuickFact
              icon={<Wallet />}
              label={t("expectedWage")}
              value={`₹${worker.expectedWage}`}
            />
            <QuickFact icon={<Briefcase />} label="Jobs done" value={`${worker.completedJobs}`} />
          </section>

          <section className="mt-5 rounded-[1.65rem] bg-card p-4 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.55)]">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
                <Briefcase className="h-4 w-4" />
              </span>
              <div>
                <h2 className="customer-section-title text-base">About this worker</h2>
                <p className="text-[10px] text-muted-foreground">{worker.experience} experience</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{worker.bio[lang]}</p>
            <div className="mt-3 flex items-center gap-2 rounded-[1.1rem] bg-primary/5 px-3 py-3 text-xs text-muted-foreground">
              <Languages className="h-4 w-4 shrink-0 text-primary" />
              {worker.languages.join(", ")}
            </div>
          </section>

          <section className="mt-4 rounded-[1.65rem] bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="customer-card-title text-sm">Anga trust check</h2>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                  Ratings, completed work and uploaded trust signals are shown before hiring.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-[1fr_1.2fr] gap-3">
            <a href={`tel:${worker.phone.replace(/\s/g, "")}`} className="btn-outline min-h-14">
              <Phone className="h-4 w-4" /> {t("call")}
            </a>
            <button type="button" onClick={hireWorker} className="btn-primary min-h-14">
              Hire this worker
            </button>
          </section>
          <p className="mt-2 px-2 text-center text-[10px] leading-4 text-muted-foreground">
            Anga will prepare a job request for this worker’s service.
          </p>
        </main>
      </div>
    </PageShell>
  );
}

function mapApiWorker(worker: ApiWorkerProfile): WorkerDetail {
  const primarySkill = worker.skills[0] || "other";
  return {
    id: worker.userId || worker._id,
    name: worker.name,
    phone: worker.phone,
    skill: primarySkill,
    area: worker.location,
    distanceKm: 0,
    rating: worker.rating,
    experience: worker.experience,
    expectedWage: worker.expectedWage,
    verified: worker.verified,
    documentUploaded: worker.documentsUploaded,
    availableToday: worker.availableToday,
    completedJobs: worker.totalJobsCompleted,
    bio: {
      en: `Experienced ${serviceName(primarySkill, "en").toLowerCase()} professional serving ${worker.location}. Review wage, availability and trust details before hiring.`,
      hi: `${worker.location} में उपलब्ध अनुभवी स्थानीय कामगार। काम देने से पहले मजदूरी, उपलब्धता और भरोसे की जानकारी देखें।`,
    },
    languages: ["Hindi", "English"],
    photoUrl: worker.photoUrl,
  };
}

function mapDemoWorker(worker: (typeof workers)[number]): WorkerDetail {
  return {
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
    bio: worker.bio,
    languages: worker.languages,
  };
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
