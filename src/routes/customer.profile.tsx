import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  Languages,
  LifeBuoy,
  LogOut,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Star,
  Store,
  UserCheck,
  Users,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { api, type ApiCustomerProfile, type ApiJob, type ApiNotification } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { getProfile, logoutLocal } from "@/lib/session";

export const Route = createFileRoute("/customer/profile")({
  head: () => ({ meta: [{ title: "Anga - Profile" }] }),
  component: Profile,
});

function Profile() {
  const { t } = useT();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ApiCustomerProfile | null>(null);
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  useEffect(() => {
    const cachedProfile = getProfile("customer");
    if (cachedProfile) setProfile(profileFromCache(cachedProfile));

    api
      .profile()
      .then((result) => setProfile(result.profile as ApiCustomerProfile | null))
      .catch(() => {
        // Cached onboarding data keeps profile useful during API cold starts.
      });

    api
      .jobs("?mine=true")
      .then((result) => setJobs(result.jobs))
      .catch(() => setJobs([]));

    api
      .notifications()
      .then((result) => setNotifications(result.notifications))
      .catch(() => setNotifications([]));
  }, []);

  const completion = useMemo(() => getProfileCompletion(profile), [profile]);
  const activeJobs = jobs.filter((job) => job.status === "open" || job.status === "assigned");
  const completedJobs = jobs.filter((job) => job.status === "completed");
  const totalApplicants = jobs.reduce((sum, job) => sum + job.applicants.length, 0);
  const unreadNotifications = notifications.filter((item) => !item.read).length;
  const customerType = formatCustomerType(profile?.customerType);
  const avatarInitial = (profile?.name?.trim()?.charAt(0) || "C").toUpperCase();

  const logout = () => {
    logoutLocal();
    toast.success("Logged out");
    navigate({ to: "/login" });
  };

  return (
    <PageShell title={t("profile")} back="/customer" bottomNav={<BottomNav role="customer" />}>
      <div className="space-y-4 pb-3">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#2f6fec] to-[#7da2ff] p-5 text-primary-foreground shadow-2xl shadow-primary/20">
          <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[1.7rem] border-4 border-white/35 bg-white/18 text-3xl font-black shadow-xl">
              {avatarInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-2xl font-black leading-tight">
                  {profile?.name || "Customer"}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-2 py-1 text-[10px] font-black uppercase">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Trusted
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-primary-foreground/82">
                <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                {profile?.rating ?? 4.8} hiring rating
                <span className="opacity-60">·</span>
                {customerType}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary-foreground/75">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{profile?.address || "Add hiring location"}</span>
              </p>
            </div>
          </div>

          <div className="relative mt-5 rounded-[1.3rem] bg-white/16 p-3 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-primary-foreground/70">Hiring profile</p>
                <p className="text-lg font-black">{completion}% complete</p>
              </div>
              <Link
                to="/customer/setup"
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
            icon={<ClipboardList className="h-4 w-4" />}
            label="Active"
            value={String(activeJobs.length)}
            text="jobs open"
          />
          <MiniStat
            icon={<Users className="h-4 w-4" />}
            label="Applicants"
            value={String(totalApplicants)}
            text="workers"
          />
          <MiniStat
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Completed"
            value={String(completedJobs.length)}
            text="hires"
          />
        </section>

        <section className="rounded-[1.5rem] border border-border bg-card shadow-sm">
          <DetailRow label={t("phone")} value={profile?.phone || "-"} icon={<Phone />} />
          <DetailRow label={t("address")} value={profile?.address || "-"} icon={<MapPin />} />
          <DetailRow label={t("ownerType")} value={customerType} icon={<Home />} last />
        </section>

        <section className="grid grid-cols-2 gap-3">
          <ActionTile
            icon={<Pencil />}
            title={t("editProfile")}
            text="Update name, phone and address"
            to="/customer/setup"
          />
          <ActionTile
            icon={<Plus />}
            title={t("postJob")}
            text="Create a new local job"
            to="/customer/request"
          />
          <ActionTile
            icon={<ClipboardList />}
            title={t("myRequests")}
            text="Track posted jobs"
            to="/customer/my-requests"
          />
          <ActionTile
            icon={<Bell />}
            title="Notifications"
            text={
              unreadNotifications > 0
                ? `${unreadNotifications} unread updates`
                : "Hiring updates and alerts"
            }
            to="/customer/notifications"
          />
        </section>

        <SectionTitle title="Hiring and trust" />
        <section className="grid gap-3">
          <OptionRow
            icon={<UserCheck />}
            title="Verified workers"
            text="Hire workers with ratings, documents and trust badges."
            badge="Recommended"
          />
          <OptionRow
            icon={<FileText />}
            title="Hiring history"
            text="Review past requests, applicants and completed work."
            to="/customer/my-requests"
          />
          <OptionRow
            icon={<CreditCard />}
            title="Payment preferences"
            text="Keep budgets clear with cash or UPI payment notes."
            onClick={() => toast.message("Payment settings coming soon")}
          />
          <OptionRow
            icon={<Bookmark />}
            title="Saved workers"
            text="Shortlist good workers for future jobs."
            onClick={() => toast.message("Saved workers coming soon")}
          />
        </section>

        <SectionTitle title="Safety and support" />
        <section className="grid gap-3">
          <OptionRow
            icon={<ShieldAlert />}
            title={t("reportIssue")}
            text="Report worker, job, payment or safety issues."
            onClick={() => toast(t("reportIssue"))}
          />
          <OptionRow
            icon={<LifeBuoy />}
            title="Help center"
            text="Ask Anga Sahayak about hiring and job posting."
            to="/assistant"
          />
          <OptionRow
            icon={<Languages />}
            title="Language"
            text="Hindi and English support for local hiring."
            onClick={() => toast.message("Use the language toggle on the welcome screen")}
          />
          <OptionRow
            icon={<WalletCards />}
            title="Budget guidance"
            text="Get suggested daily wages by job type and area."
            onClick={() => toast.message("Anga shows wage estimates while posting jobs")}
          />
          <OptionRow
            icon={<CircleHelp />}
            title="About Anga"
            text="A Rozgar platform for nearby verified daily-wage work."
            onClick={() => toast.message("Anga helps customers hire trusted local workers")}
          />
        </section>

        <button onClick={logout} className="btn-primary min-h-14 w-full bg-destructive">
          <LogOut className="h-4 w-4" /> {t("logout")}
        </button>
      </div>
    </PageShell>
  );
}

function MiniStat({
  icon,
  label,
  value,
  text,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-card p-3 shadow-sm">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="mt-3 text-[11px] font-black uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black leading-none text-foreground">{value}</p>
      <p className="mt-1 truncate text-[11px] font-bold text-muted-foreground">{text}</p>
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
        {icon && <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
        <span className="truncate">{value}</span>
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

function getProfileCompletion(profile: ApiCustomerProfile | null) {
  if (!profile) return 25;
  const checks = [
    Boolean(profile.name),
    Boolean(profile.phone),
    Boolean(profile.address),
    Boolean(profile.customerType),
    Boolean(profile.rating),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function profileFromCache(profile: Record<string, unknown>): ApiCustomerProfile {
  return {
    _id: "",
    userId: "",
    name: String(profile.name || ""),
    phone: String(profile.phone || ""),
    address: String(profile.address || profile.location || ""),
    customerType: String(profile.customerType || "homeowner"),
    rating: Number(profile.rating || 4.8),
  };
}

function formatCustomerType(type?: string) {
  if (type === "shop_owner") return "Shop owner";
  if (type === "contractor") return "Contractor";
  if (type === "homeowner") return "Homeowner";
  return type || "Customer";
}
