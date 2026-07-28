import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, HardHat, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { getAuthMethod, getAuthMode, setRole, type Role } from "@/lib/session";

export const Route = createFileRoute("/role-selection")({
  head: () => ({ meta: [{ title: "Anga - Continue as" }] }),
  component: RoleSelect,
});

function RoleSelect() {
  const navigate = useNavigate();
  const mode = getAuthMode();

  const pick = (role: Role) => {
    setRole(role);

    if (getAuthMethod() === "mobile") {
      navigate({ to: "/auth/phone" });
      return;
    }

    if (mode === "signup") {
      navigate({ to: role === "customer" ? "/customer/setup" : "/worker/setup" });
      return;
    }

    navigate({ to: role === "customer" ? "/customer" : "/worker" });
  };

  const goBack = () => {
    navigate({ to: mode === "login" ? "/auth/login" : "/auth/signup" });
  };

  return (
    <main className="anga-app-shell min-h-[100dvh] bg-background text-foreground">
      <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="-ml-1 grid h-10 w-10 place-items-center rounded-full text-foreground transition hover:bg-muted active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <header className="mt-7 text-center">
          <Link to="/app" className="role-brand text-[2rem] tracking-[-0.04em] text-primary">
            anga
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Find local <span className="text-primary">work</span> or hire a trusted{" "}
            <span className="text-primary">worker</span> with us
          </p>
        </header>

        <section className="mt-10">
          <h1 className="role-heading text-2xl tracking-[-0.03em]">Continue as a</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Choose how you want to use Anga and continue with your mobile number.
          </p>

          <div className="mt-7 grid gap-4">
            <RoleButton
              icon={<UserRound className="h-7 w-7" />}
              title="As a Customer"
              subtitle="Hire trusted local workers quickly."
              highlighted
              onClick={() => pick("customer")}
            />
            <RoleButton
              icon={<HardHat className="h-7 w-7" />}
              title="As a Worker"
              subtitle="Find local jobs that match your skills."
              onClick={() => pick("worker")}
            />
          </div>
        </section>

        <p className="mt-auto pt-10 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account?" : "Don’t have an account?"}{" "}
          <Link
            to={mode === "signup" ? "/auth/login" : "/auth/signup"}
            className="text-primary underline-offset-4 hover:underline"
          >
            {mode === "signup" ? "Log In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </main>
  );
}

type RoleButtonProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  highlighted?: boolean;
  onClick: () => void;
};

function RoleButton({ icon, title, subtitle, highlighted = false, onClick }: RoleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[5.75rem] w-full items-center gap-4 rounded-2xl border px-4 py-3 text-left shadow-sm transition active:scale-[0.99] ${
        highlighted
          ? "border-primary bg-primary/[0.04]"
          : "border-transparent bg-card hover:border-border"
      }`}
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-card text-primary shadow-sm">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="role-card-title block text-base">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}
