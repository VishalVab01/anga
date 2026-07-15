import { createFileRoute } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BadgeCheck,
  ArrowLeft,
  Bell,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Languages,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { PhoneMockup } from "@/components/PhoneMockup";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "anga - Daily wage jobs and trusted local hiring" },
      {
        name: "description",
        content:
          "anga connects daily-wage workers with nearby jobs and helps customers hire verified local workers.",
      },
    ],
  }),
  component: Landing,
});

const trustBadges = ["Daily wage jobs", "Verified workers", "Hindi + English", "Nearby matching"];

const whyAnga = [
  {
    title: "Made for daily-wage work",
    text: "The product is built around local rozgar, daily wages, nearby distance, fast hiring and simple job status updates.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Trust before assignment",
    text: "Verified badges, ratings, document status, report issue and SOS actions help both sides feel safer.",
    icon: ShieldCheck,
  },
  {
    title: "Simple for local users",
    text: "Mobile OTP login, Hindi and English support, clear cards and direct actions reduce confusion for workers and customers.",
    icon: Languages,
  },
];

const assistantHighlights = [
  "Understands Hindi + English job requests",
  "Searches Anga jobs, workers, safety and app help",
  "Shows grounded source cards with next actions",
  "Helps workers find work and customers hire faster",
];

const howItWorks = [
  {
    title: "Create your profile",
    text: "Workers add skills, wage, documents and availability. Customers add their hiring address.",
  },
  {
    title: "Find or post nearby work",
    text: "Workers see local jobs. Customers post clear daily-wage work with budget and urgency.",
  },
  {
    title: "Apply, hire, complete and rate",
    text: "Simple applications, applicant review, assignment, safety actions and ratings.",
  },
];

const features = [
  { title: "Worker and customer roles", icon: Users },
  { title: "Mobile OTP login", icon: Phone },
  { title: "Nearby jobs", icon: MapPin },
  { title: "Daily wage transparency", icon: Wallet },
  { title: "Job applications", icon: BriefcaseBusiness },
  { title: "View applicants", icon: Send },
  { title: "Verified profiles", icon: BadgeCheck },
  { title: "Notifications", icon: Bell },
  { title: "Hindi/English support", icon: Languages },
  { title: "AI Rozgar Assistant", icon: Bot },
];

const impact = [
  { value: "8+", label: "Job categories" },
  { value: "2", label: "User roles" },
  { value: "1 km", label: "Nearby matching" },
  { value: "Hindi + English", label: "Local language support" },
];

function Landing() {
  const [demoMode, setDemoMode] = useState(false);
  const [showPhoneCue, setShowPhoneCue] = useState(true);

  useLandingAnimations(demoMode);

  useEffect(() => {
    void api.warmup();
  }, []);

  useEffect(() => {
    if (!showPhoneCue || typeof window === "undefined") return;

    const dismissCueOnPhoneFocus = () => {
      window.setTimeout(() => {
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLIFrameElement && activeElement.closest(".landing-phone")) {
          setShowPhoneCue(false);
        }
      }, 0);
    };

    window.addEventListener("blur", dismissCueOnPhoneFocus);
    return () => window.removeEventListener("blur", dismissCueOnPhoneFocus);
  }, [showPhoneCue]);

  if (demoMode) {
    return (
      <main className="landing-demo-stage min-h-screen bg-background">
        <button
          type="button"
          onClick={() => setDemoMode(false)}
          className="demo-back-button"
          aria-label="Back to homepage"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </button>
        <PhoneMockup src="/app" title="interactive anga app demo" className="phone-demo-focus" />
      </main>
    );
  }

  return (
    <main className="landing-page min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative">
        <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_470px] lg:px-10 lg:py-12">
          <div className="hero-copy max-w-3xl">
            <div className="hero-eyebrow mb-8 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-4 py-2 text-sm font-bold text-primary shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Built for Rozgar, trust and local daily work
            </div>

            <p className="hero-brand text-5xl font-black tracking-normal text-primary sm:text-7xl">
              anga
            </p>
            <h1 className="hero-title mt-5 max-w-3xl text-4xl font-black leading-[1.05] tracking-normal text-foreground sm:text-6xl">
              Find daily work. Hire trusted local workers.
            </h1>
            <p className="hero-subtext mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              anga connects local workers like electricians, plumbers, carpenters, painters,
              drivers, house helpers and daily-wage labourers with nearby job opportunities.
            </p>

            <div className="hero-actions mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setDemoMode(true)}
                className="btn-primary text-base shadow-lg"
              >
                <Sparkles className="h-5 w-5" />
                Try Demo
              </button>
              {/* <a href="/app" className="btn-outline bg-card/80 text-base">
                Download App
              </a> */}
            </div>

            <div className="demo-credentials mt-5 max-w-xl rounded-[1.5rem] border border-primary/15 bg-card/90 p-4 shadow-lg shadow-primary/5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-foreground">Demo login for judges</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    No real phone number needed. Use mobile number{" "}
                    <span className="font-extrabold text-primary">1234567890</span> and OTP{" "}
                    <span className="font-extrabold text-primary">123456</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="hero-badges mt-8 flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-2 text-sm font-bold text-foreground shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div
            className="landing-phone relative flex justify-center lg:justify-end"
            onPointerDownCapture={() => setShowPhoneCue(false)}
          >
            <div
              className={`phone-interactive-cue ${showPhoneCue ? "" : "phone-interactive-cue-hidden"}`}
              aria-hidden="true"
            >
              <span className="phone-cue-dot" />
              <div>
                <p className="font-extrabold">Try it here</p>
                <p className="text-xs text-muted-foreground">The app is live inside this phone</p>
              </div>
            </div>
            <div className="phone-preview-wrap relative">
              <PhoneMockup src="/app" title="anga mobile app preview" className="phone-hero" />
              {showPhoneCue && (
                <button
                  type="button"
                  className="phone-cue-dismiss-layer"
                  onPointerDown={() => setShowPhoneCue(false)}
                  aria-label="Start interacting with phone demo"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Why anga"
            title="Designed for local rozgar, not generic service booking"
            text="anga focuses on daily-wage employment, nearby matching, trust signals and simple flows that work for local workers and customers."
          />
          <div className="landing-card-grid mt-8 grid gap-4 md:grid-cols-3">
            {whyAnga.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="landing-card">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-extrabold">{item.title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="ai-assistant-panel grid gap-8 rounded-[2rem] border border-primary/15 bg-card p-6 shadow-xl shadow-primary/5 md:grid-cols-[0.9fr_1.1fr] md:p-8 lg:p-10">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary">
                AI Rozgar Assistant
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-black tracking-normal sm:text-5xl">
                A personal helper for jobs, hiring and safety.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                The assistant sits inside the app as a circular bot icon. It answers using Anga job,
                worker, profile, payment and safety information, then points users to the right
                action.
              </p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1.5rem] bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/20">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">
                  <Bot className="h-4 w-4" />
                  Example
                </div>
                <p className="text-lg font-extrabold">“Mujhe aaj electrician ka kaam chahiye”</p>
                <p className="mt-3 text-sm leading-6 text-primary-foreground/80">
                  The assistant finds matching electrician jobs, relevant worker/customer details,
                  wages, distance and next steps from Anga data.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {assistantHighlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 rounded-2xl bg-primary/5 p-3 text-sm font-bold text-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="How it works"
            title="Simple enough for daily use"
            text="The product flow is built around local trust, fast matching and clear wages."
          />
          <div className="landing-card-grid mt-8 grid gap-4 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <article key={item.title} className="landing-card">
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
                  {index + 1}
                </div>
                <h3 className="text-xl font-extrabold">{item.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeader
            eyebrow="Platform features"
            title="A real employment platform, not a booking template"
            text="anga focuses on nearby daily-wage jobs, worker trust, transparent payment and simple bilingual flows."
          />
          <div className="landing-card-grid mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="landing-card landing-feature-card">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-extrabold leading-snug">{feature.title}</h3>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="impact-panel rounded-[2rem] border border-primary/15 bg-primary px-6 py-8 text-primary-foreground shadow-2xl shadow-primary/20 sm:px-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary-foreground/70">
                  Impact
                </p>
                <h2 className="mt-3 max-w-xl text-3xl font-black tracking-normal sm:text-5xl">
                  Built for daily wage employment.
                </h2>
                <p className="mt-4 max-w-xl leading-7 text-primary-foreground/80">
                  The product brings worker onboarding, job discovery, hiring, applications and
                  safety signals into one local-first experience.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {impact.map((item) => (
                  <div
                    key={item.label}
                    className="impact-stat rounded-3xl border border-white/15 bg-white/10 p-5 shadow-sm"
                  >
                    <p className="text-3xl font-black">{item.value}</p>
                    <p className="mt-2 text-sm font-bold text-primary-foreground/75">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="section-header">
      <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-normal sm:text-5xl">{title}</h2>
      <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{text}</p>
    </div>
  );
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
          ".hero-eyebrow",
          ".hero-brand",
          ".hero-title",
          ".hero-subtext",
          ".hero-actions",
          ".demo-credentials",
          ".hero-badges > *",
          ".landing-phone",
          ".phone-interactive-cue",
        ],
        { autoAlpha: 0 },
      );

      const hero = gsap.timeline({ defaults: { ease: "power3.out" } });
      hero
        .fromTo(
          ".hero-eyebrow",
          { y: 18, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.55 },
        )
        .fromTo(".hero-brand", { y: 28 }, { autoAlpha: 1, y: 0, duration: 0.62 }, "-=0.28")
        .fromTo(".hero-title", { y: 34 }, { autoAlpha: 1, y: 0, duration: 0.72 }, "-=0.36")
        .fromTo(".hero-subtext", { y: 22 }, { autoAlpha: 1, y: 0, duration: 0.58 }, "-=0.35")
        .fromTo(".hero-actions", { y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.25")
        .fromTo(
          ".demo-credentials",
          { y: 18, scale: 0.98 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 },
          "-=0.2",
        )
        .fromTo(
          ".hero-badges > *",
          { y: 16, scale: 0.94 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, stagger: 0.055 },
          "-=0.18",
        )
        .fromTo(
          ".landing-phone",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
          "-=0.72",
        )
        .fromTo(
          ".phone-interactive-cue",
          { y: 12, scale: 0.96 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.45 },
          "-=0.18",
        );

      gsap.utils.toArray<HTMLElement>(".section-header").forEach((header) => {
        gsap.fromTo(
          header.children,
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.62,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: header, start: "top 82%" },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".landing-card-grid").forEach((grid) => {
        gsap.fromTo(
          grid.children,
          { autoAlpha: 0, y: 36, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.58,
            stagger: 0.07,
            ease: "power3.out",
            scrollTrigger: { trigger: grid, start: "top 84%" },
          },
        );
      });

      gsap.fromTo(
        ".ai-assistant-panel",
        { autoAlpha: 0, y: 42, scale: 0.97 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: ".ai-assistant-panel", start: "top 84%" },
        },
      );

      gsap.fromTo(
        ".impact-panel",
        { autoAlpha: 0, y: 42, scale: 0.97 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: ".impact-panel", start: "top 84%" },
        },
      );

      gsap.fromTo(
        ".impact-stat",
        { autoAlpha: 0, y: 22, scale: 0.94 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.48,
          stagger: 0.06,
          ease: "back.out(1.4)",
          scrollTrigger: { trigger: ".impact-panel", start: "top 76%" },
        },
      );
    });

    return () => context.revert();
  }, [demoMode]);
}
