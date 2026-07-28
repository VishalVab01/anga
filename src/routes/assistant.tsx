import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bot, Loader2, Mic, Plus, Search, Send, Sparkles, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { SearchResultsSkeleton } from "@/components/AppLoadingSkeletons";
import { PageShell } from "@/components/PageShell";
import { api, type ApiJob, type ApiWorkerProfile } from "@/lib/api";
import {
  assistantExamples,
  jobs,
  serviceName,
  services,
  workers as fallbackWorkers,
} from "@/lib/data";
import { getRole } from "@/lib/session";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/assistant")({
  head: () => ({ meta: [{ title: "Anga - AI Rozgar Assistant" }] }),
  component: Assistant,
});

type ParsedRequest = {
  roleIntent: "worker" | "customer";
  service: string;
  when: string;
  location: string;
  urgency: "Urgent" | "Normal";
  budget?: number;
  workersNeeded?: number;
  summary: string;
};

function Assistant() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [role, setRole] = useState<"worker" | "customer">("worker");
  const [message, setMessage] = useState(assistantExamples.worker);
  const [parsed, setParsed] = useState<ParsedRequest>(() => parseMessage(message, role));
  const [matchingJobs, setMatchingJobs] = useState<ApiJob[]>([]);
  const [matchingWorkers, setMatchingWorkers] = useState<ApiWorkerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const storedRole = getRole() ?? "worker";
    setRole(storedRole);
    setMessage((currentMessage) => {
      const isDefaultMessage =
        currentMessage === assistantExamples.worker ||
        currentMessage === assistantExamples.customer;
      const nextMessage = isDefaultMessage
        ? storedRole === "worker"
          ? assistantExamples.worker
          : assistantExamples.customer
        : currentMessage;
      setParsed(parseMessage(nextMessage, storedRole));
      return nextMessage;
    });
  }, []);

  const fallbackJobMatches = useMemo(
    () => jobs.filter((job) => !parsed.service || job.service === parsed.service).slice(0, 3),
    [parsed.service],
  );

  const runAssistant = async () => {
    const next = parseMessage(message, role);
    setParsed(next);
    setError("");
    setLoading(true);

    try {
      if (next.roleIntent === "worker") {
        const params = new URLSearchParams();
        if (next.service) params.set("category", next.service);
        if (next.location) params.set("search", next.location);
        const result = await api.nearbyJobs(params.toString() ? `?${params}` : "");
        setMatchingJobs(result.jobs);
        setMatchingWorkers([]);
      } else {
        const params = new URLSearchParams();
        if (next.service) params.set("skill", next.service);
        if (next.location) params.set("search", next.location);
        params.set("availableToday", "true");
        const result = await api.workers(params.toString() ? `?${params}` : "");
        setMatchingWorkers(result.workers);
        setMatchingJobs([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reach assistant API. Showing demo matches.",
      );
      setMatchingJobs([]);
      setMatchingWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
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
          ? "इस ब्राउज़र में आवाज़ उपलब्ध नहीं है"
          : "Voice input is not available in this browser",
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onerror = () => {
      setListening(false);
      toast.error(lang === "hi" ? "आवाज़ समझ नहीं आई" : "Could not understand voice");
    };
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setMessage(transcript);
    };
    recognition.start();
  };

  const createDraftJob = () => {
    sessionStorage.setItem("anga.assistantDraft", JSON.stringify(parsed));
    navigate({ to: "/customer/request" });
  };

  return (
    <PageShell
      title={t("assistant")}
      back={role === "customer" ? "/customer" : "/worker"}
      bottomNav={<BottomNav role={role} />}
    >
      <div className="space-y-5">
        <div className="card-soft bg-primary/5 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold">AI Rozgar Assistant</h2>
              <p className="text-sm text-muted-foreground">{t("speakOrType")}</p>
            </div>
          </div>
        </div>

        <div className="card-soft p-4">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            className="w-full resize-none bg-transparent text-base outline-none"
            placeholder={role === "worker" ? assistantExamples.worker : assistantExamples.customer}
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={startVoice} className="btn-outline">
              {listening ? <Volume2 className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {listening
                ? lang === "hi"
                  ? "सुन रहा है"
                  : "Listening"
                : lang === "hi"
                  ? "बोलें"
                  : "Speak"}
            </button>
            <button
              onClick={runAssistant}
              disabled={loading || !message.trim()}
              className="btn-primary disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {t("parseRequest")}
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setMessage(assistantExamples.worker)}
              className="rounded-full bg-muted px-3 py-2 text-xs font-semibold"
            >
              {assistantExamples.worker}
            </button>
            <button
              onClick={() => setMessage(assistantExamples.customer)}
              className="rounded-full bg-muted px-3 py-2 text-xs font-semibold"
            >
              {assistantExamples.customer}
            </button>
          </div>
        </div>

        <div className="card-soft p-4">
          <div className="mb-3 flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            {lang === "hi" ? "समझी गई जानकारी" : "Structured details"}
          </div>
          <p className="mb-3 rounded-2xl bg-primary/5 p-3 text-sm font-medium text-primary">
            {parsed.summary}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Tag
              label={t("serviceType")}
              value={parsed.service ? serviceName(parsed.service, lang) : "-"}
            />
            <Tag label={t("date")} value={parsed.when || (lang === "hi" ? "आज" : "Today")} />
            <Tag
              label={t("location")}
              value={parsed.location || (lang === "hi" ? "पास में" : "Nearby")}
            />
            <Tag label={t("urgency")} value={parsed.urgency} />
          </div>
        </div>

        {error && (
          <p className="rounded-2xl bg-accent/10 p-3 text-xs font-semibold text-accent">{error}</p>
        )}

        {parsed.roleIntent === "worker" ? (
          <WorkerResults jobs={matchingJobs} fallbackJobs={fallbackJobMatches} loading={loading} />
        ) : (
          <CustomerResults
            workers={matchingWorkers}
            parsed={parsed}
            createDraftJob={createDraftJob}
            loading={loading}
          />
        )}
      </div>
    </PageShell>
  );
}

function WorkerResults({
  jobs: liveJobs,
  fallbackJobs,
  loading,
}: {
  jobs: ApiJob[];
  fallbackJobs: typeof jobs;
  loading: boolean;
}) {
  const { t, lang } = useT();
  const hasLive = liveJobs.length > 0;
  return (
    <section>
      <h3 className="mb-3 font-bold">{t("matchingJobs")}</h3>
      <div className="space-y-3">
        {loading && <SearchResultsSkeleton />}
        {!loading && !hasLive && fallbackJobs.length === 0 && (
          <EmptyText text={lang === "hi" ? "काम नहीं मिला" : "No jobs found"} />
        )}
        {hasLive
          ? liveJobs.map((job) => (
              <Link
                key={job._id}
                to="/worker/job/$id"
                params={{ id: job._id }}
                className="card-soft card-soft-hover flex items-center gap-3 p-4"
              >
                <Search className="h-5 w-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{job.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.location} · ₹{job.wage} · {job.date || "Today"}
                  </p>
                </div>
              </Link>
            ))
          : fallbackJobs.map((job) => (
              <Link
                key={job.id}
                to="/worker/job/$id"
                params={{ id: job.id }}
                className="card-soft card-soft-hover flex items-center gap-3 p-4"
              >
                <Search className="h-5 w-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{job.title[lang]}</p>
                  <p className="text-xs text-muted-foreground">
                    {job.location[lang]} · ₹{job.payment} · {job.distanceKm} km
                  </p>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}

function CustomerResults({
  workers: liveWorkers,
  parsed,
  createDraftJob,
  loading,
}: {
  workers: ApiWorkerProfile[];
  parsed: ParsedRequest;
  createDraftJob: () => void;
  loading: boolean;
}) {
  const { t, lang } = useT();
  const fallback = fallbackWorkers
    .filter((worker) => !parsed.service || worker.skill === parsed.service)
    .slice(0, 3);
  const hasLive = liveWorkers.length > 0;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-bold">{t("matchingWorkers")}</h3>
        <button
          onClick={createDraftJob}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
        >
          <Plus className="h-3 w-3" /> {t("postJob")}
        </button>
      </div>
      <div className="space-y-3">
        {loading && <SearchResultsSkeleton />}
        {!loading && !hasLive && fallback.length === 0 && (
          <EmptyText text={lang === "hi" ? "मजदूर नहीं मिले" : "No workers found"} />
        )}
        {hasLive
          ? liveWorkers.map((worker) => (
              <Link
                key={worker._id}
                to="/customer/worker/$id"
                params={{ id: worker.userId }}
                className="card-soft card-soft-hover flex items-center gap-3 p-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  {worker.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{worker.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {serviceName(worker.skills[0], lang)} · ₹{worker.expectedWage} ·{" "}
                    {worker.location}
                  </p>
                </div>
              </Link>
            ))
          : fallback.map((worker) => (
              <Link
                key={worker.id}
                to="/customer/worker/$id"
                params={{ id: worker.id }}
                className="card-soft card-soft-hover flex items-center gap-3 p-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  {worker.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{worker.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {serviceName(worker.skill, lang)} · ₹{worker.expectedWage} · {worker.distanceKm}{" "}
                    km
                  </p>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}

function parseMessage(message: string, currentRole: "worker" | "customer"): ParsedRequest {
  const text = normalize(message);
  const service = detectService(text);
  const when = detectWhen(text);
  const location = detectLocation(message);
  const urgency = /urgent|turant|jaldi|emergency|तुरंत|जरूरी|आज/.test(text) ? "Urgent" : "Normal";
  const budget = detectNumber(text, ["rs", "₹", "rupee", "budget", "wage", "मजदूरी", "बजट"]);
  const workersNeeded = detectWorkersNeeded(text);
  const roleIntent = detectRoleIntent(text, currentRole);
  const summary =
    roleIntent === "worker"
      ? `Looking for ${service || "any"} work ${when || "nearby"}${location ? ` in ${location}` : ""}.`
      : `Need ${workersNeeded || 1} ${service || "worker"}${workersNeeded && workersNeeded > 1 ? "s" : ""} ${when || "soon"}${location ? ` in ${location}` : ""}${budget ? `, budget ₹${budget}` : ""}.`;

  return { roleIntent, service, when, location, urgency, budget, workersNeeded, summary };
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[.,!?]/g, " ");
}

function detectService(text: string) {
  const aliases: Record<string, string[]> = {
    electrician: [
      "electrician",
      "electric",
      "bijli",
      "wire",
      "fan",
      "इलेक्ट्रीशियन",
      "बिजली",
      "पंखा",
    ],
    plumber: ["plumber", "plumbing", "sink", "pipe", "leak", "tap", "प्लंबर", "नल", "पाइप", "लीक"],
    carpenter: ["carpenter", "wood", "furniture", "wardrobe", "बढ़ई", "लकड़ी", "अलमारी"],
    painter: ["painter", "painting", "paint", "पेंटर", "पेंट"],
    "ac-repair": ["ac", "a/c", "air conditioner", "cooling", "एसी"],
    driver: ["driver", "driving", "drive", "ड्राइवर", "गाड़ी"],
    "house-help": ["house help", "maid", "cleaning", "cook", "घर", "सफाई", "कामवाली"],
    delivery: ["delivery", "parcel", "डिलीवरी"],
  };
  return (
    Object.entries(aliases).find(([, words]) => words.some((word) => text.includes(word)))?.[0] ||
    ""
  );
}

function detectWhen(text: string) {
  if (/tomorrow|kal|कल/.test(text)) return "Tomorrow";
  if (/today|aaj|आज/.test(text)) return "Today";
  if (/weekend|saturday|sunday|सप्ताह/.test(text)) return "Weekend";
  return "";
}

function detectLocation(message: string) {
  const known = [
    "Mumbai",
    "Delhi",
    "Bengaluru",
    "Lucknow",
    "Andheri",
    "Koramangala",
    "Gomti Nagar",
    "Sector 21",
  ];
  return known.find((place) => message.toLowerCase().includes(place.toLowerCase())) || "";
}

function detectNumber(text: string, hints: string[]) {
  if (!hints.some((hint) => text.includes(hint))) return undefined;
  const match = text.match(/\b(\d{3,6})\b/);
  return match ? Number(match[1]) : undefined;
}

function detectWorkersNeeded(text: string) {
  const match = text.match(/\b([1-9])\s*(worker|workers|मजदूर|लोग)/);
  return match ? Number(match[1]) : undefined;
}

function detectRoleIntent(text: string, currentRole: "worker" | "customer") {
  if (/kaam chahiye|work chahiye|job chahiye|kaam|job|work|काम|रोजगार|ढूंढ/.test(text)) {
    if (
      !/repair|fix|hire|worker chahiye|plumber chahiye|electrician chahiye|painter chahiye|driver chahiye|करवाना/.test(
        text,
      )
    ) {
      return "worker";
    }
  }
  if (/chahiye|need|hire|repair|fix|करवाना|चाहिए/.test(text)) return "customer";
  return currentRole;
}

function Tag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted p-3">
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <p className="rounded-2xl bg-muted p-6 text-center text-sm text-muted-foreground">{text}</p>
  );
}

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
