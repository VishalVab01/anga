import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MapPin, Star, Phone, Bookmark, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { useT } from "@/lib/i18n";
import { jobs, services } from "@/lib/data";

export const Route = createFileRoute("/worker/job/$id")({
  head: () => ({ meta: [{ title: "Anga - Job details" }] }),
  component: JobDetails,
  notFoundComponent: () => <div className="p-8 text-center">Job not found</div>,
});

function JobDetails() {
  const { id } = Route.useParams();
  const { t, lang } = useT();
  const navigate = useNavigate();
  const job = jobs.find((j) => j.id === id);
  if (!job) return <PageShell title="Not found" back="/worker"><p>Job not found</p></PageShell>;
  const svc = services.find((s) => s.slug === job.service);

  return (
    <PageShell title={job.title[lang]} back="/worker">
      <div className="space-y-5">
        <div className="card-soft p-5">
          <div className="flex items-center gap-3">
           <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MapPin className="h-7 w-7" />
          </div>  
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold">{job.title[lang]}</h2>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {job.location[lang]}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
            <span className="text-sm text-muted-foreground">{t("payment")}</span>
            <span className="text-xl font-extrabold text-primary">₹{job.payment}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" /> {job.date[lang]}
          </div>
        </div>

        <div className="card-soft p-5">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
            {t("description")}
          </h3>
          <p className="mt-2 text-base">{job.description[lang]}</p>
        </div>

        <div className="card-soft p-5">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Customer</h3>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-lg font-bold text-accent">
              {job.customer[lang].charAt(0)}
            </div>
            <div>
              <p className="font-bold">{job.customer[lang]}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-current text-amber-500" /> {job.rating}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => toast.success(t("saved"))} className="btn-outline">
            <Bookmark className="h-4 w-4" /> {t("saveJob")}
          </button>
          <a href={`tel:${job.phone.replace(/\s/g, "")}`} className="btn-outline">
            <Phone className="h-4 w-4" /> {t("callCustomer")}
          </a>
        </div>

        <button
          onClick={() => {
            toast.success("Application sent ✓");
            setTimeout(() => navigate({ to: "/worker/applications" }), 700);
          }}
          className="btn-primary w-full text-lg"
        >
          {t("apply")}
        </button>
      </div>
    </PageShell>
  );
}
