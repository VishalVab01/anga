import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "./AppShell";

export function PageShell({
  children,
  title,
  back,
  bottomNav,
}: {
  children: ReactNode;
  title?: string;
  back?: string;
  bottomNav?: ReactNode;
}) {
  return (
    <AppShell>
      {(title || back) && (
        <header className="sticky top-2 z-30 mx-3 mt-2 flex items-center gap-3 rounded-[1.5rem] border border-white/80 bg-card/90 px-3 py-2.5 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.55)] backdrop-blur-xl">
          {back && (
            <Link
              to={back}
              aria-label="Back"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          {title && <h1 className="app-page-title truncate text-base">{title}</h1>}
        </header>
      )}
      <main className={`flex-1 px-4 pt-4 ${bottomNav ? "pb-28" : "pb-8"}`}>{children}</main>
      {bottomNav}
    </AppShell>
  );
}
