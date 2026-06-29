import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, FileCheck, MapPin } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { PageShell } from "@/components/PageShell";
import { api } from "@/lib/api";
import { services } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { getPhone, saveProfile, setProfileComplete, setRole } from "@/lib/session";

export const Route = createFileRoute("/worker/setup")({
  head: () => ({ meta: [{ title: "Anga - Worker setup" }] }),
  component: WorkerSetup,
});

function WorkerSetup() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(["electrician"]);
  const [available, setAvailable] = useState(true);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [documentName, setDocumentName] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const profile = {
      name: data.get("name"),
      phone: data.get("phone"),
      location: data.get("area"),
      skills: selected,
      experience: data.get("experience"),
      expectedWage: data.get("wage"),
      availableToday: available,
      preferredDistance: data.get("distance"),
      photoUrl: photoDataUrl,
      documentsUploaded: Boolean(data.get("document")),
    };
    try {
      setRole("worker");
      await api.saveWorkerProfile(profile);
      saveProfile("worker", profile);
      setProfileComplete("worker", true);
      toast.success(lang === "hi" ? "प्रोफाइल तैयार है" : "Profile ready");
      navigate({ to: "/worker" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save profile");
    }
  };

  return (
    <PageShell title={t("workerSetup")} back="/auth/otp">
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("name")}>
          <Input name="name" placeholder="Suresh Maurya" required />
        </Field>
        <Field label={t("phone")}>
          <Input name="phone" defaultValue={getPhone()} required />
        </Field>
        <Field label={t("location")}>
          <LocationAutocomplete name="area" placeholder="Andheri West, Mumbai" required />
        </Field>

        <Field label={t("skills")}>
          <div className="grid grid-cols-2 gap-2">
            {services.map((service) => {
              const active = selected.includes(service.slug);
              return (
                <button
                  type="button"
                  key={service.slug}
                  onClick={() =>
                    setSelected((prev) =>
                      active
                        ? prev.filter((item) => item !== service.slug)
                        : [...prev, service.slug],
                    )
                  }
                  className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card"
                  }`}
                >
                  {lang === "hi" ? service.hi : service.en}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2">
          <Field label={lang === "hi" ? "अनुभव (वर्षों में)" : "Experience (in years)"}>
            <Input name="experience" type="number" min="0" placeholder="5" required />
          </Field>
          <Field label={t("expectedWage")}>
            <Input name="wage" type="number" placeholder="900" required />
          </Field>
        </div>

        <label className="card-soft flex items-center justify-between p-4">
          <span className="font-semibold">{t("availableToday")}</span>
          <input
            type="checkbox"
            checked={available}
            onChange={(event) => setAvailable(event.target.checked)}
            className="h-6 w-6 accent-primary"
          />
        </label>

        <Field label={t("preferredDistance")}>
          <select name="distance" className="field">
            <option>2 km</option>
            <option>5 km</option>
            <option>10 km</option>
            <option>Any nearby work</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Upload
            name="photo"
            icon={<Camera className="h-5 w-5" />}
            label={t("uploadPhoto")}
            accept="image/*"
            previewUrl={photoPreview}
            fileName={photoName}
            onFileSelect={async (file) => {
              setPhotoName(file.name);
              try {
                const dataUrl = await fileToProfilePhotoDataUrl(file);
                setPhotoDataUrl(dataUrl);
                setPhotoPreview(dataUrl);
                toast.success(
                  lang === "hi" ? "फोटो सफलतापूर्वक अपलोड हुई" : "Photo successfully uploaded",
                );
              } catch {
                setPhotoName("");
                toast.error(lang === "hi" ? "फोटो अपलोड नहीं हुई" : "Could not upload photo");
              }
            }}
          />
          <Upload
            name="document"
            icon={<FileCheck className="h-5 w-5" />}
            label={t("optionalDocument")}
            fileName={documentName}
            onFileSelect={(file) => {
              setDocumentName(file.name);
              toast.success(
                lang === "hi" ? "दस्तावेज सफलतापूर्वक अपलोड हुआ" : "Document successfully uploaded",
              );
            }}
          />
        </div>

        <div className="card-soft flex items-center gap-3 bg-primary/5 p-4 text-sm text-primary">
          <MapPin className="h-5 w-5 shrink-0" />
          <span>
            {lang === "hi" ? "आपको पास के काम पहले दिखेंगे।" : "Nearby work will be shown first."}
          </span>
        </div>

        <button type="submit" className="btn-primary w-full text-lg">
          {t("startFindingJobs")}
        </button>
      </form>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex min-h-10 items-end text-sm font-semibold leading-tight">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="field" />;
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
  accept,
  previewUrl,
  fileName,
  onFileSelect,
}: {
  name: string;
  icon: ReactNode;
  label: string;
  accept?: string;
  previewUrl?: string;
  fileName?: string;
  onFileSelect?: (file: File) => void | Promise<void>;
}) {
  return (
    <label className="card-soft flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden p-3 text-center text-sm font-semibold transition hover:border-primary/40">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={`${label} preview`}
          className="h-20 w-20 rounded-2xl object-cover shadow-sm"
        />
      ) : (
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </span>
      )}
      <span>{label}</span>
      {fileName && (
        <span className="max-w-full truncate rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary">
          {fileName}
        </span>
      )}
      <input
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelect?.(file);
        }}
      />
    </label>
  );
}
