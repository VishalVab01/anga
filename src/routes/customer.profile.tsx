import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Pencil, LogOut, ClipboardList, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { BottomNav } from "@/components/BottomNav";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/customer/profile")({
  head: () => ({ meta: [{ title: "Anga - Profile" }] }),
  component: Profile,
});

function Profile() {
  const { t } = useT();
  const navigate = useNavigate();

  const logout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("rozgaar.role");
    toast.success("Logged out");
    navigate({ to: "/" });
  };

  return (
    <PageShell title={t("profile")} back="/customer" bottomNav={<BottomNav role="customer" />}>
      <div className="space-y-5">
        <div className="card-soft flex flex-col items-center gap-2 p-6 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-accent text-3xl font-bold text-accent-foreground">
            P
          </div>
          <h2 className="text-xl font-extrabold">Priya Sharma</h2>
        </div>

        <div className="card-soft divide-y divide-border">
          <Row label={t("")} value="+91 98XXXXXX22" icon={<Phone className="h-4 w-4" />} />
          <Row label={t("address")} value="Andheri, Mumbai" icon={<MapPin className="h-4 w-4" />} />
        </div>

        <div className="grid gap-3">
          <button onClick={() => toast("Edit coming soon")} className="btn-outline">
            <Pencil className="h-4 w-4" /> {t("editProfile")}
          </button>
          <Link to="/customer/my-requests" className="btn-outline">
            <ClipboardList className="h-4 w-4" /> {t("myRequests")}
          </Link>
          <button onClick={logout} className="btn-primary bg-destructive">
            <LogOut className="h-4 w-4" /> {t("logout")}
          </button>
        </div>
      </div>
    </PageShell>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 truncate text-right text-sm font-semibold">
        {icon}
        {value}
      </span>
    </div>
  );
}
