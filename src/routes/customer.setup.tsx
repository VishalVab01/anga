import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  Camera,
  Check,
  Home,
  Loader2,
  MapPin,
  ShieldCheck,
  Store,
  UserRound,
  type LucideIcon,
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
import { api, type ApiCustomerProfile } from "@/lib/api";
import { useT } from "@/lib/i18n";
import {
  getPhone,
  getProfile,
  isProfileComplete,
  saveProfile,
  setProfileComplete,
  setRole,
} from "@/lib/session";

export const Route = createFileRoute("/customer/setup")({
  head: () => ({ meta: [{ title: "Anga - Customer profile setup" }] }),
  component: CustomerSetup,
});

type CustomerType = "homeowner" | "shop_owner" | "contractor";

const CUSTOMER_TYPES: Array<{
  value: CustomerType;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    value: "homeowner",
    label: "Homeowner",
    description: "Help for repairs, cleaning and everyday home tasks",
    icon: Home,
  },
  {
    value: "shop_owner",
    label: "Shop owner",
    description: "Reliable support for your shop or small business",
    icon: Store,
  },
  {
    value: "contractor",
    label: "Contractor",
    description: "Hire skilled workers for projects and site work",
    icon: Building2,
  },
];

function CustomerSetup() {
  const { lang } = useT();
  const navigate = useNavigate();
  const [cachedProfile] = useState(() => getProfile("customer"));
  const [editing] = useState(() => isProfileComplete("customer"));
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(cachedProfile);
  const [loadingExistingProfile, setLoadingExistingProfile] = useState(editing);
  const [photoUrl, setPhotoUrl] = useState(() =>
    typeof cachedProfile?.photoUrl === "string" ? cachedProfile.photoUrl : "",
  );
  const [ownerType, setOwnerType] = useState<CustomerType>(() => {
    const saved = cachedProfile?.customerType;
    return saved === "shop_owner" || saved === "contractor" ? saved : "homeowner";
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    void api
      .profile()
      .then((result) => {
        const profile = result.profile as ApiCustomerProfile | null;
        if (cancelled || !profile) return;
        setProfileData({ ...profile });
        setPhotoUrl(profile.photoUrl || "");
        if (
          profile.customerType === "homeowner" ||
          profile.customerType === "shop_owner" ||
          profile.customerType === "contractor"
        ) {
          setOwnerType(profile.customerType);
        }
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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const data = new FormData(event.currentTarget);
    const profile = {
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      address: String(data.get("address") || "").trim(),
      photoUrl,
      customerType: ownerType,
    };

    if (!profile.name || profile.phone.replace(/\D/g, "").length < 10 || !profile.address) {
      toast.error("Please enter your name, valid mobile number and hiring location");
      return;
    }

    setSubmitting(true);
    try {
      setRole("customer");
      await api.saveCustomerProfile(profile);
      saveProfile("customer", profile);
      setProfileComplete("customer", true);
      toast.success(
        lang === "hi" ? "Profile ready" : editing ? "Profile updated" : "Profile ready",
      );
      navigate({ to: editing ? "/customer/profile" : "/customer" });
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
          <div className="relative flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate({ to: editing ? "/customer/profile" : "/role-selection" })}
              aria-label="Back"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur transition active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="rounded-full bg-white/15 px-3 py-2 text-[10px] tracking-wide text-primary-foreground/80 backdrop-blur">
              {editing ? "EDIT PROFILE" : "QUICK SETUP"}
            </span>
          </div>

          <div className="relative mt-7">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-primary shadow-xl shadow-blue-950/20">
              <UserRound className="h-5 w-5" />
            </span>
            <p className="mt-5 text-xs text-primary-foreground/65">Tell us how you hire</p>
            <h1 className="customer-section-title mt-1 max-w-[19rem] text-[1.85rem] leading-[1.08] tracking-[-0.04em]">
              {editing ? "Keep your hiring profile current" : "Set up your customer profile"}
            </h1>
            <p className="mt-3 max-w-[20rem] text-sm leading-5 text-primary-foreground/72">
              Better details help Anga find nearby workers who fit your task and budget.
            </p>
          </div>
        </header>

        <main className="mx-1.5 min-h-[70dvh] rounded-t-[2.5rem] bg-background px-4 pb-8 pt-6">
          {loadingExistingProfile ? (
            <SetupFormSkeleton />
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <section className="space-y-4 rounded-[1.65rem] bg-card p-4 shadow-[0_16px_38px_-30px_rgba(15,23,42,0.55)]">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="customer-card-title text-sm">Basic details</h2>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Used for job posts and worker calls
                    </p>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-[1.25rem] bg-primary/[0.045] p-3 transition hover:bg-primary/[0.07]">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Customer profile preview"
                      className="h-16 w-16 shrink-0 rounded-full object-cover shadow-md ring-2 ring-white"
                    />
                  ) : (
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm">
                      <Camera className="h-5 w-5" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="customer-card-title block text-sm">
                      {photoUrl ? "Change profile photo" : "Add profile photo"}
                    </span>
                    <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">
                      A clear photo helps workers recognize you
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
                        toast.error("Choose an image smaller than 5 MB");
                        return;
                      }
                      try {
                        setPhotoUrl(await fileToProfilePhotoDataUrl(file));
                        toast.success("Profile photo added");
                      } catch {
                        toast.error("Could not prepare photo");
                      }
                    }}
                  />
                </label>

                <Field label="Full name" hint="Workers will see this on your requests">
                  <Input
                    name="name"
                    defaultValue={String(profileData?.name || "")}
                    placeholder="Anita Patel"
                    autoComplete="name"
                    required
                  />
                </Field>
                <Field label="Mobile number" hint="For hiring updates and calls">
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
                <Field
                  label="Primary hiring location"
                  hint="You can enter a landmark, area or city"
                >
                  <LocationAutocomplete
                    name="address"
                    defaultValue={String(profileData?.address || profileData?.location || "")}
                    placeholder="Koramangala, Bengaluru"
                    required
                  />
                </Field>
              </section>

              <section className="rounded-[1.65rem] bg-card p-4 shadow-[0_16px_38px_-30px_rgba(15,23,42,0.55)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="customer-card-title text-sm">What describes you?</h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Choose one—you can change this later
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[9px] text-primary">
                    Required
                  </span>
                </div>

                <div className="grid gap-2.5" role="radiogroup" aria-label="Customer type">
                  {CUSTOMER_TYPES.map((type) => {
                    const Icon = type.icon;
                    const active = ownerType === type.value;
                    return (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={active}
                        key={type.value}
                        onClick={() => setOwnerType(type.value)}
                        className={`flex min-h-[4.75rem] items-center gap-3 rounded-[1.25rem] border p-3 text-left transition active:scale-[0.99] ${
                          active
                            ? "border-primary bg-primary/[0.06] shadow-sm"
                            : "border-border bg-background hover:border-primary/25"
                        }`}
                      >
                        <span
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="customer-card-title block text-sm">{type.label}</span>
                          <span className="mt-0.5 block text-[10px] leading-4 text-muted-foreground">
                            {type.description}
                          </span>
                        </span>
                        <span
                          className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                        >
                          {active && <Check className="h-3.5 w-3.5" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="flex items-start gap-3 rounded-[1.4rem] bg-blue-50 p-4 text-blue-950">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-primary shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="customer-card-title text-xs">Your details stay protected</p>
                  <p className="mt-1 text-[11px] leading-5 text-blue-950/65">
                    Your exact phone number is only used for account and hiring actions.
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
                    <MapPin className="h-4 w-4" />{" "}
                    {editing ? "Save changes" : "Start hiring nearby"}
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

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-end justify-between gap-3 text-xs text-foreground">
        <span>{label}</span>
        {hint && (
          <span className="max-w-[55%] text-right text-[9px] leading-3 text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
      {children}
    </label>
  );
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

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="field" />;
}

function SetupFormSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading profile details" aria-busy="true">
      <section className="space-y-4 rounded-[1.65rem] bg-card p-4">
        <Skeleton className="h-10 w-40 rounded-full" />
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        ))}
      </section>
      <section className="space-y-3 rounded-[1.65rem] bg-card p-4">
        <Skeleton className="h-10 w-48 rounded-full" />
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-[4.75rem] w-full rounded-[1.25rem]" />
        ))}
      </section>
      <Skeleton className="h-14 w-full rounded-full" />
    </div>
  );
}
