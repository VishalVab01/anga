import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  FileCheck,
  Phone,
  Star,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CardListSkeleton } from "@/components/AppLoadingSkeletons";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type ApiWorkerProfile } from "@/lib/api";
import { seedRequests, serviceName, workers } from "@/lib/data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/customer/applicants/$id")({
  head: () => ({ meta: [{ title: "Anga - Applicants" }] }),
  component: Applicants,
});

function Applicants() {
  const { id } = Route.useParams();
  const { t, lang } = useT();
  const [jobTitle, setJobTitle] = useState("");
  const [service, setService] = useState("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .applicants(id)
      .then((result) => {
        setJobTitle(result.job.title);
        setService(result.job.category);
        setApplicants(
          result.applicants
            .filter((item) => item.worker)
            .map((item) => ({
              applicationId: item.application._id,
              workerId: item.application.workerId,
              status: item.application.status,
              worker: item.worker!,
              apiBacked: true,
            })),
        );
      })
      .catch((requestError) => {
        const demoRequest = seedRequests.find((request) => request.id === id);
        if (demoRequest) {
          setJobTitle(demoRequest.title[lang]);
          setService(demoRequest.service);
          setApplicants(
            workers.slice(0, demoRequest.applicants).map((worker, index) => ({
              applicationId: `demo-${id}-${worker.id}`,
              workerId: worker.id,
              status: index === 0 && demoRequest.status.en === "Assigned" ? "accepted" : "pending",
              worker: {
                _id: worker.id,
                userId: worker.id,
                name: worker.name,
                phone: worker.phone,
                skills: [worker.skill],
                experience: worker.experience,
                expectedWage: worker.expectedWage,
                availableToday: worker.availableToday,
                preferredDistance: `${worker.distanceKm} km`,
                location: worker.area,
                documentsUploaded: worker.documentUploaded,
                verified: worker.verified,
                rating: worker.rating,
                totalJobsCompleted: worker.completedJobs,
              },
              apiBacked: false,
            })),
          );
          setError("");
          return;
        }
        setApplicants([]);
        setError(
          requestError instanceof Error ? requestError.message : "Could not load applicants",
        );
      })
      .finally(() => setLoading(false));
  }, [id, lang]);

  return (
    <PageShell bottomNav={<BottomNav role="customer" />}>
      <div className="-mx-4 -mb-28 -mt-4 min-h-[100dvh] bg-primary pb-28">
        <header className="relative overflow-hidden px-4 pb-8 pt-5 text-primary-foreground">
          <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <Link
              to="/customer/my-requests"
              aria-label="Back to posted jobs"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {loading ? (
              <Skeleton className="h-7 w-20 rounded-full bg-white/20" />
            ) : (
              <span className="rounded-full bg-white/12 px-3 py-1.5 text-[11px] text-primary-foreground/80">
                {applicants.length} applicants
              </span>
            )}
          </div>

          <div className="relative mt-6">
            <p className="text-xs text-primary-foreground/65">
              {service ? serviceName(service, lang) : "Hiring matches"}
            </p>
            {loading ? (
              <div className="mt-2 space-y-3">
                <Skeleton className="h-7 w-4/5 rounded-full bg-white/20" />
                <Skeleton className="h-4 w-3/5 rounded-full bg-white/20" />
              </div>
            ) : (
              <>
                <h1 className="customer-section-title mt-1 text-[1.75rem] leading-tight">
                  {jobTitle || t("viewApplicants")}
                </h1>
                <p className="mt-2 max-w-[19rem] text-sm leading-5 text-primary-foreground/70">
                  Compare skills, ratings, wages and trust signals before assigning a worker.
                </p>
              </>
            )}
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-2.5">
            <HeaderFact icon={<Users />} value={`${applicants.length}`} label="Total matches" />
            <HeaderFact
              icon={<UserCheck />}
              value={`${applicants.filter((item) => item.worker.verified).length}`}
              label="Verified"
            />
          </div>
        </header>

        <main className="mx-1.5 min-h-[65dvh] rounded-t-[2.5rem] bg-background px-4 pb-7 pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="customer-section-title text-base">Worker matches</h2>
            <span className="text-xs text-muted-foreground">Best rated first</span>
          </div>

          {loading && <CardListSkeleton count={3} />}

          {error && (
            <p className="rounded-[1.3rem] bg-destructive/10 p-4 text-center text-xs text-destructive">
              {error}
            </p>
          )}

          {!loading && !error && applicants.length === 0 && (
            <div className="rounded-[1.75rem] border border-dashed border-primary/25 bg-primary/5 px-6 py-10 text-center">
              <Users className="mx-auto h-9 w-9 text-primary" />
              <p className="customer-card-title mt-3 text-sm">No applicants yet</p>
              <p className="mx-auto mt-1 max-w-56 text-xs leading-5 text-muted-foreground">
                New workers will appear here as soon as they apply.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {applicants.map((item) => (
              <ApplicantCard
                key={item.applicationId}
                jobId={id}
                workerId={item.workerId}
                status={item.status}
                worker={item.worker}
                apiBacked={item.apiBacked}
                onAssigned={() =>
                  setApplicants((current) =>
                    current.map((applicant) => ({
                      ...applicant,
                      status:
                        applicant.workerId === item.workerId
                          ? "accepted"
                          : applicant.status === "pending"
                            ? "rejected"
                            : applicant.status,
                    })),
                  )
                }
              />
            ))}
          </div>
        </main>
      </div>
    </PageShell>
  );
}

function HeaderFact({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[1.25rem] bg-white/12 p-3 backdrop-blur">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
      <span>
        <span className="customer-card-title block text-lg leading-none">{value}</span>
        <span className="mt-1 block text-[10px] text-primary-foreground/65">{label}</span>
      </span>
    </div>
  );
}

function ApplicantCard({
  jobId,
  workerId,
  status,
  worker,
  apiBacked,
  onAssigned,
}: {
  jobId: string;
  workerId: string;
  status: string;
  worker: ApiWorkerProfile;
  apiBacked: boolean;
  onAssigned: () => void;
}) {
  const { t, lang } = useT();
  const [assigning, setAssigning] = useState(false);
  const canAssign = status === "pending";

  const assign = async () => {
    if (!canAssign || assigning) return;
    setAssigning(true);
    try {
      if (apiBacked) await api.assign(jobId, workerId);
      toast.success(`${worker.name} assigned`);
      onAssigned();
    } catch (assignError) {
      toast.error(assignError instanceof Error ? assignError.message : "Could not assign worker");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-[1.55rem] border border-white bg-gradient-to-br from-white via-white to-blue-50 p-3.5 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.6)]">
      <Link
        to="/customer/worker/$id"
        params={{ id: worker.userId }}
        className="group flex items-start gap-3"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.1rem] bg-primary text-base text-primary-foreground shadow-md shadow-primary/20">
          {worker.name.charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block text-[9px] text-primary">
                {serviceName(worker.skills[0], lang)}
              </span>
              <span className="customer-card-title mt-0.5 block truncate text-sm">
                {worker.name}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[9px] capitalize text-primary">
              {status}
            </span>
          </span>
          <span className="mt-1.5 block truncate text-[10px] text-muted-foreground">
            {worker.experience} · {worker.location}
          </span>
          <span className="mt-2 flex flex-wrap gap-1.5 text-[9px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 shadow-sm">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {worker.rating}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-primary shadow-sm">
              <Wallet className="h-3 w-3" /> ₹{worker.expectedWage}
            </span>
            {worker.verified && <Pill icon={<BadgeCheck />} text={t("verified")} />}
            {worker.documentsUploaded && <Pill icon={<FileCheck />} text="Docs" />}
          </span>
        </span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-background transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-primary/10 pt-3">
        <a href={`tel:${worker.phone.replace(/\s/g, "")}`} className="btn-outline min-h-11">
          <Phone className="h-4 w-4" /> {t("call")}
        </a>
        <button
          type="button"
          onClick={assign}
          disabled={!canAssign || assigning}
          className="btn-primary min-h-11 disabled:opacity-60"
        >
          {assigning ? "Assigning…" : status === "accepted" ? "Assigned" : t("assign")}
        </button>
      </div>
    </article>
  );
}

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-success [&>svg]:h-3 [&>svg]:w-3">
      {icon} {text}
    </span>
  );
}

type Applicant = {
  applicationId: string;
  workerId: string;
  status: string;
  worker: ApiWorkerProfile;
  apiBacked: boolean;
};
