import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { HardHat, UserRound } from "lucide-react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/role-selection")({
  head: () => ({ meta: [{ title: "Anga - Who are you?" }] }),
  component: RoleSelect,
});

function RoleSelect() {
  const { t } = useT();
  const navigate = useNavigate();

  const pick = (role: "worker" | "customer") => {
    if (typeof window !== "undefined") localStorage.setItem("rozgaar.role", role);
    navigate({ to: role === "worker" ? "/worker" : "/customer" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-14 pb-10">
        <h1 className="text-center text-3xl font-extrabold">{t("whoAreYou")}</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Choose to continue / आगे बढ़ने के लिए चुनें
        </p>

        <div className="mt-10 grid gap-5">
          <button
            onClick={() => pick("worker")}
            className="card-soft card-soft-hover flex flex-col items-center gap-3 p-8 text-center"
          >
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-primary/10 text-primary">
              <HardHat className="h-10 w-10" />
            </div>
            <div className="text-2xl font-bold">{t("worker")}</div>
            <div className="text-sm text-muted-foreground">{t("workerSub")}</div>
          </button>
          <button
            onClick={() => pick("customer")}
            className="card-soft card-soft-hover flex flex-col items-center gap-3 p-8 text-center"
          >
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-accent/10 text-accent">
              <UserRound className="h-10 w-10" />
            </div>
            <div className="text-2xl font-bold">{t("customer")}</div>
            <div className="text-sm text-muted-foreground">{t("customerSub")}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
