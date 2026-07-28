import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  Loader2,
  MapPin,
  Mic,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Volume2,
  Wallet,
  WandSparkles,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { SearchResultsSkeleton } from "@/components/AppLoadingSkeletons";
import { AppShell } from "@/components/AppShell";
import { BottomNav } from "@/components/BottomNav";
import { api, type ApiJob, type ApiWorkerProfile } from "@/lib/api";
import { assistantExamples, jobs, serviceName, workers as fallbackWorkers } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { answerWithRag, type RagSource } from "@/lib/ragAssistant";
import { getProfile, getRole } from "@/lib/session";

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

type AssistantIntent = "worker-search" | "customer-search" | "knowledge";

type ConversationTurn = {
  id: number;
  question: string;
  answer: string;
};

function Assistant() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [role, setRole] = useState<"worker" | "customer">("worker");
  const [message, setMessage] = useState("");
  const [parsed, setParsed] = useState<ParsedRequest>(() => parseMessage("", "worker"));
  const [matchingJobs, setMatchingJobs] = useState<ApiJob[]>([]);
  const [matchingWorkers, setMatchingWorkers] = useState<ApiWorkerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [userName, setUserName] = useState("there");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [latestIntent, setLatestIntent] = useState<AssistantIntent>("knowledge");
  const [ragSources, setRagSources] = useState<RagSource[]>([]);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const storedRole = getRole() ?? "worker";
    const cachedProfile = getProfile(storedRole);
    const savedName = typeof cachedProfile?.name === "string" ? cachedProfile.name.trim() : "";

    setRole(storedRole);
    setUserName(
      savedName ? savedName.split(/\s+/)[0] : storedRole === "worker" ? "friend" : "there",
    );
    setParsed(parseMessage("", storedRole));
  }, []);

  const fallbackJobMatches = useMemo(() => {
    const matches = jobs.filter((job) => !parsed.service || job.service === parsed.service);
    return parsed.service ? matches : matches.slice(0, 4);
  }, [parsed.service]);

  const suggestions =
    role === "worker"
      ? [
          {
            icon: BriefcaseBusiness,
            title: "Find work today",
            prompt: assistantExamples.worker,
          },
          {
            icon: MapPin,
            title: "Jobs near me",
            prompt: "Show me nearby jobs available today",
          },
          {
            icon: Wallet,
            title: "Better-paying jobs",
            prompt: "Find high paying daily-wage jobs near me",
          },
          {
            icon: ShieldCheck,
            title: "Work safely",
            prompt: "How can I verify a customer and work safely?",
          },
        ]
      : [
          {
            icon: Users,
            title: "Find a worker",
            prompt: assistantExamples.customer,
          },
          {
            icon: Plus,
            title: "Create a job post",
            prompt: "Help me create a job post for tomorrow",
          },
          {
            icon: MapPin,
            title: "Workers nearby",
            prompt: "Show trusted workers available near me today",
          },
          {
            icon: ShieldCheck,
            title: "Hire with confidence",
            prompt: "How do I safely hire and verify a worker?",
          },
        ];

  const runAssistant = async () => {
    const question = message.trim();
    if (!question || loading) return;

    const next = parseMessage(question, role);
    const intent = classifyAssistantIntent(question, next, role);
    const ragAnswer = answerWithRag(question, lang);
    let assistantAnswer = ragAnswer.answer;

    setMessage("");
    setParsed(next);
    setLatestIntent(intent);
    setPendingQuestion(question);
    setRagSources([]);
    setFollowUpSuggestions([]);
    setError("");
    setLoading(true);
    setHasRun(true);
    setMatchingJobs([]);
    setMatchingWorkers([]);

    if (intent === "knowledge") {
      await new Promise((resolve) => window.setTimeout(resolve, 320));
      setTurns((current) => [...current, { id: Date.now(), question, answer: ragAnswer.answer }]);
      setPendingQuestion("");
      setRagSources(ragAnswer.sources);
      setFollowUpSuggestions(ragAnswer.suggestions);
      setLoading(false);
      return;
    }

    try {
      if (intent === "worker-search") {
        const params = new URLSearchParams();
        if (next.service) params.set("category", next.service);
        if (next.location) params.set("search", next.location);
        const result = await api.nearbyJobs(params.toString() ? `?${params}` : "");
        setMatchingJobs(result.jobs);
        const fallbackCount = jobs.filter(
          (job) => !next.service || job.service === next.service,
        ).length;
        assistantAnswer = buildMatchingReply(
          next,
          intent,
          result.jobs.length || fallbackCount,
          lang,
        );
      } else {
        const params = new URLSearchParams();
        if (next.service) params.set("skill", next.service);
        if (next.location) params.set("search", next.location);
        params.set("availableToday", "true");
        const result = await api.workers(params.toString() ? `?${params}` : "");
        setMatchingWorkers(result.workers);
        const fallbackCount = fallbackWorkers.filter(
          (worker) => !next.service || worker.skill === next.service,
        ).length;
        assistantAnswer = buildMatchingReply(
          next,
          intent,
          result.workers.length || fallbackCount,
          lang,
        );
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Assistant API unavailable");
      const fallbackCount =
        intent === "worker-search"
          ? jobs.filter((job) => !next.service || job.service === next.service).length
          : fallbackWorkers.filter((worker) => !next.service || worker.skill === next.service)
              .length;
      assistantAnswer = buildMatchingReply(next, intent, fallbackCount, lang);
    } finally {
      setTurns((current) => [...current, { id: Date.now(), question, answer: assistantAnswer }]);
      setPendingQuestion("");
      setFollowUpSuggestions(ragAnswer.suggestions);
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

  const startNewRequest = () => {
    setHasRun(false);
    setMessage("");
    setError("");
    setMatchingJobs([]);
    setMatchingWorkers([]);
    setTurns([]);
    setPendingQuestion("");
    setRagSources([]);
    setFollowUpSuggestions([]);
  };

  return (
    <AppShell className="assistant-page-bg text-foreground">
      <div
        className={`assistant-screen relative flex min-h-[100dvh] flex-col overflow-hidden ${hasRun ? "is-results" : "is-home"}`}
      >
        <span className="assistant-ambient assistant-ambient-one" aria-hidden="true" />
        <span className="assistant-ambient assistant-ambient-two" aria-hidden="true" />

        <header className="assistant-header relative z-20 flex items-center justify-between px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
          <Link
            to={role === "customer" ? "/customer" : "/worker"}
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-white/75 text-primary shadow-sm backdrop-blur-xl"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </Link>

          <div className="text-center">
            <p className="assistant-brand text-lg tracking-[-0.035em] text-primary">anga AI</p>
            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online and ready
            </span>
          </div>

          <button
            type="button"
            onClick={startNewRequest}
            aria-label="Start a new AI request"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-white/75 text-primary shadow-sm backdrop-blur-xl"
          >
            <Sparkles className="h-[18px] w-[18px]" />
          </button>
        </header>

        <main className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 pb-[11rem]">
          <section className={`assistant-hero text-center ${hasRun ? "pb-4 pt-2" : "pb-5 pt-4"}`}>
            <h1 className="assistant-heading text-[1.85rem] leading-tight tracking-[-0.045em]">
              Hello, {userName}!
            </h1>
            <p className="mx-auto mt-1 max-w-[17rem] text-sm leading-5 text-muted-foreground">
              {hasRun
                ? "Ask a follow-up or refine your request."
                : "How can I help you find work or hire today?"}
            </p>

            <div
              className={`assistant-orb mx-auto ${hasRun ? "mt-4 is-compact" : "mt-7"} ${
                listening ? "is-listening" : ""
              } ${loading ? "is-thinking" : ""}`}
              aria-hidden="true"
            >
              <span className="assistant-orb-ring" />
              <span className="assistant-orb-face">
                <span />
                <span />
              </span>
            </div>

            <p className="assistant-orb-caption mt-3 text-[11px] text-primary" aria-live="polite">
              {loading
                ? latestIntent === "knowledge"
                  ? "Thinking with Anga’s knowledge…"
                  : "Finding the best Anga matches…"
                : listening
                  ? "Listening… speak naturally"
                  : hasRun
                    ? "You can refine your request below"
                    : "Ask in English, Hindi, or Hinglish"}
            </p>
          </section>

          {!hasRun ? (
            <section className="assistant-actions mx-auto max-w-sm">
              <div className="grid grid-cols-2 gap-2.5">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => {
                        setMessage(suggestion.prompt);
                        setError("");
                      }}
                      className="assistant-suggestion group flex min-h-[4.2rem] items-center gap-2.5 rounded-[1.35rem] border border-white/80 bg-white/70 px-3 text-left text-xs text-foreground shadow-sm backdrop-blur-xl transition active:scale-[0.98]"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{suggestion.title}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="space-y-4">
              <ConversationThread
                turns={turns}
                pendingQuestion={pendingQuestion}
                loading={loading}
              />

              {latestIntent !== "knowledge" && (
                <section className="assistant-insight-card rounded-[1.8rem] border border-white/80 bg-white/75 p-4 shadow-[0_18px_45px_-30px_rgba(30,64,175,0.55)] backdrop-blur-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white">
                      <WandSparkles className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="assistant-section-title text-sm">Search details</h2>
                      <p className="text-[10px] text-muted-foreground">
                        Anga understood these details from your message
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 rounded-[1.2rem] bg-primary/10 px-3.5 py-3 text-xs leading-5 text-primary">
                    {parsed.summary}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <DetailPill
                      icon={<BriefcaseBusiness />}
                      label={t("serviceType")}
                      value={parsed.service ? serviceName(parsed.service, lang) : "Any service"}
                    />
                    <DetailPill
                      icon={<CalendarClock />}
                      label={t("date")}
                      value={parsed.when || "Today"}
                    />
                    <DetailPill
                      icon={<MapPin />}
                      label={t("location")}
                      value={parsed.location || "Nearby"}
                    />
                    <DetailPill icon={<Sparkles />} label={t("urgency")} value={parsed.urgency} />
                  </div>
                </section>
              )}

              {error && (
                <p className="rounded-[1.25rem] border border-amber-100 bg-amber-50/90 px-4 py-3 text-xs text-amber-700">
                  Live results are unavailable, so Anga is showing relevant demo matches.
                </p>
              )}

              {latestIntent === "worker-search" ? (
                <WorkerResults
                  jobs={matchingJobs}
                  fallbackJobs={fallbackJobMatches}
                  loading={loading}
                />
              ) : latestIntent === "customer-search" ? (
                <CustomerResults
                  workers={matchingWorkers}
                  parsed={parsed}
                  createDraftJob={createDraftJob}
                  loading={loading}
                />
              ) : (
                <KnowledgeResults sources={ragSources} />
              )}

              {!loading && followUpSuggestions.length > 0 && (
                <section className="flex flex-wrap gap-2 pb-2">
                  {followUpSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setMessage(suggestion)}
                      className="rounded-full border border-white/90 bg-white/75 px-3 py-2 text-[10px] text-primary shadow-sm backdrop-blur-xl"
                    >
                      {suggestion}
                    </button>
                  ))}
                </section>
              )}
            </div>
          )}
        </main>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runAssistant();
          }}
          className="assistant-composer fixed left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-[24.75rem] -translate-x-1/2 items-center gap-2"
        >
          <div className="flex min-h-14 min-w-0 flex-1 items-center gap-2 rounded-full border border-white/90 bg-white/90 p-1.5 pl-4 shadow-[0_18px_42px_-20px_rgba(30,64,175,0.6)] backdrop-blur-xl">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about jobs, workers, or Anga…"
              aria-label="Ask Anga AI"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              aria-label="Send request"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white shadow-md shadow-primary/20 transition active:scale-95 disabled:opacity-40"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={startVoice}
            aria-label={listening ? "Listening" : "Use voice input"}
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-white shadow-[0_15px_32px_-14px_rgba(45,103,235,0.8)] transition active:scale-95 ${
              listening ? "animate-pulse bg-violet-500" : "bg-primary"
            }`}
          >
            {listening ? (
              <Volume2 className="h-[18px] w-[18px]" />
            ) : (
              <Mic className="h-[18px] w-[18px]" />
            )}
          </button>
        </form>

        <BottomNav role={role} />
      </div>
    </AppShell>
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
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="assistant-section-title text-sm">{t("matchingJobs")}</h3>
        <span className="text-[10px] text-primary">Selected for you</span>
      </div>
      <div className="space-y-2.5">
        {loading && <SearchResultsSkeleton />}
        {!loading && !hasLive && fallbackJobs.length === 0 && <EmptyText text="No jobs found" />}
        {hasLive
          ? liveJobs.map((job) => (
              <AssistantResultCard
                key={job._id}
                to="/worker/job/$id"
                id={job._id}
                icon={<BriefcaseBusiness />}
                eyebrow="Nearby job"
                title={job.title}
                details={`${job.location} · ₹${job.wage} · ${job.date || "Today"}`}
              />
            ))
          : fallbackJobs.map((job) => (
              <AssistantResultCard
                key={job.id}
                to="/worker/job/$id"
                id={job.id}
                icon={<BriefcaseBusiness />}
                eyebrow={serviceName(job.service, lang)}
                title={job.title[lang]}
                details={`${job.location[lang]} · ₹${job.payment} · ${job.distanceKm} km`}
              />
            ))}
      </div>
    </section>
  );
}

function ConversationThread({
  turns,
  pendingQuestion,
  loading,
}: {
  turns: ConversationTurn[];
  pendingQuestion: string;
  loading: boolean;
}) {
  return (
    <section className="space-y-3" aria-label="Conversation" aria-live="polite">
      {turns.map((turn) => (
        <div key={turn.id} className="space-y-2.5">
          <div className="flex justify-end">
            <p className="max-w-[86%] rounded-[1.25rem] rounded-br-md bg-primary px-3.5 py-2.5 text-xs leading-5 text-white shadow-sm">
              {turn.question}
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-primary text-white shadow-md shadow-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="max-w-[86%] whitespace-pre-line rounded-[1.35rem] rounded-tl-md border border-white/80 bg-white/80 px-3.5 py-3 text-xs leading-5 text-foreground shadow-sm backdrop-blur-xl">
              {turn.answer}
            </p>
          </div>
        </div>
      ))}

      {pendingQuestion && (
        <div className="space-y-2.5">
          <div className="flex justify-end">
            <p className="max-w-[86%] rounded-[1.25rem] rounded-br-md bg-primary px-3.5 py-2.5 text-xs leading-5 text-white shadow-sm">
              {pendingQuestion}
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-primary text-white shadow-md shadow-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3.5 py-2.5 text-[11px] text-muted-foreground shadow-sm backdrop-blur-xl">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Anga is thinking
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function KnowledgeResults({ sources }: { sources: RagSource[] }) {
  if (sources.length === 0) return null;

  return (
    <section>
      <h3 className="assistant-section-title mb-2.5 text-sm">Helpful Anga information</h3>
      <div className="space-y-2.5">
        {sources.map((source) => {
          const Icon =
            source.type === "job"
              ? BriefcaseBusiness
              : source.type === "worker"
                ? Users
                : source.type === "safety"
                  ? ShieldCheck
                  : Sparkles;

          return (
            <article
              key={source.id}
              className="rounded-[1.4rem] border border-white/80 bg-white/75 p-3.5 shadow-sm backdrop-blur-xl"
            >
              <div className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="assistant-card-title text-xs">{source.title}</h4>
                  <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{source.body}</p>
                  {source.actionTo && source.actionLabel && (
                    <a
                      href={source.actionTo}
                      className="mt-2 inline-flex items-center gap-1 text-[10px] text-primary"
                    >
                      {source.actionLabel} <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
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
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h3 className="assistant-section-title text-sm">{t("matchingWorkers")}</h3>
        <button
          type="button"
          onClick={createDraftJob}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-[10px] text-white"
        >
          <Plus className="h-3 w-3" /> {t("postJob")}
        </button>
      </div>
      <div className="space-y-2.5">
        {loading && <SearchResultsSkeleton />}
        {!loading && !hasLive && fallback.length === 0 && <EmptyText text="No workers found" />}
        {hasLive
          ? liveWorkers.map((worker) => (
              <AssistantResultCard
                key={worker._id}
                to="/customer/worker/$id"
                id={worker.userId}
                icon={<Users />}
                eyebrow={serviceName(worker.skills[0], lang)}
                title={worker.name}
                details={`₹${worker.expectedWage} · ${worker.location}`}
              />
            ))
          : fallback.map((worker) => (
              <AssistantResultCard
                key={worker.id}
                to="/customer/worker/$id"
                id={worker.id}
                icon={<Users />}
                eyebrow={serviceName(worker.skill, lang)}
                title={worker.name}
                details={`₹${worker.expectedWage} · ${worker.distanceKm} km away`}
              />
            ))}
      </div>
    </section>
  );
}

function AssistantResultCard({
  to,
  id,
  icon,
  eyebrow,
  title,
  details,
}: {
  to: "/worker/job/$id" | "/customer/worker/$id";
  id: string;
  icon: ReactNode;
  eyebrow: string;
  title: string;
  details: string;
}) {
  return (
    <Link
      to={to}
      params={{ id }}
      className="group flex items-center gap-3 rounded-[1.45rem] border border-white/80 bg-white/75 p-3 shadow-[0_12px_35px_-28px_rgba(30,64,175,0.7)] backdrop-blur-xl transition active:scale-[0.99]"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[1rem] bg-blue-50 text-primary [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[9px] text-primary">{eyebrow}</span>
        <span className="assistant-card-title mt-0.5 block truncate text-sm">{title}</span>
        <span className="mt-1 block truncate text-[10px] text-muted-foreground">{details}</span>
      </span>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-background transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

function DetailPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-[1.1rem] bg-blue-50/80 p-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm [&>svg]:h-3.5 [&>svg]:w-3.5">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[9px] text-muted-foreground">{label}</p>
        <p className="truncate text-[11px] text-foreground">{value}</p>
      </div>
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <p className="rounded-[1.5rem] border border-white/80 bg-white/70 p-6 text-center text-xs text-muted-foreground backdrop-blur-xl">
      {text}
    </p>
  );
}

function classifyAssistantIntent(
  question: string,
  parsed: ParsedRequest,
  currentRole: "worker" | "customer",
): AssistantIntent {
  const text = normalize(question);
  const asksForInformation =
    /\b(how|what|why|can i|should i|help|safe|safety|payment|otp|profile|verify|verified)\b/.test(
      text,
    );
  if (asksForInformation) return "knowledge";

  const asksForJobs =
    /\b(job|jobs|work|opening|openings|vacancy|vacancies|kaam|rozgar|apply)\b/.test(text);
  if (asksForJobs) return "worker-search";

  const asksForWorkers = /\b(worker|workers|hire|hiring|need|chahiye|repair|fix|available)\b/.test(
    text,
  );
  if (asksForWorkers) return "customer-search";

  if (parsed.service) {
    return currentRole === "worker" ? "worker-search" : "customer-search";
  }

  return "knowledge";
}

function buildMatchingReply(
  parsed: ParsedRequest,
  intent: Exclude<AssistantIntent, "knowledge">,
  count: number,
  lang: "en" | "hi",
) {
  const service = parsed.service ? serviceName(parsed.service, lang).toLowerCase() : "";

  if (intent === "worker-search") {
    const label = service ? `${service} job` : "nearby job";
    if (count === 0) {
      return lang === "hi"
        ? "Mujhe abhi exact job match nahi mila. Aap location, skill ya timing badal kar dobara pooch sakte hain."
        : "I could not find an exact job match right now. Try adding a location, skill, or preferred time.";
    }
    return lang === "hi"
      ? `Bilkul! Mujhe ${count} ${label}${count === 1 ? "" : "s"} mile. Neeche pay, location aur timing compare karke kisi bhi job ko khol sakte hain.`
      : `Absolutely! I found ${count} ${label}${count === 1 ? "" : "s"}. Compare the pay, location, and timing below, then open any job for details.`;
  }

  const label = service ? `${service} worker` : "trusted worker";
  if (count === 0) {
    return lang === "hi"
      ? "Mujhe abhi exact worker match nahi mila. Skill, location ya date badal kar dobara pooch sakte hain."
      : "I could not find an exact worker match right now. Try changing the skill, location, or date.";
  }
  return lang === "hi"
    ? `Mujhe ${count} ${label}${count === 1 ? "" : "s"} mile. Neeche rating, expected wage aur availability compare kar sakte hain.`
    : `I found ${count} ${label}${count === 1 ? "" : "s"}. Compare ratings, expected wages, and availability below.`;
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
