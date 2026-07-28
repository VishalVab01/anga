import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Check,
  FileCheck,
  Gauge,
  Loader2,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { PageShell } from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type ApiWorkerProfile } from "@/lib/api";
import { services } from "@/lib/data";
import { useT } from "@/lib/i18n";
import {
  getPhone,
  getProfile,
  isProfileComplete,
  saveProfile,
  setProfileComplete,
  setRole,
} from "@/lib/session";

export const Route = createFileRoute("/worker/setup")({
  head: () => ({ meta: [{ title: "Anga - Worker profile setup" }] }),
  component: WorkerSetup,
});

function WorkerSetup() {
  const { lang } = useT();
  const navigate = useNavigate();
  const [cachedProfile] = useState(() => getProfile("worker"));
  const [editing] = useState(() => isProfileComplete("worker"));
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(cachedProfile);
  const [loadingExistingProfile, setLoadingExistingProfile] = useState(editing);
  const [selected, setSelected] = useState<string[]>(() => {
    const saved = cachedProfile?.skills;
    return Array.isArray(saved) && saved.length ? saved.map(String) : ["electrician"];
  });
  const [available, setAvailable] = useState(() =>
    typeof cachedProfile?.availableToday === "boolean" ? cachedProfile.availableToday : true,
  );
  const [photoPreview, setPhotoPreview] = useState(() =>
    typeof cachedProfile?.photoUrl === "string" ? cachedProfile.photoUrl : "",
  );
  const [photoDataUrl, setPhotoDataUrl] = useState(photoPreview);
  const [photoName, setPhotoName] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    void api
      .profile()
      .then((result) => {
        const profile = result.profile as ApiWorkerProfile | null;
        if (cancelled || !profile) return;
        setProfileData({ ...profile });
        if (profile.skills.length) setSelected(profile.skills);
        setAvailable(profile.availableToday);
        setPhotoDataUrl(profile.photoUrl || "");
        setPhotoPreview(profile.photoUrl || "");
      })
      .catch(() => {
        // Cached profile still allows edits while the API wakes up.
      })
      .finally(() => {
        if (!cancelled) setLoadingExistingProfile(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editing]);

  const toggleSkill = (skill: string) => {
    setSelected((current) =>
      current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill],
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const data = new FormData(event.currentTarget);
    const phone = String(data.get("phone") || "").trim();
    const experienceYears = Number(data.get("experience"));
    const profile = {
      name: String(data.get("name") || "").trim(),
      phone,
      location: String(data.get("area") || "").trim(),
      skills: selected,
      experience: `${experienceYears} ${experienceYears === 1 ? "year" : "years"}`,
      expectedWage: Number(data.get("wage")),
      availableToday: available,
      preferredDistance: String(data.get("distance") || "5 km"),
      photoUrl: photoDataUrl,
      documentsUploaded: Boolean(data.get("document")) || Boolean(profileData?.documentsUploaded),
    };

    if (
      !profile.name ||
      phone.replace(/\D/g, "").length < 10 ||
      !profile.location ||
      selected.length === 0 ||
      !Number.isFinite(experienceYears) ||
      experienceYears < 0 ||
      profile.expectedWage < 1
    ) {
      toast.error("Add a valid phone, location, skill and expected wage");
      return;
    }

    setSubmitting(true);
    try {
      setRole("worker");
      await api.saveWorkerProfile(profile);
      saveProfile("worker", profile);
      setProfileComplete("worker", true);
      toast.success(editing ? "Profile updated" : "Profile ready");
      navigate({ to: editing ? "/worker/profile" : "/worker" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="-mx-4 -mb-8 -mt-4 min-h-[100dvh] bg-primary">
        <header className="relative overflow-hidden px-4 pb-9 pt-5 text-primary-foreground">
          <span className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/12 blur-3xl" />
          <span className="pointer-events-none absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="relative flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate({ to: editing ? "/worker/profile" : "/role-selection" })}
              aria-label="Back"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur transition active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="rounded-full bg-white/15 px-3 py-2 text-[10px] tracking-wide text-primary-foreground/80 backdrop-blur">
              {editing ? "EDIT PROFILE" : "WORK PROFILE"}
            </span>
          </div>

          <div className="relative mt-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-primary shadow-xl shadow-blue-950/20">
              <BriefcaseBusiness className="h-5 w-5" />
            </span>
            <p className="mt-5 text-xs text-primary-foreground/65">
              Build trust. Get better matches.
            </p>
            <h1 className="worker-section-title mt-1 max-w-[20rem] text-[1.85rem] leading-[1.08] tracking-[-0.04em]">
              {editing ? "Keep your work profile updated" : "Tell customers what you do best"}
            </h1>
            <p className="mt-3 max-w-[20rem] text-sm leading-5 text-primary-foreground/72">
              Your skills, location and availability help Anga rank nearby jobs for you.
            </p>
          </div>
        </header>

        <main className="mx-1.5 min-h-[75dvh] rounded-t-[2.5rem] bg-background px-4 pb-8 pt-6">
          {loadingExistingProfile ? (
            <SetupFormSkeleton />
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <section className="space-y-4 rounded-[1.65rem] bg-card p-4 shadow-[0_16px_38px_-30px_rgba(15,23,42,0.55)]">
                <SectionIntro
                  icon={<BadgeCheck className="h-4 w-4" />}
                  title="Your identity"
                  text="Shown to customers when you apply"
                />
                <Field label="Full name" hint="Use the name on your ID">
                  <Input
                    name="name"
                    defaultValue={String(profileData?.name || "")}
                    placeholder="Suresh Maurya"
                    autoComplete="name"
                    required
                  />
                </Field>
                <Field label="Mobile number" hint="For job updates and customer calls">
                  <Input
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    defaultValue={String(profileData?.phone || getPhone())}
                    placeholder="98765 43210"
                    autoComplete="tel"
                    required
                  />
                </Field>
                <Field label="Work location" hint="We show closer jobs first">
                  <LocationAutocomplete
                    name="area"
                    defaultValue={String(profileData?.location || profileData?.area || "")}
                    placeholder="Andheri West, Mumbai"
                    required
                  />
                </Field>
              </section>

              <section className="rounded-[1.65rem] bg-card p-4 shadow-[0_16px_38px_-30px_rgba(15,23,42,0.55)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <SectionIntro
                    icon={<BriefcaseBusiness className="h-4 w-4" />}
                    title="Your skills"
                    text="Select every service you can confidently do"
                  />
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[9px] text-primary">
                    {selected.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2" role="group" aria-label="Work skills">
                  {services.map((service) => {
                    const active = selected.includes(service.slug);
                    const Icon = service.icon;
                    return (
                      <button
                        type="button"
                        key={service.slug}
                        aria-pressed={active}
                        onClick={() => toggleSkill(service.slug)}
                        className={`relative flex min-h-[4.4rem] items-center gap-2.5 rounded-[1.15rem] border p-2.5 text-left transition active:scale-[0.98] ${
                          active
                            ? "border-primary bg-primary/[0.06] text-foreground"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1 text-[11px] leading-4">
                          {lang === "hi" ? service.hi : service.en}
                        </span>
                        {active && (
                          <span className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4 rounded-[1.65rem] bg-card p-4 shadow-[0_16px_38px_-30px_rgba(15,23,42,0.55)]">
                <SectionIntro
                  icon={<Wallet className="h-4 w-4" />}
                  title="Work preferences"
                  text="Set expectations before customers contact you"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Experience" hint="Years">
                    <Input
                      name="experience"
                      type="number"
                      min="0"
                      max="60"
                      defaultValue={experienceInputValue(profileData?.experience)}
                      placeholder="5"
                      required
                    />
                  </Field>
                  <Field label="Expected daily wage" hint="₹ per day">
                    <Input
                      name="wage"
                      type="number"
                      min="1"
                      defaultValue={String(profileData?.expectedWage || "")}
                      placeholder="900"
                      required
                    />
                  </Field>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs text-foreground">
                    Preferred work distance
                  </span>
                  <select
                    name="distance"
                    defaultValue={String(profileData?.preferredDistance || "5 km")}
                    className="field"
                  >
                    <option>2 km</option>
                    <option>5 km</option>
                    <option>10 km</option>
                    <option>Any nearby work</option>
                  </select>
                </label>

                <button
                  type="button"
                  role="switch"
                  aria-checked={available}
                  onClick={() => setAvailable((value) => !value)}
                  className="flex w-full items-center gap-3 rounded-[1.25rem] bg-primary/[0.06] p-3 text-left"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm">
                    <Gauge className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="worker-card-title block text-sm">
                      Available for work today
                    </span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {available
                        ? "Customers can find you now"
                        : "Your profile stays visible, but offline"}
                    </span>
                  </span>
                  <span
                    className={`relative h-7 w-12 shrink-0 rounded-full transition ${available ? "bg-primary" : "bg-muted"}`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${available ? "left-6" : "left-1"}`}
                    />
                  </span>
                </button>
              </section>

              <section className="rounded-[1.65rem] bg-card p-4 shadow-[0_16px_38px_-30px_rgba(15,23,42,0.55)]">
                <SectionIntro
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Trust profile"
                  text="A clear photo and ID can improve customer confidence"
                />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Upload
                    name="photo"
                    icon={<Camera className="h-5 w-5" />}
                    label="Profile photo"
                    helper="Clear face photo"
                    accept="image/*"
                    previewUrl={photoPreview}
                    fileName={photoName}
                    onFileSelect={async (file) => {
                      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
                        toast.error("Choose an image smaller than 5 MB");
                        return;
                      }
                      setPhotoName(file.name);
                      try {
                        const dataUrl = await fileToProfilePhotoDataUrl(file);
                        setPhotoDataUrl(dataUrl);
                        setPhotoPreview(dataUrl);
                        toast.success("Photo uploaded");
                      } catch {
                        setPhotoName("");
                        toast.error("Could not upload photo");
                      }
                    }}
                  />
                  <Upload
                    name="document"
                    icon={<FileCheck className="h-5 w-5" />}
                    label="ID document"
                    helper={
                      profileData?.documentsUploaded ? "Already uploaded" : "Optional, max 10 MB"
                    }
                    accept="image/*,.pdf"
                    fileName={documentName}
                    onFileSelect={(file) => {
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error("Choose a document smaller than 10 MB");
                        return;
                      }
                      setDocumentName(file.name);
                      toast.success("Document added");
                    }}
                  />
                </div>
              </section>

              <section className="flex items-start gap-3 rounded-[1.4rem] bg-blue-50 p-4 text-blue-950">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="worker-card-title text-xs">Nearby jobs come first</p>
                  <p className="mt-1 text-[11px] leading-5 text-blue-950/65">
                    Anga uses your selected area and distance to prioritize relevant work.
                  </p>
                </div>
              </section>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary min-h-14 w-full shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving profile…
                  </>
                ) : (
                  <>
                    <BriefcaseBusiness className="h-4 w-4" />
                    {editing ? "Save changes" : "Start finding jobs"}
                  </>
                )}
              </button>
            </form>
          )}
        </main>
      </div>
    </PageShell>
  );
}

function SectionIntro({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="worker-card-title text-sm">{title}</h2>
        <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-end justify-between gap-3 text-xs text-foreground">
        <span>{label}</span>
        {hint && <span className="text-[9px] text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="field" />;
}

function experienceInputValue(value: unknown) {
  const years = Number.parseFloat(String(value || ""));
  return Number.isFinite(years) ? String(years) : "";
}

function fileToProfilePhotoDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const size = 320;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not prepare photo"));
        return;
      }

      canvas.width = size;
      canvas.height = size;
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - sourceSize) / 2;
      const sourceY = (image.naturalHeight - sourceSize) / 2;
      context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read photo"));
    };

    image.src = objectUrl;
  });
}

function Upload({
  name,
  icon,
  label,
  helper,
  accept,
  previewUrl,
  fileName,
  onFileSelect,
}: {
  name: string;
  icon: ReactNode;
  label: string;
  helper: string;
  accept?: string;
  previewUrl?: string;
  fileName?: string;
  onFileSelect?: (file: File) => void | Promise<void>;
}) {
  return (
    <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[1.3rem] border border-dashed border-primary/25 bg-primary/[0.035] p-3 text-center transition hover:border-primary/45">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={`${label} preview`}
          className="h-16 w-16 rounded-2xl object-cover shadow-sm"
        />
      ) : (
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-primary shadow-sm">
          {icon}
        </span>
      )}
      <span className="worker-card-title text-xs">{label}</span>
      <span className="max-w-full truncate text-[9px] leading-3 text-muted-foreground">
        {fileName || helper}
      </span>
      <input
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onFileSelect?.(file);
        }}
      />
    </label>
  );
}

function SetupFormSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading profile details" aria-busy="true">
      {Array.from({ length: 3 }, (_, sectionIndex) => (
        <section key={sectionIndex} className="space-y-4 rounded-[1.65rem] bg-card p-4">
          <Skeleton className="h-10 w-44 rounded-full" />
          {Array.from({ length: sectionIndex === 1 ? 4 : 3 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </section>
      ))}
      <Skeleton className="h-14 w-full rounded-full" />
    </div>
  );
}
