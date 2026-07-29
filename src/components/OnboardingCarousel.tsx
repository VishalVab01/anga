import { useRef, useState, type TouchEvent } from "react";

const onboardingSlides = [
  {
    image: "/onboarding/storyset-job-hunt.svg",
    alt: "A worker finding nearby jobs with Anga",
    title: "Find nearby work with ease",
    description:
      "Discover local daily-wage opportunities and apply directly to the jobs that suit your skills.",
  },
  {
    image: "/onboarding/storyset-hiring.svg",
    alt: "A customer and worker completing a trusted hire",
    title: "Get hired by people nearby",
    description:
      "Build trust with a clear profile and connect directly with customers who need your help.",
  },
  {
    image: "/onboarding/storyset-growing.svg",
    alt: "A worker growing his income with better job matches",
    title: "Grow your income with Anga",
    description:
      "Receive smarter job suggestions, find more opportunities, and build a steady path to better earnings.",
  },
] as const;

export function OnboardingCarousel({ onComplete }: { onComplete: () => void }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const isLastSlide = activeSlide === onboardingSlides.length - 1;

  const nextSlide = () => {
    if (isLastSlide) {
      onComplete();
      return;
    }
    setActiveSlide((current) => current + 1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;

    const distance =
      (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;

    if (distance < -48 && !isLastSlide) setActiveSlide((current) => current + 1);
    if (distance > 48 && activeSlide > 0) setActiveSlide((current) => current - 1);
  };

  return (
    <main className="anga-app-shell h-[100dvh] overflow-hidden overscroll-none bg-background text-foreground touch-pan-x">
      <div
        className="relative mx-auto flex h-full min-h-0 max-w-md flex-col overflow-hidden overscroll-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex min-h-0 flex-1 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {onboardingSlides.map((slide, index) => (
            <section
              key={slide.title}
              className="flex h-full min-h-0 min-w-full translate-y-[30px] flex-1 flex-col overflow-hidden px-6 pb-5 pt-5"
              aria-hidden={index !== activeSlide}
              inert={index !== activeSlide}
            >
              <div className="onboarding-visual flex h-[46dvh] max-h-[25rem] shrink-0 items-center justify-center pt-2">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  width={800}
                  height={800}
                  draggable={false}
                  decoding="async"
                  className="onboarding-illustration max-h-[48dvh] w-[116%] max-w-none -translate-y-[0.25rem] select-none object-contain"
                />
              </div>

              <div className="mx-auto mt-[-1.25rem] max-w-sm text-center">
                <h1 className="onboarding-heading text-[2rem] leading-[1.12] tracking-[-0.035em]">
                  {slide.title}
                </h1>
                <p className="mx-auto mt-3 max-w-xs text-[0.95rem] leading-6 text-muted-foreground">
                  {slide.description}
                </p>
              </div>

              <div className="mt-5">
                {index === 1 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={onComplete}
                      className="min-h-14 rounded-full border border-primary bg-card px-5 text-base text-primary transition active:scale-[0.98]"
                    >
                      Skip
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="min-h-14 rounded-full bg-primary px-5 text-base text-primary-foreground shadow-lg shadow-primary/20 transition active:scale-[0.98]"
                    >
                      Next
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={nextSlide}
                    className="min-h-14 w-full rounded-full bg-primary px-5 text-base text-primary-foreground shadow-lg shadow-primary/20 transition active:scale-[0.98]"
                  >
                    {isLastSlide ? "Get started" : "Continue"}
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>

        <nav
          className="flex items-center justify-center gap-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1"
          aria-label="Onboarding progress"
        >
          {onboardingSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeSlide ? "w-8 bg-primary" : "w-2 bg-foreground/10"
              }`}
              aria-label={`Go to onboarding slide ${index + 1}`}
              aria-current={index === activeSlide ? "step" : undefined}
            />
          ))}
        </nav>
      </div>
    </main>
  );
}
