import { createFileRoute } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BatteryMedium,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Car,
  Download,
  Hammer,
  Languages,
  MapPin,
  MessageCircle,
  Mic,
  Package,
  Paintbrush,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  Signal,
  Sparkles,
  Users,
  Wallet,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { PhoneMockup } from "@/components/PhoneMockup";
import { api } from "@/lib/api";
import defaultWorkerProfileImage from "@/assets/profile/construction-worker.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "anga - Find work. Hire trusted local workers." },
      {
        name: "description",
        content:
          "Anga is a mobile-first Rozgar platform for daily-wage workers and trusted nearby hiring.",
      },
    ],
  }),
  component: Landing,
});

const navItems = ["Features", "Solutions", "Impact", "FAQ"];

const logoStrip: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Electricians", icon: Zap },
  { label: "Plumbers", icon: Wrench },
  { label: "Carpenters", icon: Hammer },
  { label: "Painters", icon: Paintbrush },
  { label: "Drivers", icon: Car },
  { label: "House Help", icon: Users },
  { label: "Delivery", icon: Package },
  { label: "AC Repair", icon: ShieldCheck },
];

const framerHeroAssets = {
  bg: "https://framerusercontent.com/images/2wnaY86AQR4DAMdYqVvA8vPbGY.png?width=4800&height=3928",
  cloudOne:
    "https://framerusercontent.com/images/oY2Pf5qqEUWBgIBTFJAmISh4.png?width=1456&height=1520",
  cloudTwo:
    "https://framerusercontent.com/images/fzecrnrVdLntVeG2vqjM3xOZ8w.png?width=2008&height=1956",
  cloudRight:
    "https://framerusercontent.com/images/2HenEdlws5AbpQ9S9RRJ4xQvLc0.png?width=4923&height=4778",
};

const platformFeatures: FeatureCard[] = [
  {
    icon: Bot,
    title: "AI Rozgar Assistant",
    text: "Ask in Hindi or English and get job matches, worker suggestions, safety help and next actions.",
  },
  {
    icon: MapPin,
    title: "Nearby Matching",
    text: "Show daily-wage jobs and workers around the user's selected area first.",
  },
  {
    icon: ShieldCheck,
    title: "Trust Signals",
    text: "Verified badges, ratings, document status and reporting make local hiring safer.",
  },
  {
    icon: Wallet,
    title: "Daily Wage Clarity",
    text: "Every job highlights wage, time, distance, urgency and payment expectations.",
  },
];

const steps = [
  {
    number: "1",
    title: "Create a trusted profile",
    text: "Workers add skills, wage, availability, photo and documents. Customers add address and hiring type.",
  },
  {
    number: "2",
    title: "Find or post local work",
    text: "Workers search nearby openings. Customers post jobs with description, date, budget and problem photo.",
  },
  {
    number: "3",
    title: "Apply, hire and complete",
    text: "Track applications, assign workers, use SOS/reporting after acceptance, and complete with ratings.",
  },
];

const workspaceItems = [
  {
    title: "Smart AI Conversations Anytime",
    text: "Get instant Rozgar help, job matches and hiring guidance with an AI assistant available whenever users need it.",
  },
  {
    title: "AI Powered Worker Matching",
    text: "Match nearby workers to jobs using skills, availability, wage expectations and distance.",
  },
  {
    title: "Smarter Job Posting Automation",
    text: "Turn a short request into a clear job post with role, timing, budget and location details.",
  },
  {
    title: "Secure Trust And Safety Tools",
    text: "Use verified profiles, ratings, reporting and SOS support to hire and work with more confidence.",
  },
];

const categories: FeatureCard[] = [
  { icon: Zap, title: "Electricians", text: "Fans, wiring, MCB, switches and local repair work." },
  {
    icon: Hammer,
    title: "Carpenters",
    text: "Furniture, doors, shelves, polish and fitting work.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Delivery Workers",
    text: "Parcel, grocery and local delivery jobs.",
  },
  { icon: Users, title: "House Helpers", text: "Cooking, cleaning, daily help and home support." },
  {
    icon: CalendarClock,
    title: "Drivers",
    text: "Daily pickup, local driving and scheduled trips.",
  },
  {
    icon: BadgeCheck,
    title: "Skilled Repairs",
    text: "Plumbing, painting, AC service and urgent repairs.",
  },
];

const impact = [
  {
    label: "More local categories",
    value: "8+",
    text: "Workers can discover jobs across electrician, plumbing, delivery and home-service roles.",
    icon: BarChart3,
    wide: true,
  },
  {
    label: "Faster applications",
    value: "91%",
    text: "Clear wages, distance and timing help workers apply with fewer steps.",
    icon: Zap,
  },
  {
    label: "Better matching",
    value: "69%",
    text: "Nearby worker discovery makes local hiring feel faster and more reliable.",
    icon: Rocket,
  },
];

const mentorTestimonialQuote =
  "“Anga thoughtfully brings AI, local hiring and trust into one clear experience. It has strong potential to make daily-wage opportunities easier to discover and local workers easier to hire.”";

const angaApkDownload = "/downloads/Anga.apk";

const faqs = [
  {
    question: "What is Anga?",
    answer:
      "Anga is a Rozgar platform that connects local daily-wage workers with nearby work and helps customers hire trusted local workers.",
  },
  {
    question: "Can I use it for local hiring?",
    answer:
      "Yes. Customers can post nearby work, view applicants and assign trusted workers. Workers can discover matching jobs by skill, wage and distance.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Anga keeps the demo flow simple while still showing production trust patterns like verified profiles, uploaded documents, issue reporting and safe job-status tracking.",
  },
  {
    question: "Can workers apply anytime?",
    answer:
      "Workers can mark availability, search recent job posts, apply to relevant openings and track Pending, Accepted, Rejected or Completed status.",
  },
  {
    question: "Does Anga support Hindi and English?",
    answer:
      "Yes. Major headings, CTAs and assistant prompts are built for simple Hindi and English usage for local workers and customers.",
  },
];

function Landing() {
  const [demoMode, setDemoMode] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [openWorkspaceIndex, setOpenWorkspaceIndex] = useState(0);

  useLandingAnimations(demoMode);

  useEffect(() => {
    void api.warmup();
  }, []);

  if (demoMode) {
    return (
      <main className="landing-demo-stage min-h-screen">
        <img
          className="final-cta-background demo-stage-background"
          src="/zentivo-cta-sky.png"
          alt=""
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => setDemoMode(false)}
          className="demo-back-button"
          aria-label="Back to homepage"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>
        <PhoneMockup src="/app" title="interactive Anga app demo" className="demo-live-phone" />
      </main>
    );
  }

  return (
    <main className="zentivo-landing min-h-screen overflow-hidden text-foreground">
      <section className="zentivo-hero relative min-h-screen overflow-hidden">
        <header className="zentivo-nav-wrap">
          <a href="/" className="zentivo-brand-pill" aria-label="Anga home">
            <img className="brand-mark" src="/playstore.png" alt="" />
            <span>anga</span>
          </a>
          <nav className="zentivo-nav">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="nav-chip">
                {item}
              </a>
            ))}
          </nav>
          <a href={angaApkDownload} download="Anga.apk" className="nav-cta">
            <span className="button-label-roller">
              <span className="button-label-track">
                <span>Download Now</span>
                <span aria-hidden="true">Download Now</span>
              </span>
            </span>
            <ArrowUpRight className="nav-cta-arrow h-5 w-5" />
          </a>
        </header>

        <CloudLayer />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center px-5 pb-0 pt-32 text-center sm:px-8 lg:px-10 lg:pt-44">
          <h1 className="hero-title max-w-4xl text-4xl font-normal leading-[0.98] tracking-normal text-slate-950 sm:text-5xl lg:text-[4.05rem]">
            App That Connects. Hires. Gets Work Done.
          </h1>
          <p className="hero-subtitle mt-5 max-w-3xl text-sm font-medium leading-6 text-slate-700/70 sm:text-base">
            Anga connects electricians, plumbers, carpenters, painters, drivers, house helpers and
            delivery workers with nearby daily-wage opportunities.
          </p>

          <div className="hero-actions mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={angaApkDownload} download="Anga.apk" className="hero-primary">
              <span className="button-label-roller">
                <span className="button-label-track">
                  <span>Download Now</span>
                  <span aria-hidden="true">Download Now</span>
                </span>
              </span>
              <Download className="hero-button-icon h-5 w-5" />
            </a>
            <button type="button" onClick={() => setDemoMode(true)} className="hero-secondary">
              <span className="ai-icon-wrap">
                <Sparkles className="hero-ai-icon h-6 w-6" />
              </span>
              <span className="button-label-roller">
                <span className="button-label-track">
                  <span>Try Live Demo</span>
                  <span aria-hidden="true">Try Live Demo</span>
                </span>
              </span>
            </button>
          </div>

          <div className="hero-stage hero-showcase relative mt-7 w-full">
            <div className="hero-assistant-card hero-voice-card">
              <div className="voice-bars" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <p className="text-sm font-bold text-slate-950">Hiring by AI Voice</p>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                Speak in Hindi or English. Anga finds nearby work fast.
              </p>
            </div>

            <div className="hero-device">
              <img
                src="/anga-phone-hand-blank.png"
                alt="Anga app displayed in a phone held by hand"
                className="hero-device-frame"
              />
              <span className="hero-device-screen" aria-hidden="true">
                <span className="hero-phone-status">
                  <span className="hero-phone-time">9:41</span>
                  <span className="hero-phone-island" />
                  <span className="hero-phone-indicators">
                    <Signal />
                    <Wifi />
                    <BatteryMedium />
                  </span>
                </span>
                <img src="/demo/worker-home-hero.png" alt="" />
              </span>
            </div>

            <div className="hero-assistant-card hero-rag-card">
              <div className="hero-rag-header">
                <span className="hero-rag-back">
                  <ArrowLeft className="h-3.5 w-3.5" />
                </span>
                <span>AI Suggestions</span>
              </div>
              <div className="hero-rag-thread">
                <div className="hero-rag-row">
                  <span className="hero-rag-avatar">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                  <p>6 verified electricians available within 5 km.</p>
                </div>
                <div className="hero-rag-row">
                  <span className="hero-rag-avatar">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                  <p>Recommended wage: ₹850-₹1,100 for today.</p>
                </div>
                <p className="hero-rag-user">Post this as urgent?</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LogoStrip />

      <section id="features" className="zentivo-section">
        <div className="features-showcase mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="features-showcase-header section-header mx-auto text-center">
            <h2>One Rozgar Platform For Every Local Workflow</h2>
            <p>
              Anga helps local workers find nearby daily-wage jobs and helps customers hire trusted
              people faster with simple flows, matching and AI support.
            </p>
          </div>

          <div className="features-showcase-grid mt-8">
            <div className="features-side-stack">
              {platformFeatures.slice(0, 2).map((feature) => (
                <FeatureCard key={feature.title} feature={feature} showcase />
              ))}
            </div>

            <div
              className="features-phone-panel"
              role="img"
              aria-label="Anga AI assistant displayed inside the mobile app"
            >
              <img src="/feature-phone-blank.png" alt="" className="features-phone-cloud-image" />
              <div className="features-phone-screen">
                <img
                  src="/demo/anga-ai-assistant.png"
                  alt=""
                  className="features-phone-screen-image"
                />
              </div>
            </div>

            <div className="features-side-stack">
              {platformFeatures.slice(2).map((feature) => (
                <FeatureCard key={feature.title} feature={feature} showcase />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="zentivo-section">
        <div className="mx-auto max-w-[72rem] px-5 sm:px-8 lg:px-10">
          <div className="workflow-timeline-panel">
            <div className="workflow-timeline-copy">
              <h2>Start Local Work Smarter In Minutes</h2>
              <p>
                Create a trusted profile, match nearby, then apply or assign local daily-wage work
                with clear wages and trust signals.
              </p>
              <a href={angaApkDownload} download="Anga.apk" className="hero-primary">
                Download Now
                <Download className="h-4 w-4" />
              </a>
            </div>

            <div className="workflow-timeline-visual" aria-hidden="true">
              <svg viewBox="0 0 1240 430" preserveAspectRatio="none">
                <defs>
                  <linearGradient
                    id="workflowWaveGradient"
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="0"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
                    <stop offset="12%" stopColor="#2563eb" stopOpacity="0.16" />
                    <stop offset="24%" stopColor="#2563eb" stopOpacity="0.62" />
                    <stop offset="46%" stopColor="#2563eb" stopOpacity="0.98" />
                    <stop offset="76%" stopColor="#2563eb" stopOpacity="0.82" />
                    <stop offset="91%" stopColor="#b7ccff" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#b7ccff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient
                    id="workflowWaveShadowGradient"
                    x1="0"
                    x2="1"
                    y1="0"
                    y2="0"
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0%" stopColor="#dbe5ff" stopOpacity="0" />
                    <stop offset="16%" stopColor="#dbe5ff" stopOpacity="0.42" />
                    <stop offset="52%" stopColor="#b8ccff" stopOpacity="0.52" />
                    <stop offset="88%" stopColor="#dbe5ff" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#dbe5ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  className="workflow-path-shadow"
                  d="M25 280 C150 350 270 332 372 224 C460 130 560 120 648 178 C725 230 780 230 852 188 C948 132 1006 70 1112 65 C1160 64 1204 82 1224 104"
                />
                <path
                  className="workflow-path"
                  d="M25 280 C150 350 270 332 372 224 C460 130 560 120 648 178 C725 230 780 230 852 188 C948 132 1006 70 1112 65 C1160 64 1204 82 1224 104"
                />
              </svg>
              <span className="timeline-node timeline-node-one" />
              <span className="timeline-node timeline-node-two" />
              <span className="timeline-node timeline-node-three" />
            </div>

            {steps.map((step) => (
              <article
                key={step.number}
                className={`workflow-timeline-step workflow-timeline-step-${step.number}`}
              >
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workspace" className="zentivo-section">
        <div className="mx-auto max-w-[76rem] px-5 sm:px-8 lg:px-10">
          <div className="workspace-grid">
            <div className="workspace-copy">
              <h2>Your Rozgar Workspace, All in One Place</h2>
              <p>
                Manage worker profiles, customer job posts, AI guidance and trust tools from one
                simple mobile-first Rozgar platform.
              </p>
              <div className="workspace-list">
                {workspaceItems.map((item, index) => {
                  const isOpen = openWorkspaceIndex === index;
                  const descriptionId = `workspace-description-${index}`;

                  return (
                    <article
                      key={item.title}
                      className={`workspace-line ${isOpen ? "is-open" : ""}`}
                    >
                      <h3>
                        <button
                          type="button"
                          className="workspace-line-trigger"
                          aria-expanded={isOpen}
                          aria-controls={descriptionId}
                          onClick={() => {
                            setOpenWorkspaceIndex(index);
                            window.setTimeout(() => ScrollTrigger.refresh(), 480);
                          }}
                        >
                          {item.title}
                        </button>
                      </h3>
                      <div
                        id={descriptionId}
                        className="workspace-line-description"
                        aria-hidden={!isOpen}
                      >
                        <div>
                          <p>{item.text}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <div className="workspace-phone-visual" aria-hidden="true">
              <img src="/workspace-phone-blank.png" alt="" className="workspace-phone-frame" />
              <div className="workspace-phone-screen-mask">
                <img
                  src="/demo/workspace-assistant-screen.png"
                  alt=""
                  className="workspace-phone-screen-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="zentivo-section categories-section">
        <div className="mx-auto max-w-[76rem] px-5 sm:px-8 lg:px-10">
          <div className="categories-header">
            <h2>Built For Every Daily-Wage Role</h2>
          </div>
          <div className="category-grid">
            {categories.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} category />
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="zentivo-section">
        <div className="mx-auto max-w-[72rem] px-5 sm:px-8 lg:px-10">
          <div className="growth-reference">
            <div className="growth-reference-copy">
              <div>
                <h2>Built for Modern Growing Local Hiring</h2>
                <p>
                  Thousands of workers and customers can use Anga to find nearby work, post jobs,
                  make faster hiring decisions and complete trusted daily-wage workflows.
                </p>
              </div>

              <div className="growth-reference-proof">
                <p>
                  <span>All in one Rozgar workspace</span> to create profiles, post work, match
                  locally and hire trusted workers faster.
                </p>
                <div className="growth-users">
                  <div className="growth-avatars" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <img
                        key={index}
                        src={defaultWorkerProfileImage}
                        alt=""
                        style={{ objectPosition: `${45 + index * 4}% center` }}
                      />
                    ))}
                  </div>
                  <span>Trusted by local workers and customers</span>
                </div>
              </div>
            </div>

            <div className="growth-reference-stats">
              {impact.map((item) => (
                <article
                  key={item.label}
                  className={`growth-stat-card ${item.wide ? "growth-stat-card-wide" : ""}`}
                >
                  <div className="growth-stat-label">
                    <span>
                      <item.icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </div>
                  <p
                    className="growth-stat-value"
                    data-counter-target={Number.parseInt(item.value, 10)}
                    data-counter-suffix={item.value.replace(/\d/g, "")}
                    aria-label={item.value}
                  >
                    {item.value}
                  </p>
                  <p className="growth-stat-text">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="zentivo-section reviews-section">
        <div className="mx-auto max-w-[76rem] px-5 sm:px-8 lg:px-10">
          <article className="mentor-testimonial">
            <blockquote aria-label={mentorTestimonialQuote}>
              <span className="mentor-testimonial-animated-copy" aria-hidden="true">
                {Array.from(mentorTestimonialQuote).map((character, index) =>
                  character === " " ? (
                    " "
                  ) : (
                    <span className="mentor-testimonial-char" key={`${character}-${index}`}>
                      {character}
                    </span>
                  ),
                )}
              </span>
            </blockquote>

            <div className="mentor-testimonial-author">
              <div className="mentor-testimonial-avatar">
                <img src="/demo/suhas-vitthal-powar.png" alt="Suhas Vitthal Powar" />
              </div>
              <div>
                <p>Suhas Vitthal Powar</p>
                <span>Mentor — Build for Good 2026</span>
              </div>
            </div>

            <div className="mentor-testimonial-pagination" aria-hidden="true">
              <span />
              <span className="is-active" />
              <span />
            </div>
          </article>
        </div>
      </section>

      <section id="faq" className="zentivo-section">
        <div className="mx-auto max-w-[62rem] px-5 sm:px-8 lg:px-10">
          <div className="faq-header">
            <h2>Everything You Need to Know</h2>
            <p>
              Explore everything you need to know about Anga, from setup and safety to finding and
              hiring local workers.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <article
                key={faq.question}
                className={`faq-row ${openFaqIndex === index ? "faq-row-open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                  aria-expanded={openFaqIndex === index}
                >
                  <span>{faq.question}</span>
                  <span className="faq-toggle" aria-hidden="true">
                    <span />
                    <span />
                  </span>
                </button>
                {openFaqIndex === index && <p className="faq-answer">{faq.answer}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="zentivo-final-cta relative">
        <img
          className="final-cta-background"
          src="/zentivo-cta-sky.png"
          alt=""
          aria-hidden="true"
        />
        <div className="final-cta-inner">
          <div className="final-cta-copy">
            <h2>Ready to Work Smarter with AI?</h2>
            <p>
              Join local workers and customers using Anga to find work faster, hire trusted people
              nearby, and complete daily-wage jobs with AI support.
            </p>
          </div>

          <div className="final-cta-actions">
            <button type="button" onClick={() => setDemoMode(true)} className="hero-primary">
              Get Started Free
              <ArrowUpRight className="hero-button-icon h-5 w-5" />
            </button>
            <button type="button" onClick={() => setDemoMode(true)} className="hero-secondary">
              <span className="ai-icon-wrap">
                <Sparkles className="hero-ai-icon h-6 w-6" />
              </span>
              Try Live Demo
            </button>
          </div>

          <div className="final-cta-device" aria-hidden="true">
            <img src="/anga-phone-hand-blank.png" alt="" className="hero-device-frame" />
            <span className="hero-device-screen">
              <span className="hero-phone-status">
                <span className="hero-phone-time">9:41</span>
                <span className="hero-phone-island" />
                <span className="hero-phone-indicators">
                  <Signal />
                  <Wifi />
                  <BatteryMedium />
                </span>
              </span>
              <img src="/demo/anga-ai-assistant.png" alt="" className="final-cta-app-screen" />
            </span>
          </div>
        </div>
      </section>

      <footer className="zentivo-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand-block">
              <a href="/" className="footer-brand" aria-label="Anga home">
                <img src="/playstore.png" alt="" />
                <span>anga</span>
              </a>
              <p>
                Smarter Rozgar for local work, helping workers find jobs and customers hire trusted
                nearby people.
              </p>
            </div>
            <FooterColumn
              title="Product"
              items={["Features", "Demo", "Worker App", "Customer App"]}
            />
            <FooterColumn title="Resources" items={["AI Assistant", "Trust", "Safety", "FAQ"]} />
            <FooterColumn title="Company" items={["About", "Hackathon", "Contact", "Rozgar"]} />
          </div>

          <div className="footer-wordmark" aria-hidden="true">
            {["a", "n", "g", "a"].map((letter, index) => (
              <span key={`${letter}-${index}`} className="footer-wordmark-letter">
                {letter}
              </span>
            ))}
          </div>

          <div className="footer-bottom">
            <p>Built by Team Waffles</p>
            <p>they hate us cause they ain&apos;t us</p>
            <p>Build for Good 2026</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function CloudLayer() {
  return (
    <div className="cloud-layer" aria-hidden="true">
      <img className="hero-bg-image" src={framerHeroAssets.bg} alt="" />
      <div className="cloud-float-layer">
        <img className="cloud cloud-one" src={framerHeroAssets.cloudOne} alt="" />
        <img className="cloud cloud-two" src={framerHeroAssets.cloudTwo} alt="" />
        <img className="cloud cloud-three" src={framerHeroAssets.cloudRight} alt="" />
        <img className="cloud cloud-four" src={framerHeroAssets.cloudTwo} alt="" />
      </div>
    </div>
  );
}

function LogoStrip() {
  return (
    <section className="logo-strip">
      <p className="text-center text-sm font-black text-muted-foreground">
        Trusted daily-wage categories across local hiring
      </p>
      <div className="logo-marquee mt-6">
        <div className="logo-track">
          {[...logoStrip, ...logoStrip].map((item, index) => (
            <span key={`${item.label}-${index}`} className="logo-pill">
              <item.icon className="logo-pill-icon" />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  text,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  text: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`section-header ${align === "left" ? "text-left" : "mx-auto text-center"}`}>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-6xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

function HeroFloatCard({
  icon: Icon,
  title,
  text,
  className = "",
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  className?: string;
}) {
  return (
    <article className={`hero-float-card ${className}`}>
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-black">{title}</p>
        <p className="text-xs font-semibold text-muted-foreground">{text}</p>
      </div>
    </article>
  );
}

function FeatureCard({
  feature,
  compact = false,
  showcase = false,
  category = false,
}: {
  feature: FeatureCard;
  compact?: boolean;
  showcase?: boolean;
  category?: boolean;
}) {
  const Icon = feature.icon;
  return (
    <article
      className={`zentivo-card ${compact ? "compact" : ""} ${showcase ? "showcase" : ""} ${category ? "category-card" : ""}`}
    >
      <div className="feature-icon">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
      <p className="mt-3 text-sm font-semibold leading-6 text-muted-foreground">{feature.text}</p>
    </article>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="footer-column">
      <p>{title}</p>
      <div>
        {items.map((item) => (
          <a key={item} href={footerHref(item)}>
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}

function footerHref(item: string) {
  const links: Record<string, string> = {
    Features: "#features",
    Demo: "/app",
    "Worker App": "/auth/login",
    "Customer App": "/auth/login",
    "AI Assistant": "/assistant",
    Trust: "#features",
    Safety: "#faq",
    FAQ: "#faq",
    About: "#impact",
    Hackathon: "#impact",
    Contact: "#faq",
    Rozgar: "#solutions",
  };
  return links[item] || "/app";
}

function useLandingAnimations(demoMode: boolean) {
  useLayoutEffect(() => {
    if (demoMode || typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const context = gsap.context(() => {
      gsap.set(
        [
          ".zentivo-nav-wrap",
          ".hero-title",
          ".hero-subtitle",
          ".hero-actions",
          ".hero-device",
          ".hero-assistant-card",
        ],
        { autoAlpha: 0 },
      );

      const hero = gsap.timeline({ defaults: { ease: "power3.out" } });
      hero
        .fromTo(
          ".zentivo-nav-wrap",
          { y: -24, scale: 0.985, filter: "blur(7px)" },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.2,
            ease: "power2.out",
          },
        )
        .fromTo(
          ".hero-title",
          { y: 34, scale: 0.88 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.78, ease: "back.out(1.18)" },
          "-=0.72",
        )
        .fromTo(
          ".hero-subtitle",
          { y: 24, scale: 0.94 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.62 },
          "-=0.36",
        )
        .fromTo(".hero-actions", { y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.26")
        .fromTo(
          ".hero-device",
          { y: 42, scale: 0.92 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.8 },
          "-=0.25",
        )
        .fromTo(
          ".hero-assistant-card",
          { y: 22, scale: 0.9 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.08 },
          "-=0.42",
        );

      gsap.to(".cloud-one", {
        x: 34,
        y: -10,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".cloud-two", {
        x: -28,
        y: 12,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".cloud-three", {
        x: 22,
        y: 16,
        duration: 11,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.fromTo(
        ".zentivo-hero .cloud-float-layer",
        { y: 0 },
        {
          y: () => -Math.min(260, window.innerHeight * 0.28),
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: ".zentivo-hero",
            start: "top top",
            end: "bottom top",
            // Lenis already smooths the scroll position. A timed scrub here added a second
            // ~1s interpolation that visibly caught up when scrolling back into the hero.
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>(".section-header").forEach((header) => {
        gsap.fromTo(
          header.children,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.62,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: header, start: "top 84%" },
          },
        );
      });

      gsap.utils
        .toArray<HTMLElement>(
          ".zentivo-card, .step-card, .workspace-phone-visual, .growth-stat-card, .mentor-testimonial, .faq-row",
        )
        .forEach((card) => {
          gsap.fromTo(
            card,
            { autoAlpha: 0, y: 38, scale: 0.965 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.58,
              ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 88%" },
            },
          );
        });

      const testimonialCharacters = gsap.utils.toArray<HTMLElement>(".mentor-testimonial-char");
      if (testimonialCharacters.length > 0) {
        gsap.fromTo(
          testimonialCharacters,
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.025,
            scrollTrigger: {
              trigger: ".mentor-testimonial blockquote",
              start: "top 82%",
              end: "bottom 42%",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      gsap.fromTo(
        ".workspace-copy > h2, .workspace-copy > p",
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".workspace-copy",
            start: "top 86%",
            once: true,
          },
        },
      );

      gsap.set(".workspace-line", { autoAlpha: 0, x: -18, y: 34 });
      gsap.to(".workspace-line", {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 1,
        stagger: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".workspace-list",
          start: "top 88%",
          end: "bottom 58%",
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });

      gsap.fromTo(
        ".workflow-timeline-panel, .growth-reference",
        { autoAlpha: 0, y: 46, scale: 0.97 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.72,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".workflow-timeline-panel", start: "top 85%" },
        },
      );

      gsap.utils.toArray<HTMLElement>(".growth-stat-value").forEach((value) => {
        const target = Number(value.dataset.counterTarget ?? 0);
        const suffix = value.dataset.counterSuffix ?? "";
        const counter = { value: 0 };

        value.textContent = `0${suffix}`;

        gsap.to(counter, {
          value: target,
          duration: 1.65,
          ease: "power2.out",
          onUpdate: () => {
            value.textContent = `${Math.round(counter.value)}${suffix}`;
          },
          onComplete: () => {
            value.textContent = `${target}${suffix}`;
          },
          scrollTrigger: {
            trigger: value.closest(".growth-stat-card") ?? value,
            start: "top 86%",
            once: true,
          },
        });
      });

      gsap.fromTo(
        ".workflow-path",
        { strokeDasharray: 1500, strokeDashoffset: 1500 },
        {
          strokeDashoffset: 0,
          duration: 1.35,
          ease: "power2.out",
          scrollTrigger: { trigger: ".workflow-timeline-panel", start: "top 78%" },
        },
      );

      const workflowStepTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".workflow-timeline-panel",
          start: "top 76%",
          once: true,
        },
      });

      gsap.utils.toArray<HTMLElement>(".workflow-timeline-step").forEach((step, index) => {
        const number = step.querySelector(":scope > span");
        const copy = step.querySelector(":scope > div");
        const position = index * 0.28;

        workflowStepTimeline.fromTo(
          number,
          { autoAlpha: 0, y: 42, scale: 0.78, rotate: -4 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            duration: 0.75,
            ease: "back.out(1.4)",
          },
          position,
        );
        workflowStepTimeline.fromTo(
          copy,
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out" },
          position + 0.12,
        );
      });

      gsap.to(".orbit-line", {
        rotate: 8,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      const finalCtaTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".zentivo-final-cta",
          start: "top 76%",
          toggleActions: "play none none reverse",
        },
      });

      finalCtaTimeline
        .fromTo(
          ".final-cta-copy h2",
          { autoAlpha: 0, y: 48, filter: "blur(7px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.95,
            ease: "power3.out",
          },
        )
        .fromTo(
          ".final-cta-copy p",
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.75, ease: "power3.out" },
          "-=0.58",
        )
        .fromTo(
          ".final-cta-actions",
          { autoAlpha: 0, y: 30, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.78, ease: "power3.out" },
          "-=0.5",
        )
        .fromTo(
          ".final-cta-device",
          { autoAlpha: 0, y: 118, scale: 0.9 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.15,
            ease: "power4.out",
          },
          "-=0.52",
        );

      gsap.fromTo(
        ".footer-top",
        {
          autoAlpha: 0,
          y: 58,
          scale: 0.9,
          transformOrigin: "center top",
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".footer-top",
            start: "top 96%",
            end: "top 72%",
            scrub: 0.8,
          },
        },
      );

      gsap.fromTo(
        ".footer-wordmark-letter",
        { autoAlpha: 0, yPercent: 115 },
        {
          autoAlpha: 1,
          yPercent: 0,
          duration: 1.15,
          stagger: 0.12,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".footer-wordmark",
            start: "top 92%",
            end: "top 70%",
            toggleActions: "play none reverse none",
          },
        },
      );

      const footerFloatOffsets = [-10, -17, -8, -14];
      const footerFloatDurations = [2.55, 3.1, 2.35, 2.85];
      const footerFloatRotations = [-0.65, 0.8, -0.45, 0.6];

      gsap.utils.toArray<HTMLElement>(".footer-wordmark-letter").forEach((letter, index) => {
        gsap.to(letter, {
          y: footerFloatOffsets[index],
          rotate: footerFloatRotations[index],
          duration: footerFloatDurations[index],
          delay: index * 0.14,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          scrollTrigger: {
            trigger: ".footer-wordmark",
            start: "top bottom",
            end: "bottom top",
            toggleActions: "play pause resume pause",
          },
        });
      });
    });

    return () => context.revert();
  }, [demoMode]);
}

type FeatureCard = {
  icon: LucideIcon;
  title: string;
  text: string;
};
