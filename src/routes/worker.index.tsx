import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bell,
  Bookmark,
  CheckCircle2,
  MapPin,
  Mic,
  Search,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import defaultWorkerProfileImage from "@/assets/profile/construction-worker.png";
import { CardListSkeleton } from "@/components/AppLoadingSkeletons";
import { BottomNav } from "@/components/BottomNav";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { PageShell } from "@/components/PageShell";
import { ApiError, api, type ApiJob, type ApiNotification, type ApiWorkerProfile } from "@/lib/api";
import { jobs as fallbackJobs, serviceName, services } from "@/lib/data";
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
  const [query, setQuery] = useState("");
  const [apiJobs, setApiJobs] = useState<ApiJob[]>([]);
  const [profile, setProfile] = useState<ApiWorkerProfile | null>(null);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    api
      .nearbyJobs()
      .then((result) => setApiJobs(result.jobs))
      .catch((error) => {
        if (!(error instanceof ApiError && error.status === 401)) setUsingFallback(true);
      })
      .finally(() => setJobsLoading(false));
  }, []);

  useEffect(() => {
    const cachedProfile = getProfile("worker");
    if (cachedProfile) setProfile(mapCachedProfile(cachedProfile));

    api
      .profile()
      .then((result) => setProfile(result.profile as ApiWorkerProfile | null))
      .catch(() => {
        // The locally cached profile keeps the header useful while the API warms up.
      });
  }, []);

  useEffect(() => {
    api
      .notifications()
      .then((result) => setNotifications(result.notifications.slice(0, 4)))
      .catch(() => setNotifications([]))
      .finally(() => setNotificationsLoading(false));
  }, []);

  const jobs = useMemo(() => {
    const liveJobs = [...apiJobs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(mapApiJob);

    const demoJobs = fallbackJobs.map((job) => ({
      id: job.id,
      title: job.title.en,
      service: job.service,
      location: job.location.en,
      payment: job.payment,
      time: job.time.en,
      status: job.status,
      distanceKm: job.distanceKm,
      rating: job.customerRating,
      verified: job.verifiedCustomer,
      wageType: job.wageType.en,
    }));

    return liveJobs.length ? liveJobs : demoJobs;
  }, [apiJobs]);

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return jobs;

    return jobs.filter((job) =>
      `${job.title} ${job.location} ${serviceName(job.service, "en")}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [jobs, query]);

  const matchedJobs = filteredJobs.slice(0, 5);
  const popularJobs =
    filteredJobs.length > 5 ? filteredJobs.slice(5, 10) : filteredJobs.slice(0, 5);
  const workerName = profile?.name?.trim() || "Anga Worker";
  const workerLocation = profile?.location || "Add your work area";
  const unreadNotifications = notifications.some((item) => !item.read);

  const startVoiceSearch = () => {
    if (typeof window === "undefined" || listening) return;
    const SpeechRecognition = (
      window as unknown as {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
      }
    ).SpeechRecognition;
    const WebkitSpeechRecognition = (
      window as unknown as {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
      }
    ).webkitSpeechRecognition;
    const Recognition = SpeechRecognition || WebkitSpeechRecognition;

    if (!Recognition) {
      toast.error("Voice search is not available in this browser");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onerror = () => {
      setListening(false);
      toast.error("Could not understand voice");
    };
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setQuery(transcript);
    };
    recognition.start();
  };

  const saveWorkerLocation = async (nextLocation: string) => {
    const location = nextLocation.trim();
    if (!location) return;

    const nextProfile = {
      name: profile?.name || "",
      phone: profile?.phone || "",
      location,
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
        ? { ...current, location }
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
      toast.success("Location updated");
    } catch {
      toast.message("Location saved on this device");
    }
  };

  return (
    <PageShell bottomNav={<BottomNav role="worker" />}>
      <div className="worker-home-screen -mx-4 -mb-28 -mt-4 min-h-[100dvh] overflow-hidden bg-primary pb-28">
        <section className="worker-header relative z-30 bg-primary px-4 pb-5 pt-5 text-primary-foreground">
          <div className="relative z-20 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={profile?.photoUrl || defaultWorkerProfileImage}
                alt={profile?.name ? `${profile.name} profile photo` : "Worker profile photo"}
                className="h-12 w-12 shrink-0 rounded-full bg-white object-cover shadow-lg ring-2 ring-white/80"
              />
              <div className="min-w-0">
                <h1 className="worker-profile-name truncate text-base leading-tight">
                  {workerName}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setLocationOpen((open) => !open);
                    setNotificationsOpen(false);
                  }}
                  className="mt-1 flex max-w-full items-center gap-1 text-left text-[11px] text-primary-foreground/70 underline-offset-4 hover:underline"
                >
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{workerLocation}</span>
                </button>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/worker/saved"
                aria-label="Saved jobs"
                className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-primary-foreground backdrop-blur transition hover:bg-white/25"
                onClick={() => {
                  setNotificationsOpen(false);
                  setLocationOpen(false);
                }}
              >
                <Bookmark className="h-5 w-5" />
              </Link>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setLocationOpen(false);
                }}
                className="relative grid h-11 w-11 place-items-center rounded-full bg-white/15 text-primary-foreground backdrop-blur transition hover:bg-white/25"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications && (
                  <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-accent" />
                )}
              </button>
            </div>
          </div>

          {locationOpen && (
            <LocationPopover
              currentLocation={profile?.location || ""}
              onSave={saveWorkerLocation}
              onClose={() => setLocationOpen(false)}
            />
          )}

          {notificationsOpen && (
            <NotificationsPopover
              items={notifications}
              loading={notificationsLoading}
              onClose={() => setNotificationsOpen(false)}
            />
          )}
        </section>

        <div className="worker-content relative z-10 mx-1.5 space-y-5 rounded-[2.5rem] bg-background pb-5 pt-4">
          <div className="relative z-10 mx-4 overflow-hidden rounded-[2rem] bg-gradient-to-br from-white via-white to-blue-100 p-4 text-foreground shadow-xl shadow-blue-950/15">
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
            <p className="worker-hero-copy relative max-w-[18rem] text-[1.8rem] leading-[1.08] tracking-[-0.045em]">
              We <span className="text-primary">connect you</span> to nearby work that fits your
              skills
            </p>
            <div className="relative mt-5 flex items-center gap-2.5">
              <div className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-full bg-card px-2 shadow-lg shadow-primary/10">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <Search className="h-[18px] w-[18px]" />
                </span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search your dream jobs"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                type="button"
                onClick={startVoiceSearch}
                aria-label="Search jobs by voice"
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary-foreground shadow-md shadow-primary/20 transition ${
                  listening ? "animate-pulse bg-accent" : "bg-primary"
                }`}
              >
                <Mic className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>

          {usingFallback && (
            <p className="mx-4 rounded-full bg-primary/10 px-4 py-2 text-center text-[11px] text-primary">
              Showing nearby demo jobs while live jobs load.
            </p>
          )}

          <section className="worker-categories px-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="worker-section-title text-base">Category</h2>
              {query && (
                <button type="button" onClick={() => setQuery("")} className="text-xs text-primary">
                  Clear
                </button>
              )}
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => setQuery("")}
                className={`shrink-0 rounded-full px-4 py-3 text-xs shadow-sm transition ${
                  query ? "bg-card text-muted-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                All jobs
              </button>
              {services.map((service) => {
                const active = query.toLowerCase() === service.en.toLowerCase();
                const Icon = service.icon;
                return (
                  <button
                    key={service.slug}
                    type="button"
                    onClick={() => setQuery(service.en)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-xs shadow-sm transition ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-primary/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {service.en}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="worker-jobs px-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="worker-section-title text-base">Job match with you</h2>
              <Link to="/worker/applications" className="text-xs text-primary">
                See all
              </Link>
            </div>

            {jobsLoading ? (
              <WorkerJobsSkeleton />
            ) : matchedJobs.length ? (
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {matchedJobs.map((job) => (
                  <JobMatchCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">
                No jobs match your search.
              </p>
            )}
          </section>

          {jobsLoading ? (
            <section className="worker-popular px-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="worker-section-title text-base">Popular jobs near you</h2>
              </div>
              <CardListSkeleton count={2} />
            </section>
          ) : popularJobs.length > 0 ? (
            <section className="worker-popular px-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="worker-section-title text-base">Popular jobs near you</h2>
                <Link to="/worker/applications" className="text-xs text-primary">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {popularJobs.map((job) => (
                  <PopularJobCard key={job.id} job={job} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}

function JobMatchCard({ job }: { job: JobCardData }) {
  const service = services.find((item) => item.slug === job.service);

  return (
    <Link
      to="/worker/job/$id"
      params={{ id: job.id }}
      className="group relative flex min-h-[12.25rem] w-[68%] shrink-0 snap-start flex-col overflow-hidden rounded-[1.45rem] bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100 p-3.5 text-foreground shadow-lg shadow-primary/10 transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <span className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-violet-300/30 blur-2xl" />

      <div className="relative flex items-start justify-between gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/85 text-primary shadow-sm">
          {service && <service.icon className="h-4.5 w-4.5" />}
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/70 text-primary shadow-sm">
          <Bookmark className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="relative mt-2.5 min-w-0">
        <p className="truncate text-[10px] text-primary">{serviceName(job.service, "en")}</p>
        <h3 className="worker-card-title mt-0.5 line-clamp-2 text-[0.95rem] leading-snug">
          {job.title}
        </h3>
        <p className="mt-1.5 flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {job.location} · {job.distanceKm} km
          </span>
        </p>
      </div>

      <div className="relative mt-2.5 flex min-w-0 gap-1.5 text-[9px]">
        <span className="shrink-0 rounded-full bg-white/70 px-2 py-1 text-primary">
          ₹{job.payment}
        </span>
        <span className="min-w-0 truncate rounded-full bg-white/70 px-2 py-1 text-muted-foreground">
          {job.time}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/70 px-2 py-1 text-muted-foreground">
          <Star className="h-2.5 w-2.5 fill-current text-amber-500" /> {job.rating}
        </span>
      </div>

      <div className="relative mt-auto flex items-center justify-between gap-2 pt-3">
        <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-white/75 px-2.5 py-1.5 text-[9px] text-success shadow-sm">
          <ShieldCheck className="h-3 w-3 shrink-0" />
          <span className="truncate">Verified job</span>
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function PopularJobCard({ job }: { job: JobCardData }) {
  const service = services.find((item) => item.slug === job.service);

  return (
    <Link
      to="/worker/job/$id"
      params={{ id: job.id }}
      className="group relative block overflow-hidden rounded-[1.6rem] border border-white bg-gradient-to-br from-white via-white to-blue-50 p-3.5 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <span className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <span className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-primary" />

      <span className="relative flex items-start gap-3">
        <span className="grid h-[3.25rem] w-[3.25rem] shrink-0 place-items-center rounded-[1.15rem] bg-blue-50 text-primary shadow-sm ring-1 ring-blue-100">
          {service && <service.icon className="h-5 w-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block truncate text-[10px] text-primary">
                {serviceName(job.service, "en")}
              </span>
              <span className="worker-card-title mt-0.5 line-clamp-2 text-sm leading-snug">
                {job.title}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[9px] text-primary">
              {job.distanceKm} km
            </span>
          </span>

          <span className="mt-1.5 flex min-w-0 items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{job.location}</span>
          </span>
        </span>
      </span>

      <span className="relative mt-3 flex items-center gap-2 border-t border-primary/10 pt-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[9px] text-success shadow-sm">
          <ShieldCheck className="h-3 w-3" /> Verified
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[9px] text-primary shadow-sm">
          <Wallet className="h-3 w-3" /> ₹{job.payment}
        </span>
        <span className="min-w-0 truncate rounded-full bg-white px-2.5 py-1.5 text-[9px] text-muted-foreground shadow-sm">
          {job.time}
        </span>
        <span className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-background transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </span>
    </Link>
  );
}

function WorkerJobsSkeleton() {
  return (
    <div className="-mx-4 flex gap-3 overflow-hidden px-4" aria-label="Loading job matches">
      {["first", "second"].map((item) => (
        <div
          key={item}
          className="min-h-[12.25rem] w-[68%] shrink-0 animate-pulse rounded-[1.45rem] bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100 p-3.5"
        >
          <div className="h-9 w-9 rounded-full bg-white/70" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-16 rounded-full bg-white/70" />
            <div className="h-4 w-4/5 rounded-full bg-white/70" />
            <div className="h-3 w-3/5 rounded-full bg-white/70" />
          </div>
          <div className="mt-3 flex gap-2">
            <div className="h-6 w-14 rounded-full bg-white/70" />
            <div className="h-6 w-20 rounded-full bg-white/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LocationPopover({
  currentLocation,
  onSave,
  onClose,
}: {
  currentLocation: string;
  onSave: (location: string) => void | Promise<void>;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    setSaving(true);
    await onSave(String(data.get("worker-location") || ""));
    setSaving(false);
  };

  return (
    <form
      onSubmit={submit}
      className="absolute left-4 top-[4.75rem] z-50 w-[min(21rem,calc(100vw-2rem))] rounded-[1.5rem] border border-border bg-card p-3 text-foreground shadow-2xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="worker-card-title text-sm">Change location</p>
          <p className="text-[11px] text-muted-foreground">Nearby jobs use this area</p>
        </div>
        <button type="button" onClick={onClose} className="text-xs text-primary">
          Close
        </button>
      </div>
      <LocationAutocomplete
        key={currentLocation}
        name="worker-location"
        defaultValue={currentLocation}
        placeholder="Search your area"
        required
      />
      <button
        type="submit"
        disabled={saving}
        className="btn-primary mt-3 w-full disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save location"}
      </button>
    </form>
  );
}

function NotificationsPopover({
  items,
  loading,
  onClose,
}: {
  items: ApiNotification[];
  loading: boolean;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-4 top-[4.75rem] z-50 w-[min(20rem,calc(100vw-2rem))] rounded-[1.5rem] border border-border bg-card p-3 text-foreground shadow-2xl">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <p className="worker-card-title text-sm">Notifications</p>
        <button type="button" onClick={onClose} className="text-xs text-primary">
          Close
        </button>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto">
        {loading && <NotificationSkeleton />}
        {!loading && items.length === 0 && (
          <p className="rounded-2xl bg-muted p-4 text-center text-xs text-muted-foreground">
            No notifications yet
          </p>
        )}
        {items.map((item) => {
          const Icon = item.type === "assigned" ? CheckCircle2 : Bell;
          return (
            <div key={item._id} className="flex gap-2.5 rounded-2xl bg-muted/70 p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="worker-card-title block truncate text-xs">{item.title}</span>
                <span className="mt-1 line-clamp-2 block text-[11px] text-muted-foreground">
                  {item.message}
                </span>
              </span>
              {!item.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex animate-pulse gap-3 rounded-2xl bg-muted p-3">
      <span className="h-9 w-9 shrink-0 rounded-full bg-background" />
      <span className="flex-1 space-y-2">
        <span className="block h-3 w-2/3 rounded-full bg-background" />
        <span className="block h-3 w-full rounded-full bg-background" />
      </span>
    </div>
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
    status: job.applicationStatus || job.status,
    distanceKm: 2.5,
    rating: 4.7,
    verified: true,
    wageType: job.urgent ? "Urgent" : "Daily wage",
    applicationStatus: job.applicationStatus,
  };
}

function mapCachedProfile(profile: Record<string, unknown>): ApiWorkerProfile {
  return {
    _id: "",
    userId: "",
    name: String(profile.name || ""),
    phone: String(profile.phone || ""),
    skills: Array.isArray(profile.skills) ? profile.skills.map(String) : [],
    experience: String(profile.experience || ""),
    expectedWage: Number(profile.expectedWage || 0),
    availableToday: Boolean(profile.availableToday),
    preferredDistance: String(profile.preferredDistance || ""),
    location: String(profile.location || profile.area || ""),
    photoUrl: typeof profile.photoUrl === "string" ? profile.photoUrl : undefined,
    documentsUploaded: Boolean(profile.documentsUploaded),
    verified: Boolean(profile.verified),
    rating: Number(profile.rating || 4.5),
    totalJobsCompleted: Number(profile.totalJobsCompleted || 0),
  };
}
