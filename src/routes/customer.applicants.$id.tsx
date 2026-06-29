import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, FileCheck, Phone, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { api, type ApiWorkerProfile } from "@/lib/api";
import { serviceName } from "@/lib/data";
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
            })),
        );
      })
      .catch((err) => {
        setApplicants([]);
        setError(err instanceof Error ? err.message : "Could not load applicants");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <PageShell title={t("viewApplicants")} back="/customer/my-requests">
      <div className="space-y-4">
        <div className="card-soft bg-primary/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            {service ? serviceName(service, lang) : t("applicants")}
          </p>
          <h2 className="mt-1 text-lg font-extrabold">{jobTitle || "Posted job"}</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${applicants.length} ${t("applicants")}`}
          </p>
        </div>

        {error && (
          <p className="rounded-2xl bg-destructive/10 p-4 text-center text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        {!loading && applicants.length === 0 && (
          <p className="rounded-2xl bg-muted p-4 text-center text-sm text-muted-foreground">
            {lang === "hi"
              ? "इस काम पर अभी कोई वास्तविक आवेदन नहीं आया है।"
              : "No real applicants have applied to this job yet."}
          </p>
        )}

        {applicants.map((item) => (
          <ApplicantCard
            key={item.applicationId}
            jobId={id}
            workerId={item.workerId}
            status={item.status}
            worker={item.worker}
          />
        ))}
      </div>
    </PageShell>
  );
}

function ApplicantCard({
  jobId,
  workerId,
  status,
  worker,
}: {
  jobId: string;
  workerId: string;
  status: string;
  worker: ApiWorkerProfile;
}) {
  const { t, lang } = useT();
  const assign = async () => {
    try {
      await api.assign(jobId, workerId);
      toast.success(`${worker.name} assigned`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not assign worker");
    }
  };
  return (
    <div className="card-soft p-4">
      <Link
        to="/customer/worker/$id"
        params={{ id: worker.userId }}
        className="flex items-start gap-3"
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary/10 text-lg font-extrabold text-primary">
          {worker.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold">{worker.name}</h3>
          <p className="text-sm text-muted-foreground">
            {serviceName(worker.skills[0], lang)} · {worker.experience} · {worker.location}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 font-semibold">
              <Star className="h-3 w-3 fill-current text-amber-500" /> {worker.rating}
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-1 font-bold text-primary">
              ₹{worker.expectedWage}
            </span>
            {worker.verified && (
              <Pill icon={<BadgeCheck className="h-3 w-3" />} text={t("verified")} />
            )}
            {worker.documentsUploaded && (
              <Pill icon={<FileCheck className="h-3 w-3" />} text={t("documentUploaded")} />
            )}
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold capitalize text-primary">
          {status}
        </span>
      </Link>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <a href={`tel:${worker.phone.replace(/\s/g, "")}`} className="btn-outline">
          <Phone className="h-4 w-4" /> {t("call")}
        </a>
        <button onClick={assign} className="btn-primary">
          {t("assign")}
        </button>
      </div>
    </div>
  );
}

type Applicant = {
  applicationId: string;
  workerId: string;
  status: string;
  worker: ApiWorkerProfile;
};

function Pill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 font-semibold text-success">
      {icon}
      {text}
    </span>
  );
}
