import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Star, Pencil, FileUp, LogOut, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/PageShell";
import { BottomNav } from "@/components/BottomNav";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/worker/profile")({
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
    <PageShell title={t("profile")} back="/worker" bottomNav={<BottomNav role="worker" />}>
      <div className="space-y-5">
        <div className="card-soft flex flex-col items-center gap-2 p-6 text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
            S
          </div>
          <h2 className="text-xl font-extrabold">Suresh Kumar</h2>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-current text-amber-500" /> 4.7 · {t("rating")}
          </p>
        </div>

        <div className="card-soft divide-y divide-border">
          <Row label={t("skills")} value="Electrician, Plumber" />
          <Row label={t("experience")} value="5 years" />
          <Row label={t("phone")} value="+91 98XXXXXX10" icon={<Phone className="h-4 w-4" />} />
          <Row label={t("location")} value="Mumbai, MH" icon={<MapPin className="h-4 w-4" />} />
        </div>

        <div className="grid gap-3">
          <button onClick={() => toast("Edit coming soon")} className="btn-outline">
            <Pencil className="h-4 w-4" /> {t("editProfile")}
          </button>
          <button onClick={() => toast("Upload coming soon")} className="btn-outline">
            <FileUp className="h-4 w-4" /> {t("uploadDocs")}
          </button>
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
