import { useEffect, useRef } from "react";

type PhoneMockupProps = {
  src?: string;
  title?: string;
  className?: string;
};

export function PhoneMockup({
  src = "/app",
  title = "anga app demo",
  className = "",
}: PhoneMockupProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const syncStatusBarColor = () => {
      const iframe = iframeRef.current;
      const shell = shellRef.current;
      const iframeWindow = iframe?.contentWindow;
      const iframeDocument = iframe?.contentDocument;

      if (!iframeWindow || !iframeDocument || !shell) return;

      try {
        const sampleY = Math.min(56, Math.max(0, iframeWindow.innerHeight - 1));
        let element = iframeDocument.elementFromPoint(iframeWindow.innerWidth / 2, sampleY);
        let matchedColor = "";

        while (element && !matchedColor) {
          const styles = iframeWindow.getComputedStyle(element);
          const backgroundColor = styles.backgroundColor;
          const backgroundImage = styles.backgroundImage;
          const backgroundChannels = backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
          const isTransparent =
            backgroundColor === "transparent" ||
            (backgroundColor.startsWith("rgba") && (backgroundChannels[3] ?? 1) === 0);

          if (backgroundColor && !isTransparent) {
            matchedColor = backgroundColor;
          } else if (backgroundImage && backgroundImage !== "none") {
            matchedColor = backgroundImage.match(/rgba?\([^)]*\)/)?.[0] ?? "";
          }

          element = element.parentElement;
        }

        if (!matchedColor) return;

        const channels =
          matchedColor
            .match(/[\d.]+/g)
            ?.slice(0, 3)
            .map(Number) ?? [];
        const luminance =
          channels.length === 3
            ? (channels[0] * 299 + channels[1] * 587 + channels[2] * 114) / 1000
            : 255;

        shell.style.setProperty("--phone-status-background", matchedColor);
        shell.style.setProperty(
          "--phone-status-foreground",
          luminance < 150 ? "#ffffff" : "#0f172a",
        );
      } catch {
        // The preview is same-origin in production; retain the CSS fallback if that changes.
      }
    };

    const iframe = iframeRef.current;
    iframe?.addEventListener("load", syncStatusBarColor);
    const syncTimer = window.setInterval(syncStatusBarColor, 300);
    syncStatusBarColor();

    return () => {
      iframe?.removeEventListener("load", syncStatusBarColor);
      window.clearInterval(syncTimer);
    };
  }, []);

  return (
    <div ref={shellRef} className={`phone-shell ${className}`} aria-label={title}>
      <div className="phone-highlight" />
      <div className="phone-screen">
        <div className="phone-status-bar" aria-hidden="true">
          <span className="phone-status-time">9:41</span>
          <span className="phone-dynamic-island">
            <span className="phone-island-camera" />
          </span>
          <span className="phone-status-icons">
            <span className="phone-signal">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span className="phone-wifi" />
            <span className="phone-battery">
              <span />
            </span>
          </span>
        </div>
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          className="h-full w-full border-0 bg-background"
          loading="eager"
        />
      </div>
    </div>
  );
}
