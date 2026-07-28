import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OnboardingCarousel } from "@/components/OnboardingCarousel";
import { api } from "@/lib/api";
import { setAuthMode } from "@/lib/session";

export function AppEntry() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    void api.warmup();
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const splashTimer = window.setTimeout(() => setShowSplash(false), reduceMotion ? 700 : 2200);

    return () => window.clearTimeout(splashTimer);
  }, []);

  const completeOnboarding = () => {
    setAuthMode("signup");
    navigate({ to: "/auth/signup", replace: true });
  };

  if (showSplash) {
    return (
      <main
        className="anga-app-shell app-splash grid h-[100dvh] place-items-center overflow-hidden bg-background text-foreground"
        aria-label="Anga is opening"
      >
        <span className="app-splash-glow" aria-hidden="true" />
        <span className="auth-brand app-splash-word relative text-[3.25rem] leading-none tracking-[-0.055em] text-primary">
          anga
        </span>
      </main>
    );
  }

  return (
    <div className="app-onboarding-enter h-[100dvh] overflow-hidden overscroll-none">
      <OnboardingCarousel onComplete={completeOnboarding} />
    </div>
  );
}
