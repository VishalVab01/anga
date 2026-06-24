import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useT, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Anga - Choose your language" },
      { name: "description", content: "Welcome to Anga. Choose English or Hindi to continue." },
    ],
  }),
  component: LanguageSelect,
});

function LanguageSelect() {
  const { setLang } = useT();
  const navigate = useNavigate();

  const pick = (l: Lang) => {
    setLang(l);
    navigate({ to: "/role-selection" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-16 pb-10">
        <div className="text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-primary text-3xl text-primary-foreground font-extrabold shadow-lg">
            R
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome to Anga</h1>
          <p className="mt-2 text-base text-muted-foreground">रोज़गार में आपका स्वागत है</p>
          <p className="mt-6 text-sm font-medium text-foreground/70">Choose your language / भाषा चुनें</p>
        </div>

        <div className="mt-8 grid gap-4">
          <button
            onClick={() => pick("hi")}
            className="card-soft card-soft-hover flex items-center gap-4 p-5 text-left"
          >
            <span className="text-4xl">🇮🇳</span>
            <div className="flex-1">
              <div className="text-xl font-bold">हिन्दी</div>
              <div className="text-sm text-muted-foreground">Hindi में जारी रखें</div>
            </div>
          </button>
          <button
            onClick={() => pick("en")}
            className="card-soft card-soft-hover flex items-center gap-4 p-5 text-left"
          >
            <span className="text-4xl">🇬🇧</span>
            <div className="flex-1">
              <div className="text-xl font-bold">English</div>
              <div className="text-sm text-muted-foreground">Continue in English</div>
            </div>
          </button>
        </div>

        <p className="mt-auto pt-10 text-center text-xs text-muted-foreground">
          Made for everyone · सबके लिए
        </p>
      </div>
    </div>
  );
}
