import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileUp, LogOut, MapPin, Pencil, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { PageShell } from "@/components/PageShell";
import { api, type ApiWorkerProfile } from "@/lib/api";
import { serviceName } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { logoutLocal } from "@/lib/session";

export const Route = createFileRoute("/worker/profile")({
  head: () => ({ meta: [{ title: "Anga - Profile" }] }),
  component: Profile,
});

function Profile() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ApiWorkerProfile | null>(null);

  useEffect(() => {
    api
      .profile()
      .then((result) => setProfile(result.profile as ApiWorkerProfile | null))
      .catch(() => setProfile(null));
  }, []);

  const logout = () => {
    logoutLocal();
    toast.success("Logged out");
    navigate({ to: "/" });
  };

  return (
    <PageShell title={t("profile")} back="/worker" bottomNav={<BottomNav role="worker" />}>
      <div className="space-y-5">
        <div className="card-soft flex flex-col items-center gap-2 p-6 text-center">
          {profile?.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.name ? `${profile.name} profile photo` : "Worker profile photo"}
              className="h-20 w-20 rounded-full border-4 border-primary/10 object-cover shadow-sm"
            />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
              {profile?.name?.charAt(0) || "W"}
            </div>
          )}
          <h2 className="text-xl font-extrabold">{profile?.name || "Worker"}</h2>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-current text-amber-500" /> {profile?.rating ?? 4.5} ·{" "}
            {t("rating")}
          </p>
        </div>
        <div className="card-soft divide-y divide-border">
          <Row
            label={t("skills")}
            value={profile?.skills?.map((skill) => serviceName(skill, lang)).join(", ") || "-"}
          />
          <Row label={t("experience")} value={profile?.experience || "-"} />
          <Row label={t("expectedWage")} value={profile ? `₹${profile.expectedWage}` : "-"} />
          <Row
            label={t("location")}
            value={profile?.location || "-"}
            icon={<MapPin className="h-4 w-4" />}
          />
        </div>
        <div className="grid gap-3">
          <button onClick={() => toast("Edit coming soon")} className="btn-outline">
            <Pencil className="h-4 w-4" /> {t("editProfile")}
          </button>
          <button onClick={() => toast.success(t("documentUploaded"))} className="btn-outline">
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
