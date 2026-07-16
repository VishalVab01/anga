import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import {
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  IndianRupee,
  MapPin,
  Mic,
  Search,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { PageShell } from "@/components/PageShell";
import defaultWorkerProfileImage from "@/assets/profile/construction-worker.png";
import { ApiError, api, type ApiJob, type ApiNotification, type ApiWorkerProfile } from "@/lib/api";
import { jobs as fallbackJobs, serviceName, services } from "@/lib/data";
import { useT, type Lang } from "@/lib/i18n";
import { getProfile, saveProfile } from "@/lib/session";

export const Route = createFileRoute("/worker/")({
  head: () => ({ meta: [{ title: "Anga - Worker home" }] }),
  component: WorkerHome,
});

type JobCardData = {
  id: string;
  title: string;
  service: string;
  location: string;
  payment: number;
  time: string;
  status: string;
  distanceKm: number;
  rating: number;
  verified: boolean;
  wageType: string;
  applicationStatus?: string | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onstart: (() => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

function WorkerHome() {
  const { t, lang } = useT();
  const [q, setQ] = useState("");
  const [apiJobs, setApiJobs] = useState<ApiJob[]>([]);
  const [profile, setProfile] = useState<ApiWorkerProfile | null>(null);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useWorkerHomeAnimations();

  useEffect(() => {
    api
      .nearbyJobs()
      .then((result) => setApiJobs(result.jobs))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) return;
        setError(err instanceof Error ? err.message : "Using demo jobs");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cachedProfile = getProfile("worker");
    if (cachedProfile) {
      setProfile({
        _id: "",
        userId: "",
        name: String(cachedProfile.name || ""),
        phone: String(cachedProfile.phone || ""),
        skills: Array.isArray(cachedProfile.skills) ? cachedProfile.skills.map(String) : [],
        experience: String(cachedProfile.experience || ""),
        expectedWage: Number(cachedProfile.expectedWage || 0),
        availableToday: Boolean(cachedProfile.availableToday),
        preferredDistance: String(cachedProfile.preferredDistance || ""),
        location: String(cachedProfile.location || cachedProfile.area || ""),
        photoUrl: typeof cachedProfile.photoUrl === "string" ? cachedProfile.photoUrl : undefined,
        documentsUploaded: Boolean(cachedProfile.documentsUploaded),
        verified: Boolean(cachedProfile.verified),
        rating: Number(cachedProfile.rating || 4.5),
        totalJobsCompleted: Number(cachedProfile.totalJobsCompleted || 0),
      });
    }

    api
      .profile()
      .then((result) => setProfile(result.profile as ApiWorkerProfile | null))
      .catch(() => {
        // Cached onboarding profile keeps the home screen useful during API cold starts.
      });
  }, []);

  useEffect(() => {
    api
      .notifications()
      .then((result) => setNotifications(result.notifications.slice(0, 4)))
      .catch(() => setNotifications([]))
      .finally(() => setNotificationsLoading(false));
  }, []);

  const list = useMemo(() => {
    const live = [...apiJobs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(mapApiJob);
    const fallback = fallbackJobs.map((job) => ({
      id: job.id,
      title: job.title[lang],
      service: job.service,
      location: job.location[lang],
      payment: job.payment,
      time: job.time[lang],
      status: job.status,
      distanceKm: job.distanceKm,
      rating: job.customerRating,
      verified: job.verifiedCustomer,
      wageType: job.wageType[lang],
    }));
    return live.length ? live : fallback;
  }, [apiJobs, lang]);

  const filtered = list.filter((job) => {
    const haystack = `${job.title} ${job.location} ${serviceName(job.service, lang)}`.toLowerCase();
    return haystack.includes(q.toLowerCase());
  });
  const featuredJobs = filtered.slice(0, Math.min(3, filtered.length));
  const otherJobs = filtered.slice(featuredJobs.length);
  const selectedCategory = services.find(
    (service) =>
      q.toLowerCase() === service.en.toLowerCase() || q.toLowerCase() === service.hi.toLowerCase(),
  );
  const workerLocation =
    profile?.location || (lang === "hi" ? "अपना क्षेत्र जोड़ें" : "Add your area");

  const startVoiceSearch = () => {
    if (typeof window === "undefined" || listening) return;
    const SpeechRecognition =
      (
        window as unknown as {
          SpeechRecognition?: SpeechRecognitionCtor;
          webkitSpeechRecognition?: SpeechRecognitionCtor;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          SpeechRecognition?: SpeechRecognitionCtor;
          webkitSpeechRecognition?: SpeechRecognitionCtor;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        lang === "hi"
          ? "इस ब्राउज़र में आवाज़ से खोज उपलब्ध नहीं है"
          : "Voice search is not available in this browser",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => {
      setListening(true);
      toast.message(
        lang === "hi" ? "बोलिए, काम खोज रहे हैं..." : "Listening for your job search...",
      );
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error(lang === "hi" ? "आवाज़ समझ नहीं आई" : "Could not understand voice");
    };
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (!transcript) return;
      setQ(transcript);
      toast.success(lang === "hi" ? "आवाज़ से खोज तैयार" : "Voice search added");
    };
    recognition.start();
  };

  const saveWorkerLocation = async (nextLocation: string) => {
    const trimmedLocation = nextLocation.trim();
    if (!trimmedLocation) return;

    const nextProfile = {
      name: profile?.name || "",
      phone: profile?.phone || "",
      location: trimmedLocation,
      skills: profile?.skills?.length ? profile.skills : ["electrician"],
      experience: profile?.experience || "",
      expectedWage: profile?.expectedWage || 0,
      availableToday: profile?.availableToday ?? true,
      preferredDistance: profile?.preferredDistance || "5 km",
      photoUrl: profile?.photoUrl || "",
      documentsUploaded: profile?.documentsUploaded ?? false,
    };

    setProfile((current) =>
      current
        ? { ...current, location: trimmedLocation }
        : {
            _id: "",
            userId: "",
            verified: false,
            rating: 4.5,
            totalJobsCompleted: 0,
            ...nextProfile,
          },
    );
    saveProfile("worker", nextProfile);
    setLocationOpen(false);

    try {
      await api.saveWorkerProfile(nextProfile);
      toast.success(lang === "hi" ? "लोकेशन अपडेट हो गई" : "Location updated");
    } catch {
      toast.message(
        lang === "hi" ? "लोकेशन इस डिवाइस पर सेव हो गई" : "Location saved on this device",
      );
    }
  };

  return (
    <PageShell bottomNav={<BottomNav role="worker" />}>
      <div className="worker-home-screen -mx-4 -mt-4 space-y-5 overflow-visible pb-2">
        <section className="worker-hero relative z-30 overflow-visible rounded-b-[2rem] bg-primary px-4 pb-4 pt-5 text-primary-foreground shadow-xl shadow-primary/20">
          <div className="pointer-events-none absolute -right-12 top-5 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-16 bottom-4 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-40 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={profile?.photoUrl || defaultWorkerProfileImage}
                alt={profile?.name ? `${profile.name} profile photo` : "Worker profile photo"}
                className="h-12 w-12 shrink-0 rounded-full bg-white object-cover shadow-lg ring-2 ring-white/70"
              />
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold leading-tight">{t("greeting")}!</h1>
                <button
                  type="button"
                  onClick={() => {
                    setLocationOpen((open) => !open);
                    setNotificationsOpen(false);
                  }}
                  className="mt-0.5 flex max-w-full items-center gap-1 text-left text-sm font-semibold text-primary-foreground/75 underline-offset-4 hover:underline"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{workerLocation}</span>
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((open) => !open);
                setLocationOpen(false);
              }}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/15 text-primary-foreground backdrop-blur"
              aria-label={t("notifications")}
            >
              <Bell className="h-5 w-5" />
            </button>

            {notificationsOpen && (
              <NotificationsDropdown
                items={notifications}
                loading={notificationsLoading}
                lang={lang}
                noNotifications={t("noNotifications")}
                onClose={() => setNotificationsOpen(false)}
              />
            )}

            {locationOpen && (
              <LocationDropdown
                lang={lang}
                currentLocation={profile?.location || ""}
                onSave={saveWorkerLocation}
                onClose={() => setLocationOpen(false)}
              />
            )}
          </div>

          <div className="relative z-10 mt-4 rounded-[1.65rem] bg-white/95 p-4 text-foreground shadow-xl shadow-primary/20">
            <p className="max-w-[13rem] text-2xl font-black leading-tight tracking-normal">
              {lang === "hi" ? "आज का सही काम खोजें" : "Find the right work today"}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {lang === "hi" ? "पास के भरोसेमंद रोज़गार" : "Nearby verified daily-wage jobs"}
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-full bg-primary/10 p-1.5">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-3 py-3 shadow-sm">
                <Search className="h-5 w-5 shrink-0 text-primary" />
                <input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder={t("search")}
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-primary-foreground shadow-lg shadow-primary/30 transition ${
                  listening ? "animate-pulse bg-accent" : "bg-primary"
                }`}
                aria-label={lang === "hi" ? "आवाज़ से खोजें" : "Search by voice"}
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {error && (
          <p className="mx-4 rounded-2xl bg-accent/10 p-3 text-xs font-semibold text-accent">
            {error}
          </p>
        )}

        <section className="worker-stats relative z-10 grid grid-cols-3 gap-2.5 px-4">
          <Stat
            icon={<BriefcaseBusiness className="h-4 w-4" />}
            label={lang === "hi" ? "आज के काम" : "Today"}
            value={`${list.length}`}
            hint={lang === "hi" ? "नए मैच" : "new matches"}
            tone="primary"
          />
          <Stat
            icon={<IndianRupee className="h-4 w-4" />}
            label={lang === "hi" ? "मजदूरी" : "Avg wage"}
            value="₹950"
            hint={lang === "hi" ? "दिन का औसत" : "daily avg"}
            tone="money"
          />
          <Stat
            icon={<MapPin className="h-4 w-4" />}
            label={lang === "hi" ? "दूरी" : "Nearby"}
            value="5 km"
            hint={lang === "hi" ? "आपके पास" : "around you"}
            tone="nearby"
          />
        </section>

        <section className="worker-categories px-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-extrabold">{t("skills")}</h2>
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
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {services.map((service) => {
              const Icon = service.icon;
              const active = selectedCategory?.slug === service.slug;
              return (
                <button
                  type="button"
                  key={service.slug}
                  onClick={() => setQ(lang === "hi" ? service.hi : service.en)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-xs font-extrabold shadow-sm transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:bg-primary/10"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.3} />
                  {lang === "hi" ? service.hi : service.en}
                </button>
              );
            })}
          </div>
        </section>

        <section className="worker-jobs px-4">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold">
                {lang === "hi" ? "आपके लिए मैच" : "Job match with you"}
              </h2>
              <p className="text-xs font-medium text-muted-foreground">
                {lang === "hi" ? "नए काम सबसे ऊपर" : "Newest local jobs appear first"}
              </p>
            </div>
            <Link to="/worker/applications" className="text-xs font-bold text-primary">
              {t("myApps")}
            </Link>
          </div>

          <div className="space-y-3">
            {loading && (
              <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
                Loading jobs...
              </p>
            )}
            {!loading && filtered.length === 0 && (
              <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
                {lang === "hi" ? "काम नहीं मिला" : "No jobs found"}
              </p>
            )}
            {featuredJobs.length > 0 && <FeaturedJobDeck jobs={featuredJobs} lang={lang} />}
            {otherJobs.length > 0 && (
              <div className="pt-2">
                <h3 className="mb-3 text-base font-extrabold">
                  {lang === "hi" ? "और काम" : "Popular nearby"}
                </h3>
                <div className="space-y-3">
                  {otherJobs.map((job) => (
                    <JobCard key={job.id} job={job} lang={lang} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function mapApiJob(job: ApiJob): JobCardData {
  return {
    id: job._id,
    title: job.title,
    service: job.category,
    location: job.location,
    payment: job.wage,
    time: [job.date, job.time].filter(Boolean).join(", ") || "Today",
    status: job.applicationStatus ? job.applicationStatus : job.status,
    distanceKm: 2.5,
    rating: 4.7,
    verified: true,
    wageType: job.urgent ? "Urgent" : "Daily wage",
    applicationStatus: job.applicationStatus,
  };
}

function LocationDropdown({
  lang,
  currentLocation,
  onSave,
  onClose,
}: {
  lang: Lang;
  currentLocation: string;
  onSave: (location: string) => void | Promise<void>;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    const location = String(data.get("worker-location") || "");
    setSaving(true);
    await onSave(location);
    setSaving(false);
  };

  return (
    <form
      onSubmit={submit}
      className="absolute left-0 top-14 z-50 w-[min(21rem,calc(100vw-2rem))] rounded-[1.5rem] border border-white/30 bg-card p-3 text-foreground shadow-2xl shadow-primary/25"
    >
      <div className="mb-3 flex items-start justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-black">{lang === "hi" ? "लोकेशन बदलें" : "Change location"}</p>
          <p className="text-[11px] font-semibold text-muted-foreground">
            {lang === "hi" ? "पास के काम इसी क्षेत्र से मिलेंगे" : "Nearby jobs use this area"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground"
        >
          {lang === "hi" ? "बंद" : "Close"}
        </button>
      </div>

      <LocationAutocomplete
        key={currentLocation}
        name="worker-location"
        defaultValue={currentLocation}
        placeholder={lang === "hi" ? "अपना क्षेत्र खोजें" : "Search your area"}
        required
      />

      <button
        type="submit"
        disabled={saving}
        className="btn-primary mt-3 w-full disabled:opacity-60"
      >
        {saving
          ? lang === "hi"
            ? "सेव हो रहा है..."
            : "Saving..."
          : lang === "hi"
            ? "लोकेशन सेव करें"
            : "Save location"}
      </button>
    </form>
  );
}

function NotificationsDropdown({
  items,
  loading,
  lang,
  noNotifications,
  onClose,
}: {
  items: ApiNotification[];
  loading: boolean;
  lang: Lang;
  noNotifications: string;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-14 z-30 w-[min(20rem,calc(100vw-2rem))] rounded-[1.5rem] border border-white/30 bg-card p-3 text-foreground shadow-2xl shadow-primary/25">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="text-sm font-black">{lang === "hi" ? "सूचनाएं" : "Notifications"}</p>
          <p className="text-[11px] font-semibold text-muted-foreground">
            {lang === "hi" ? "नए काम और अपडेट" : "Jobs and updates"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground"
        >
          {lang === "hi" ? "बंद" : "Close"}
        </button>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {loading && (
          <p className="rounded-2xl bg-muted p-4 text-center text-xs font-semibold text-muted-foreground">
            {lang === "hi" ? "लोड हो रहा है..." : "Loading notifications..."}
          </p>
        )}
        {!loading && items.length === 0 && (
          <p className="rounded-2xl bg-muted p-4 text-center text-xs font-semibold text-muted-foreground">
            {noNotifications}
          </p>
        )}
        {items.map((item) => {
          const Icon = item.type === "assigned" ? CheckCircle2 : Bell;
          return (
            <div key={item._id} className="rounded-2xl bg-muted/70 p-3">
              <div className="flex items-start gap-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-extrabold">{item.title}</p>
                    {!item.read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs font-medium text-muted-foreground">
                    {item.message}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-muted-foreground/80">
                    {new Date(item.createdAt).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone: "primary" | "money" | "nearby";
}) {
  const toneClass = {
    primary: "from-primary/16 via-card to-card text-primary",
    money: "from-emerald-500/14 via-card to-card text-emerald-600",
    nearby: "from-sky-500/14 via-card to-card text-sky-600",
  }[tone];
  const iconToneClass = {
    primary: "text-primary",
    money: "text-emerald-600",
    nearby: "text-sky-600",
  }[tone];

  return (
    <div className="group relative min-w-0 overflow-hidden rounded-[1.2rem] border border-primary/10 bg-card px-2.5 py-2.5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] ring-1 ring-white/80 transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(37,99,235,0.14)]">
      <div className={`absolute inset-0 bg-gradient-to-br ${toneClass} opacity-90`} />
      <div className="pointer-events-none absolute -right-4 -top-8 h-14 w-14 rounded-full bg-white/80 blur-xl" />
      <div className="relative z-10 flex min-h-[5.6rem] flex-col justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white shadow-sm ring-1 ring-primary/5 ${iconToneClass}`}
          >
            {icon}
          </span>
          <span className="min-w-0 break-words text-[0.62rem] font-black uppercase leading-tight text-muted-foreground">
            {label}
          </span>
        </div>
        <div>
          <div className="truncate text-[1.45rem] font-black leading-none tracking-normal text-foreground">
            {value}
          </div>
          <div className="mt-1 truncate text-[0.68rem] font-extrabold leading-tight text-muted-foreground">
            {hint}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedJobDeck({ jobs, lang }: { jobs: JobCardData[]; lang: Lang }) {
  const navigate = useNavigate();
  const jobSignature = jobs.map((job) => job.id).join("|");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragStartXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardStep, setCardStep] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setDragOffset(0);
  }, [jobSignature]);

  const deckJobs = jobs.slice(0, 5);
  const cardGap = 14;
  const cardRatio = 0.84;

  useEffect(() => {
    const measureCardStep = () => {
      const container = containerRef.current;
      if (!container) return;
      setCardStep(container.clientWidth * cardRatio + cardGap);
    };

    measureCardStep();
    window.addEventListener("resize", measureCardStep);
    return () => window.removeEventListener("resize", measureCardStep);
  }, []);

  const openJob = (job: JobCardData) => {
    navigate({ to: "/worker/job/$id", params: { id: job.id } });
  };

  const stopDragging = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    const threshold = Math.max(56, cardStep * 0.18);
    if (dragOffset < -threshold) {
      setActiveIndex((index) => Math.min(deckJobs.length - 1, index + 1));
    } else if (dragOffset > threshold) {
      setActiveIndex((index) => Math.max(0, index - 1));
    }
    setDragOffset(0);
  };

  return (
    <div className="relative select-none">
      {deckJobs.length === 0 && (
        <div className="grid min-h-[15rem] place-items-center rounded-[1.75rem] border border-dashed border-primary/30 bg-card text-center text-sm font-semibold text-muted-foreground">
          {lang === "hi" ? "आज के मैच देख लिए" : "You have reviewed today's matches"}
        </div>
      )}

      {deckJobs.length > 0 && (
        <div
          ref={containerRef}
          className="-mx-1 overflow-hidden px-1 pb-2"
          onPointerDown={(event) => {
            isDraggingRef.current = true;
            setIsDragging(true);
            dragStartXRef.current = event.clientX;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!isDraggingRef.current) return;
            const delta = event.clientX - dragStartXRef.current;
            setDragOffset(delta);
          }}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onPointerLeave={stopDragging}
        >
          <div
            ref={trackRef}
            className="flex cursor-grab touch-pan-y gap-3.5 active:cursor-grabbing"
            style={{
              transform: `translate3d(${-(activeIndex * cardStep) + dragOffset}px, 0, 0)`,
              transition: isDragging ? "none" : "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {deckJobs.map((job) => (
              <div key={job.id} className="min-w-0 flex-[0_0_84%]">
                <FeaturedJobCard job={job} lang={lang} onOpen={() => openJob(job)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {deckJobs.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5 rounded-full">
          {deckJobs.map((job, index) => (
            <span
              key={job.id}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-primary/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedJobCard({
  job,
  lang,
  onOpen,
}: {
  job: JobCardData;
  lang: Lang;
  onOpen?: () => void;
}) {
  const service = services.find((item) => item.slug === job.service);
  const applicants = Math.max(8, Math.round(job.payment / 80));
  return (
    <div className="featured-job-card group relative flex h-[14rem] flex-col overflow-hidden rounded-[1.55rem] bg-primary p-3 text-primary-foreground shadow-xl shadow-primary/20 transition-[box-shadow,transform] duration-300 ease-out">
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-4 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-primary shadow-lg">
          {service && <service.icon className="h-5 w-5" strokeWidth={2.3} />}
        </div>
        <span className="max-w-[6.5rem] truncate rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold capitalize">
          {job.applicationStatus === "pending" ? "Applied" : job.status}
        </span>
      </div>
      <div className="relative z-10 mt-2 min-h-[5.1rem] min-w-0">
        <p className="truncate text-xs font-bold text-primary-foreground/70">
          {serviceName(job.service, lang)}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[1.05rem] font-black leading-tight tracking-normal">
          {job.title}
        </h3>
        <p className="mt-1 flex min-w-0 items-center gap-1 text-xs font-medium text-primary-foreground/75">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 truncate">
            {job.location} · {job.distanceKm} km
          </span>
        </p>
      </div>
      <div className="relative z-10 mt-auto grid grid-cols-[auto_minmax(0,1fr)_auto] gap-1.5">
        <span className="truncate rounded-full bg-white/15 px-2.5 py-1.5 text-xs font-extrabold">
          ₹{job.payment}
        </span>
        <span className="min-w-0 truncate rounded-full bg-white/15 px-2.5 py-1.5 text-center text-xs font-bold">
          {job.time}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1.5 text-xs font-bold">
          <Star className="h-3 w-3 fill-current text-amber-300" /> {job.rating}
        </span>
      </div>
      <div className="relative z-10 mt-2 flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 truncate rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-foreground shadow-lg">
          {applicants}+ {lang === "hi" ? "वर्कर पास में" : "workers nearby"}
        </span>
        <button
          type="button"
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onPointerUp={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpen?.();
          }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-foreground text-background shadow-lg transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-label={lang === "hi" ? "काम खोलें" : "Open job"}
        >
          <ArrowUpRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function JobCard({ job, lang }: { job: JobCardData; lang: Lang }) {
  const service = services.find((item) => item.slug === job.service);
  const statusClass =
    job.status === "accepted" || job.status === "assigned"
      ? "bg-success/15 text-success"
      : job.status === "rejected" || job.status === "cancelled"
        ? "bg-destructive/10 text-destructive"
        : "bg-accent/15 text-accent";

  return (
    <Link
      to="/worker/job/$id"
      params={{ id: job.id }}
      className="card-soft card-soft-hover block overflow-hidden rounded-[1.45rem] p-4"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 shadow-sm">
          {service && <service.icon className="h-6 w-6 text-primary" strokeWidth={2} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 text-base font-bold leading-tight">{job.title}</h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass}`}
            >
              {job.applicationStatus === "pending" ? "Applied" : job.status}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {job.location} · {job.distanceKm} km
          </p>
          <div className="mt-3 grid grid-cols-[0.9fr_1.45fr_0.8fr] gap-2 text-xs">
            <span className="flex min-h-11 min-w-0 items-center justify-center rounded-2xl bg-primary/10 px-2 py-1.5 text-center font-bold leading-tight text-primary">
              ₹{job.payment}
            </span>
            <span className="flex min-h-11 min-w-0 items-center justify-center rounded-2xl bg-muted px-2 py-1.5 text-center font-semibold leading-tight">
              <span className="line-clamp-2">{job.time}</span>
            </span>
            <span className="flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-2xl bg-muted px-2 py-1.5 text-center font-semibold leading-tight">
              <Star className="h-3 w-3 shrink-0 fill-current text-amber-500" /> {job.rating}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.verified && (
              <TrustPill
                icon={<ShieldCheck className="h-3 w-3" />}
                text={lang === "hi" ? "सत्यापित" : "Verified"}
              />
            )}
            <TrustPill icon={<Wallet className="h-3 w-3" />} text={job.wageType} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function TrustPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
      {icon}
      {text}
    </span>
  );
}

function useWorkerHomeAnimations() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        [
          ".worker-hero",
          ".worker-stats > *",
          ".worker-categories",
          ".featured-job-card",
          ".worker-jobs .card-soft",
        ],
        { autoAlpha: 0, y: 22, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.58,
          stagger: 0.055,
          ease: "power3.out",
        },
      );
    });

    return () => context.revert();
  }, []);
}
