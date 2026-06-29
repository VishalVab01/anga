import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useT } from "@/lib/i18n";
import { api } from "@/lib/api";
import { setAuthMode } from "@/lib/session";
import heroImg from "@/assets/logos/newanga.png";

export function AppEntry() {
  const { lang, setLang, t } = useT();
  const navigate = useNavigate();

  useEffect(() => {
    void api.warmup();
  }, []);

  return (
    <div className="anga-app-shell min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-7 pb-5">
        <h1 className="text-center text-5xl font-extrabold tracking-tight text-primary">anga</h1>

        <div className="mt-5 flex justify-center">
          <div className="relative inline-flex rounded-full bg-primary/10 p-1">
            <button
              onClick={() => setLang("hi")}
              className={`relative z-10 min-w-[100px] rounded-full px-5 py-2 text-base font-semibold transition-colors ${
                lang === "hi" ? "bg-primary text-primary-foreground shadow-md" : "text-primary"
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLang("en")}
              className={`relative z-10 min-w-[100px] rounded-full px-5 py-2 text-base font-semibold transition-colors ${
                lang === "en" ? "bg-primary text-primary-foreground shadow-md" : "text-primary"
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="my-4 flex flex-1 items-center justify-center">
          <img
            src={heroImg}
            alt="Worker using Anga app"
            width={896}
            height={896}
            className="h-auto max-h-[42vh] w-full max-w-[18rem] object-contain"
          />
        </div>

        <div className="mb-3 rounded-2xl border border-primary/15 bg-primary/5 p-3 text-sm font-semibold text-primary">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <span>
              {lang === "hi"
                ? "पास का रोज़गार, भरोसेमंद मजदूर, आसान OTP लॉगिन"
                : "Nearby jobs, trusted workers, simple OTP login"}
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          <button
            onClick={() => {
              setAuthMode("signup");
              navigate({ to: "/role-selection" });
            }}
            className="w-full rounded-2xl bg-primary py-3.5 text-lg font-semibold text-primary-foreground shadow-md transition hover:brightness-95 active:scale-[0.98]"
          >
            {t("createAccount")}
          </button>
          <Link
            to="/role-selection"
            onClick={() => {
              setAuthMode("login");
            }}
            className="w-full rounded-2xl border-2 border-primary bg-card py-3.5 text-center text-lg font-semibold text-primary transition hover:bg-primary/5 active:scale-[0.98]"
          >
            {t("login")}
          </Link>
        </div>
      </div>
    </div>
  );
}
