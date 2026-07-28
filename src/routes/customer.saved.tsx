import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, MapPin, Phone, Star, Trash2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { serviceName } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { getSavedWorkers, removeSavedWorker, type SavedWorker } from "@/lib/savedWorkers";

export const Route = createFileRoute("/customer/saved")({
  head: () => ({ meta: [{ title: "Anga - Saved workers" }] }),
  component: SavedWorkers,
});

function SavedWorkers() {
  const { lang } = useT();
  const [items, setItems] = useState<SavedWorker[]>([]);

  useEffect(() => {
    setItems(getSavedWorkers());
  }, []);

  return (
    <PageShell bottomNav={<BottomNav role="customer" />}>
      <div className="-mx-4 -mb-28 -mt-4 min-h-[100dvh] bg-primary pb-28">
        <header className="relative overflow-hidden px-4 pb-8 pt-5 text-primary-foreground">
          <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <Link
            to="/customer/profile"
            aria-label="Back to profile"
            className="relative grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="relative mt-6">
            <p className="text-xs text-primary-foreground/65">Your trusted shortlist</p>
            <h1 className="customer-section-title mt-1 text-[1.85rem] leading-tight">
              Saved workers
            </h1>
            <p className="mt-2 max-w-[19rem] text-sm leading-5 text-primary-foreground/70">
              Keep reliable local workers ready for your next task.
            </p>
          </div>
        </header>

        <main className="mx-1.5 min-h-[68dvh] rounded-t-[2.5rem] bg-background px-4 pb-7 pt-6">
          {items.length === 0 ? (
            <section className="rounded-[1.75rem] border border-dashed border-primary/25 bg-primary/5 px-6 py-12 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-primary shadow-sm">
                <Bookmark className="h-6 w-6" />
              </span>
              <h2 className="customer-card-title mt-4 text-base">No saved workers yet</h2>
              <p className="mx-auto mt-2 max-w-60 text-xs leading-5 text-muted-foreground">
                Save a worker from their profile to quickly find them here later.
              </p>
              <Link to="/customer" className="btn-primary mx-auto mt-6 min-h-12 w-fit px-6">
                Browse workers
              </Link>
            </section>
          ) : (
            <div className="space-y-3">
              {items.map((worker) => (
                <article
                  key={worker.id}
                  className="rounded-[1.55rem] border border-white bg-gradient-to-br from-white via-white to-blue-50 p-4 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.6)]"
                >
                  <div className="flex items-start gap-3">
                    {worker.photoUrl ? (
                      <img
                        src={worker.photoUrl}
                        alt={`${worker.name} profile`}
                        className="h-12 w-12 shrink-0 rounded-[1.1rem] object-cover"
                      />
                    ) : (
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.1rem] bg-primary text-primary-foreground">
                        {worker.name.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] text-primary">{serviceName(worker.skill, lang)}</p>
                      <h2 className="customer-card-title mt-0.5 truncate text-sm">{worker.name}</h2>
                      <p className="mt-1.5 flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" /> {worker.area}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setItems(removeSavedWorker(worker.id))}
                      aria-label={`Remove ${worker.name} from saved workers`}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-primary/10 pt-3 text-[10px]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-amber-600 shadow-sm">
                      <Star className="h-3 w-3 fill-current" /> {worker.rating}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-primary shadow-sm">
                      <Wallet className="h-3 w-3" /> ₹{worker.expectedWage}
                    </span>
                    {worker.verified && (
                      <span className="rounded-full bg-success/10 px-2.5 py-1.5 text-success">
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <a
                      href={`tel:${worker.phone.replace(/\s/g, "")}`}
                      className="btn-outline min-h-11"
                    >
                      <Phone className="h-4 w-4" /> Call
                    </a>
                    <Link
                      to="/customer/worker/$id"
                      params={{ id: worker.id }}
                      className="btn-primary min-h-11"
                    >
                      View profile
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </PageShell>
  );
}
