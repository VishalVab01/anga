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
  return (
    <div className={`phone-shell ${className}`} aria-label={title}>
      <div className="phone-highlight" />
      <div className="phone-screen">
        <iframe
          src={src}
          title={title}
          className="h-full w-full border-0 bg-background"
          loading="eager"
        />
      </div>
    </div>
  );
}
