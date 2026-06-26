import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useT, type Lang } from "@/lib/i18n";
import heroImg from "@/assets/anga-hero.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anga — Find work, hire workers" },
      { name: "description", content: "Welcome to Anga. Find work or hire skilled workers near you." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { lang, setLang } = useT();
  const navigate = useNavigate();

  const goNext = () => navigate({ to: "/role-selection" });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-10 pb-8">
        {/* Wordmark */}
        <h1 className="text-center text-6xl font-extrabold tracking-tight text-primary">
          anga
        </h1>

        {/* Language toggle pill */}
        <div className="mt-6 flex justify-center">
          <div className="relative inline-flex rounded-full bg-primary/10 p-1">
            <button
              onClick={() => setLang("hi")}
              className={`relative z-10 min-w-[110px] rounded-full px-6 py-2.5 text-base font-semibold transition-colors ${
                lang === "hi" ? "bg-primary text-primary-foreground shadow-md" : "text-primary"
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLang("en")}
              className={`relative z-10 min-w-[110px] rounded-full px-6 py-2.5 text-base font-semibold transition-colors ${
                lang === "en" ? "bg-primary text-primary-foreground shadow-md" : "text-primary"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Hero illustration */}
        <div className="my-6 flex flex-1 items-center justify-center">
          <img
            src={heroImg}
            alt="Worker holding phone with tools"
            width={896}
            height={896}
            className="h-auto w-full max-w-sm object-contain"
          />
        </div>

        {/* CTAs */}
        <div className="grid gap-3">
          <button
            onClick={goNext}
            className="w-full rounded-2xl bg-primary py-4 text-lg font-semibold text-primary-foreground shadow-md transition active:scale-[0.98] hover:brightness-95"
          >
            {lang === "hi" ? "खाता बनाएं" : "Create account"}
          </button>
          <button
            onClick={goNext}
            className="w-full rounded-2xl border-2 border-primary bg-card py-4 text-lg font-semibold text-primary transition active:scale-[0.98] hover:bg-primary/5"
          >
            {lang === "hi" ? "लॉग इन" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
