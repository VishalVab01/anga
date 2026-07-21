import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileCheck,
  FileUp,
  Languages,
  LifeBuoy,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import defaultWorkerProfileImage from "@/assets/profile/construction-worker.png";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { api, type ApiWorkerProfile } from "@/lib/api";
import { serviceName } from "@/lib/data";
import { useT, type Lang } from "@/lib/i18n";
import { getProfile, logoutLocal } from "@/lib/session";

export const Route = createFileRoute("/worker/profile")({
  head: () => ({ meta: [{ title: "Anga - Profile" }] }),
  component: Profile,
});

function Profile() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ApiWorkerProfile | null>(null);

  useEffect(() => {
    const cachedProfile = getProfile("worker");
    if (cachedProfile) setProfile(profileFromCache(cachedProfile));

    api
      .profile()
      .then((result) => setProfile(result.profile as ApiWorkerProfile | null))
      .catch(() => {
        // Cached onboarding data keeps profile useful during API cold starts.
      });
  }, []);

  const completion = useMemo(() => getProfileCompletion(profile), [profile]);
  const skills = profile?.skills?.length
    ? profile.skills.map((skill) => serviceName(skill, lang)).join(", ")
    : "Add skills";
  const isVerified = Boolean(profile?.verified);
  const hasDocuments = Boolean(profile?.documentsUploaded);
  const availableToday = profile?.availableToday ?? true;

  const logout = () => {
    logoutLocal();
    toast.success("Logged out");
    navigate({ to: "/login" });
  };

  return (
    <PageShell title={t("profile")} back="/worker" bottomNav={<BottomNav role="worker" />}>
      <div className="space-y-4 pb-3">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#2f6fec] to-[#6f96ff] p-5 text-primary-foreground shadow-2xl shadow-primary/20">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <img
              src={profile?.photoUrl || defaultWorkerProfileImage}
              alt={profile?.name ? `${profile.name} profile photo` : "Worker profile photo"}
              className="h-20 w-20 shrink-0 rounded-[1.7rem] border-4 border-white/35 bg-white object-cover shadow-xl"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-black leading-tight">
                  {profile?.name || "Worker"}
                </h2>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2 py-1 text-[10px] font-black uppercase">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-primary-foreground/82">
                <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                {profile?.rating ?? 4.5} rating
                <span className="opacity-60">·</span>
                {profile?.totalJobsCompleted ?? 0} jobs done
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary-foreground/75">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{profile?.location || "Add your area"}</span>
              </p>
            </div>
          </div>

          <div className="relative mt-5 rounded-[1.3rem] bg-white/16 p-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-primary-foreground/70">Profile strength</p>
                <p className="text-lg font-black">{completion}% complete</p>
              </div>
              <Link
                to="/worker/setup"
                className="rounded-full bg-white px-3 py-2 text-xs font-black text-primary shadow-sm"
              >
                Improve
              </Link>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${completion}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2.5">
          <MiniStat
            icon={<Wallet className="h-4 w-4" />}
            label="Daily wage"
            value={profile ? `₹${profile.expectedWage}` : "-"}
          />
          <MiniStat
            icon={<BriefcaseBusiness className="h-4 w-4" />}
            label="Experience"
            value={profile?.experience || "-"}
          />
          <MiniStat
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Status"
            value={availableToday ? "Available" : "Offline"}
          />
        </section>

        <section className="rounded-[1.5rem] border border-border bg-card shadow-sm">
          <DetailRow label={t("skills")} value={skills} />
          <DetailRow label={t("phone")} value={profile?.phone || "-"} icon={<Phone />} />
          <DetailRow
            label={t("location")}
            value={profile?.location || "-"}
            icon={<MapPin />}
            last
          />
        </section>

        <section className="grid grid-cols-2 gap-3">
          <ActionTile
            icon={<Pencil />}
            title={t("editProfile")}
            text="Update skills, wage and area"
            to="/worker/setup"
          />
          <ActionTile
            icon={<FileUp />}
            title={t("uploadDocs")}
            text={hasDocuments ? "Documents uploaded" : "Add ID for trust"}
            onClick={() => toast.success(t("documentUploaded"))}
          />
          <ActionTile
            icon={<Bookmark />}
            title="Saved jobs"
            text="Jobs you want later"
            to="/worker/saved"
          />
          <ActionTile
            icon={<BriefcaseBusiness />}
            title="Applications"
            text="Track pending jobs"
            to="/worker/applications"
          />
        </section>

        <SectionTitle title="Trust and work preferences" />
        <section className="grid gap-3">
          <OptionRow
            icon={<BadgeCheck />}
            title="Verification"
            text={
              isVerified
                ? "Your profile is verified for customers."
                : "Complete document upload to unlock verified badge."
            }
            badge={isVerified ? "Verified" : "Pending"}
          />
          <OptionRow
            icon={<FileCheck />}
            title="Documents"
            text={hasDocuments ? "ID/document uploaded" : "Upload optional ID proof"}
            badge={hasDocuments ? "Uploaded" : "Needed"}
          />
          <OptionRow
            icon={<CreditCard />}
            title="Payment preferences"
            text="Cash, UPI and daily wage clarity"
            onClick={() => toast.message("Payment settings coming soon")}
          />
          <OptionRow
            icon={<Bell />}
            title="Job alerts"
            text="Get alerts for nearby matching jobs"
            to="/worker/notifications"
          />
        </section>

        <SectionTitle title="Safety and support" />
        <section className="grid gap-3">
          <OptionRow
            icon={<ShieldAlert />}
            title={t("reportIssue")}
            text="Report job, customer or payment issues"
            onClick={() => toast(t("reportIssue"))}
          />
          <OptionRow
            icon={<LifeBuoy />}
            title="Help center"
            text="Learn how Anga jobs, OTP and safety work"
            to="/assistant"
          />
          <OptionRow
            icon={<Languages />}
            title="Language"
            text="Hindi and English support"
            onClick={() => toast.message("Use the language toggle on the welcome screen")}
          />
          <OptionRow
            icon={<CircleHelp />}
            title="About Anga"
            text="Rozgar platform for trusted local work"
            onClick={() => toast.message("Anga connects workers with nearby daily-wage jobs")}
          />
        </section>

        <button onClick={logout} className="btn-primary min-h-14 w-full bg-destructive">
          <LogOut className="h-4 w-4" /> {t("logout")}
        </button>
      </div>
    </PageShell>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-card p-3 shadow-sm">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="mt-3 text-[11px] font-black uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-black text-foreground">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon,
  last = false,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
        last ? "" : "border-b border-border"
      }`}
    >
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5 truncate text-right text-sm font-black">
        {icon && <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
        {value}
      </span>
    </div>
  );
}

function ActionTile({
  icon,
  title,
  text,
  to,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  to?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>
      <p className="mt-3 text-sm font-black leading-tight">{title}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">{text}</p>
    </>
  );

  const className =
    "min-h-[8.2rem] rounded-[1.35rem] border border-border bg-card p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="px-1 pt-1 text-sm font-black uppercase text-muted-foreground">{title}</h3>;
}

function OptionRow({
  icon,
  title,
  text,
  badge,
  to,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  badge?: string;
  to?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-black">{title}</p>
          {badge && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black uppercase text-primary">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-muted-foreground">
          {text}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </>
  );

  const className =
    "flex w-full items-center gap-3 rounded-[1.25rem] border border-border bg-card p-3 text-left shadow-sm transition hover:bg-muted/40";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function getProfileCompletion(profile: ApiWorkerProfile | null) {
  if (!profile) return 25;
  const checks = [
    Boolean(profile.name),
    Boolean(profile.phone),
    Boolean(profile.location),
    Boolean(profile.skills?.length),
    Boolean(profile.experience),
    Boolean(profile.expectedWage),
    Boolean(profile.photoUrl),
    Boolean(profile.documentsUploaded),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function profileFromCache(profile: Record<string, unknown>): ApiWorkerProfile {
  return {
    _id: "",
    userId: "",
    name: String(profile.name || ""),
    phone: String(profile.phone || ""),
    skills: Array.isArray(profile.skills) ? profile.skills.map(String) : [],
    experience: String(profile.experience || ""),
    expectedWage: Number(profile.expectedWage || 0),
    availableToday: Boolean(profile.availableToday ?? true),
    preferredDistance: String(profile.preferredDistance || "5 km"),
    location: String(profile.location || profile.area || ""),
    photoUrl: typeof profile.photoUrl === "string" ? profile.photoUrl : undefined,
    documentsUploaded: Boolean(profile.documentsUploaded),
    verified: Boolean(profile.verified),
    rating: Number(profile.rating || 4.5),
    totalJobsCompleted: Number(profile.totalJobsCompleted || 0),
  };
}
