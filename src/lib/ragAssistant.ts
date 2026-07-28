import { jobs, seedRequests, serviceName, services, workers } from "./data";

export type RagSource = {
  id: string;
  title: string;
  body: string;
  type: "job" | "worker" | "request" | "help" | "safety";
  actionLabel?: string;
  actionTo?: string;
};

export type RagAnswer = {
  answer: string;
  sources: RagSource[];
  suggestions: string[];
};

type Lang = "en" | "hi";

const helpSources: RagSource[] = [
  {
    id: "help-worker-start",
    type: "help",
    title: "How workers find nearby work",
    body: "Workers create a profile with phone, area, skills, experience, expected daily wage, availability and documents. The worker dashboard shows nearby jobs with wage, distance, timing, customer rating and application status.",
    actionLabel: "Open jobs",
    actionTo: "/worker",
  },
  {
    id: "help-customer-start",
    type: "help",
    title: "How customers hire workers",
    body: "Customers post a job with service type, description, location, date, time, budget, urgency and number of workers. Applicants can be compared by skill, rating, experience, distance, expected wage and verification status.",
    actionLabel: "Post job",
    actionTo: "/customer/request",
  },
  {
    id: "help-otp",
    type: "help",
    title: "Mobile OTP login",
    body: "Anga uses mobile number and OTP for login. No email or password is needed. In local demo mode the OTP is 1234 after Send OTP succeeds.",
    actionLabel: "Login",
    actionTo: "/role-selection",
  },
  {
    id: "help-roles",
    type: "help",
    title: "Worker and customer roles",
    body: "Workers search and apply for daily-wage jobs. Customers post work, review applicants, assign workers, complete jobs and rate the experience.",
    actionLabel: "Choose role",
    actionTo: "/role-selection",
  },
  {
    id: "safety-trust",
    type: "safety",
    title: "Trust and safety",
    body: "Look for verified badges, document uploaded badges, ratings and completed jobs before accepting work or assigning a worker. After a job is accepted, use report issue or SOS for safety problems.",
    actionLabel: "Safety info",
    actionTo: "/assistant",
  },
  {
    id: "safety-payment",
    type: "safety",
    title: "Daily wage and payment clarity",
    body: "Every job card should show wage, payment type, work timing, location and distance. Confirm materials, extra charges and payment mode before starting work.",
  },
  {
    id: "help-language",
    type: "help",
    title: "Hindi and English support",
    body: "Anga supports simple Hindi and English flows so local workers and customers can use the app comfortably.",
  },
];

export function answerWithRag(query: string, lang: Lang): RagAnswer {
  const cleanQuery = query.trim();
  const sources = buildKnowledge(lang);

  if (!cleanQuery) {
    return {
      answer:
        lang === "hi"
          ? "Mujhse nearby jobs, workers, OTP login, profile setup, safety ya payment ke baare mein pooch sakte hain."
          : "Ask me about nearby jobs, workers, OTP login, profile setup, safety, payments or how to use Anga.",
      sources: sources.slice(0, 3),
      suggestions: defaultSuggestions(lang),
    };
  }

  const greeting = answerGreeting(cleanQuery, lang);
  if (greeting) return greeting;

  const intentAnswer = answerByIntent(cleanQuery, sources, lang);
  if (intentAnswer) return intentAnswer;

  const ranked = rankSources(cleanQuery, sources);
  const topSources = ranked.slice(0, 3);

  if (topSources.length === 0) {
    return {
      answer:
        lang === "hi"
          ? "Mujhe is sawaal ka exact match nahi mila, lekin Anga mein aap jobs, verified workers, applications, payment clarity aur safety help dekh sakte hain."
          : "I could not find an exact match, but Anga can help with jobs, verified workers, applications, payment clarity and safety support.",
      sources: sources.slice(0, 2),
      suggestions: defaultSuggestions(lang),
    };
  }

  const primary = topSources[0];
  const details = topSources
    .map((source) => `- ${source.title}: ${summarize(source.body)}`)
    .join("\n");

  return {
    answer:
      lang === "hi"
        ? `Yeh Anga ke data se related information hai:\n${details}\n\nSabse useful next step: ${nextStep(primary, lang)}`
        : `Here is the most relevant Anga information:\n${details}\n\nBest next step: ${nextStep(primary, lang)}`,
    sources: topSources,
    suggestions: relatedSuggestions(primary, lang),
  };
}

function answerByIntent(query: string, sources: RagSource[], lang: Lang): RagAnswer | null {
  const normalized = query.toLowerCase();
  const requestedService = services.find((service) =>
    [service.slug, service.en, service.hi].some((name) => normalized.includes(name.toLowerCase())),
  );
  const wantsServiceJobs =
    Boolean(requestedService) &&
    /job|jobs|work|opening|vacancy|kaam|dikhao|show|find|chahiye/.test(normalized);
  const wantsTodayJobs =
    /today|aaj|आज|kaam chahiye|काम चाहिए|job|jobs|work/.test(normalized) &&
    /today|aaj|आज|show|dikhao|दिखाओ/.test(normalized);
  const wantsVerifiedWorkers =
    /verified|verify|trusted|badge|document|rating|भरोसे|वेरिफाइड/.test(normalized) &&
    /worker|workers|plumber|electrician|hire|मज़दूर|worker/.test(normalized);
  const wantsPaymentSafety =
    /payment|pay|wage|cash|upi|safe|budget|पैसे|भुगतान|मजदूरी/.test(normalized) &&
    /safe|safety|secure|clarity|कैसे|how|रख/.test(normalized);

  if (requestedService && wantsServiceJobs) {
    const serviceLabel = requestedService.en;
    const jobSources = sources.filter(
      (source) =>
        source.type === "job" &&
        `${source.title} ${source.body}`.toLowerCase().includes(serviceLabel.toLowerCase()),
    );

    return {
      answer:
        lang === "hi"
          ? `Bilkul! Mujhe ${serviceLabel} ke ${jobSources.length} matching jobs mile. Neeche wage, location aur timing compare karke job detail khol sakte hain.`
          : `Absolutely! I found ${jobSources.length} matching ${serviceLabel.toLowerCase()} job${jobSources.length === 1 ? "" : "s"}. Compare the pay, location and timing below, then open any job for details.`,
      sources: jobSources,
      suggestions:
        lang === "hi"
          ? ["Aaj ke jobs dikhao", "Sabse paas ka job kaunsa hai?", "Apply kaise karu?"]
          : ["Show today's jobs", "Which job is closest?", "How do I apply?"],
    };
  }

  if (wantsTodayJobs) {
    const jobSources = sources
      .filter((source) => source.type === "job")
      .filter((source) => /today|आज|aaj/i.test(source.body) || source.body.includes("Today"))
      .slice(0, 3);

    return {
      answer:
        lang === "hi"
          ? "Aaj ke nearby job posts yeh rahe. Wage, time, distance aur customer rating check karke job detail kholkar apply karein."
          : "Here are today’s nearby job posts. Check wage, timing, distance and customer rating, then open the job detail to apply.",
      sources: jobSources.length
        ? jobSources
        : sources.filter((source) => source.type === "job").slice(0, 3),
      suggestions:
        lang === "hi"
          ? ["Electrician jobs dikhao", "Payment kitna hai?", "Apply kaise karu?"]
          : ["Show electrician jobs", "What is the payment?", "How do I apply?"],
    };
  }

  if (wantsVerifiedWorkers) {
    const workerSources = sources
      .filter((source) => source.type === "worker")
      .filter((source) => /verified worker|document uploaded|rating/i.test(source.body))
      .slice(0, 3);

    return {
      answer:
        lang === "hi"
          ? "Verified worker choose karte waqt verified badge, document uploaded badge, rating, experience aur expected wage compare karein. Worker profile kholkar call ya assign kar sakte hain."
          : "To find verified workers, compare the verified badge, document uploaded badge, rating, experience and expected wage. Open a worker profile to call or assign them.",
      sources: workerSources,
      suggestions:
        lang === "hi"
          ? [
              "Available today workers dikhao",
              "Expected wage kya hai?",
              "Document badge ka matlab?",
            ]
          : [
              "Show workers available today",
              "What is the expected wage?",
              "What does document badge mean?",
            ],
    };
  }

  if (wantsPaymentSafety) {
    const safetySources = sources
      .filter((source) => source.id === "safety-payment" || source.id === "safety-trust")
      .slice(0, 3);

    return {
      answer:
        lang === "hi"
          ? "Payment safe rakhne ke liye kaam start hone se pehle daily wage, payment mode, material cost, extra charges aur completion time confirm karein. Accepted job ke baad issue ho to Report/SOS use karein."
          : "To keep payment safe, confirm daily wage, payment mode, material cost, extra charges and completion time before work starts. After a job is accepted, use Report/SOS if something goes wrong.",
      sources: safetySources,
      suggestions:
        lang === "hi"
          ? [
              "Daily wage kya hota hai?",
              "Report issue kaise karu?",
              "Verified customer kaise check karu?",
            ]
          : [
              "What is daily wage?",
              "How do I report an issue?",
              "How do I check verified customers?",
            ],
    };
  }

  return null;
}

function answerGreeting(query: string, lang: Lang): RagAnswer | null {
  const normalized = query.toLowerCase().trim();
  const hasGreeting =
    /\b(hello|hi|hey|good morning|good afternoon|good evening|namaste|namaskar)\b/.test(normalized);
  const alsoContainsRequest =
    /job|jobs|work|worker|hire|payment|safety|otp|profile|apply|kaam|chahiye/.test(normalized) ||
    services.some((service) =>
      [service.slug, service.en, service.hi].some((name) =>
        normalized.includes(name.toLowerCase()),
      ),
    );

  if (!hasGreeting || alsoContainsRequest) return null;

  const greeting = normalized.includes("good morning")
    ? "Good morning"
    : normalized.includes("good afternoon")
      ? "Good afternoon"
      : normalized.includes("good evening")
        ? "Good evening"
        : "Hi";

  return {
    answer:
      lang === "hi"
        ? "Namaste! Aaj main aapki kya madad kar sakta hoon? Main nearby jobs, trusted workers aur Anga app ke sawaalon mein help kar sakta hoon."
        : `${greeting}! What would you like to do today? I can help you find nearby jobs, compare trusted workers, or answer questions about Anga.`,
    sources: [],
    suggestions: defaultSuggestions(lang),
  };
}

function buildKnowledge(lang: Lang): RagSource[] {
  const jobSources: RagSource[] = jobs.map((job) => ({
    id: `job-${job.id}`,
    type: "job",
    title: `${job.title[lang]} · ₹${job.payment}`,
    body: [
      serviceName(job.service, lang),
      job.location[lang],
      `${job.distanceKm} km`,
      job.time[lang],
      job.wageType[lang],
      `${job.customer[lang]} rating ${job.customerRating}`,
      job.description[lang],
      job.status,
      job.verifiedCustomer ? "verified customer" : "",
    ]
      .filter(Boolean)
      .join(". "),
    actionLabel: lang === "hi" ? "Job dekhein" : "View job",
    actionTo: `/worker/job/${job.id}`,
  }));

  const workerSources: RagSource[] = workers.map((worker) => ({
    id: `worker-${worker.id}`,
    type: "worker",
    title: `${worker.name} · ${serviceName(worker.skill, lang)}`,
    body: [
      worker.area,
      `${worker.distanceKm} km`,
      `${worker.experience} experience`,
      `₹${worker.expectedWage} expected wage`,
      `rating ${worker.rating}`,
      worker.verified ? "verified worker" : "",
      worker.documentUploaded ? "document uploaded" : "",
      worker.availableToday ? "available today" : "",
      worker.bio[lang],
    ]
      .filter(Boolean)
      .join(". "),
    actionLabel: lang === "hi" ? "Worker dekhein" : "View worker",
    actionTo: `/customer/worker/${worker.id}`,
  }));

  const requestSources: RagSource[] = seedRequests.map((request) => ({
    id: `request-${request.id}`,
    type: "request",
    title: `${request.title[lang]} · ${request.status[lang]}`,
    body: [
      serviceName(request.service, lang),
      request.location[lang],
      request.date[lang],
      `₹${request.budget}`,
      request.urgency[lang],
      `${request.applicants} applicants`,
      request.worker ? `assigned to ${request.worker}` : "open request",
    ].join(". "),
    actionLabel: lang === "hi" ? "Requests" : "Requests",
    actionTo: "/customer/my-requests",
  }));

  return [...jobSources, ...workerSources, ...requestSources, ...helpSources];
}

function rankSources(query: string, sources: RagSource[]) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return sources.slice(0, 3);

  return sources
    .map((source) => {
      const haystack = tokenize(`${source.title} ${source.body} ${source.type}`);
      const haystackSet = new Set(haystack);
      const score = tokens.reduce(
        (total, token) => {
          if (haystackSet.has(token)) return total + 4;
          if (haystack.some((word) => word.includes(token) || token.includes(word)))
            return total + 1;
          return total;
        },
        source.type === "safety" && /safe|trust|verify|report|sos|document/i.test(query) ? 3 : 0,
      );
      return { source, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.source);
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s₹]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1)
    .flatMap((token) => expandToken(token));
}

function expandToken(token: string) {
  const service = services.find(
    (item) =>
      item.slug.includes(token) ||
      item.en.toLowerCase().includes(token) ||
      item.hi.toLowerCase().includes(token),
  );
  const aliases: Record<string, string[]> = {
    kaam: ["job", "work"],
    chahiye: ["need", "want"],
    aaj: ["today"],
    kal: ["tomorrow"],
    mazdoor: ["worker"],
    majdoor: ["worker"],
    मजदूर: ["worker"],
    काम: ["job", "work"],
    verified: ["trust", "document"],
    otp: ["login", "phone"],
  };
  return [
    token,
    ...(service ? [service.slug, service.en.toLowerCase()] : []),
    ...(aliases[token] ?? []),
  ];
}

function summarize(body: string) {
  return body.length > 145 ? `${body.slice(0, 142).trim()}...` : body;
}

function nextStep(source: RagSource, lang: Lang) {
  if (source.type === "job")
    return lang === "hi" ? "job detail kholkar apply karein." : "open the job detail and apply.";
  if (source.type === "worker")
    return lang === "hi"
      ? "worker profile compare karke assign/call karein."
      : "compare the worker profile, then call or assign.";
  if (source.type === "safety")
    return lang === "hi"
      ? "verified badge, document aur rating check karein."
      : "check badges, documents and ratings before proceeding.";
  return lang === "hi" ? "related screen open karein." : "open the related screen.";
}

function defaultSuggestions(lang: Lang) {
  return lang === "hi"
    ? [
        "Aaj electrician jobs dikhao",
        "Verified plumber kaise milega?",
        "OTP login kaise kaam karta hai?",
      ]
    : [
        "Show electrician jobs today",
        "How do I find verified plumbers?",
        "How does OTP login work?",
      ];
}

function relatedSuggestions(source: RagSource, lang: Lang) {
  if (source.type === "job") {
    return lang === "hi"
      ? ["Is job ka payment kya hai?", "Nearby aur jobs dikhao", "Customer verified hai?"]
      : ["What is the payment?", "Show more nearby jobs", "Is the customer verified?"];
  }
  if (source.type === "worker") {
    return lang === "hi"
      ? ["Worker verified hai?", "Expected wage kya hai?", "Available today workers dikhao"]
      : ["Is this worker verified?", "What is the expected wage?", "Show workers available today"];
  }
  return defaultSuggestions(lang);
}
