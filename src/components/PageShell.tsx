import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        {(title || back) && (
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
            {back && (
              <Link
                to={back}
                aria-label="Back"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}
            {title && <h1 className="truncate text-lg font-bold">{title}</h1>}
          </header>
        )}
        <main className={`flex-1 px-4 pt-4 ${bottomNav ? "pb-28" : "pb-8"}`}>{children}</main>
        {bottomNav}
      </div>
    </div>
  );
}
