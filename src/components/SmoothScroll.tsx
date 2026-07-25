import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, type ReactNode } from "react";

type SmoothScrollProps = {
  children: ReactNode;
};

export function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let tickerUpdate: ((time: number) => void) | null = null;

    const stop = () => {
      if (!lenis || !tickerUpdate) return;

      lenis.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      lenis = null;
      tickerUpdate = null;
      gsap.ticker.lagSmoothing(500, 33);
    };

    const start = () => {
      if (reducedMotion.matches || lenis) return;

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        autoRaf: false,
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
        syncTouch: false,
        allowNestedScroll: true,
        anchors: { duration: 1.15 },
      });

      tickerUpdate = (time: number) => {
        lenis?.raf(time * 1000);
      };

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tickerUpdate);
      gsap.ticker.lagSmoothing(0);
      ScrollTrigger.refresh();
    };

    const handleMotionPreference = () => {
      if (reducedMotion.matches) {
        stop();
      } else {
        start();
      }
    };

    start();
    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      reducedMotion.removeEventListener("change", handleMotionPreference);
      stop();
    };
  }, []);

  return children;
}
