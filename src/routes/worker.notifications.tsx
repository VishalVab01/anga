import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { BottomNav } from "@/components/BottomNav";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/worker/notifications")({
  head: () => ({ meta: [{ title: "Anga - Notifications" }] }),
  component: Notifs,
});

const items = [
  {
    icon: CheckCircle2,
    title: {
      en: "Application accepted",
      hi: "आवेदन स्वीकार किया गया",
    },
    desc: {
      en: "Rohit accepted your application for fan installation.",
      hi: "रोहित ने पंखा लगाने के काम के लिए आपका आवेदन स्वीकार कर लिया है।",
    },
    time: {
      en: "2h",
      hi: "2 घंटे पहले",
    },
  },
  {
    icon: Bell,
    title: {
      en: "New job nearby",
      hi: "पास में नया काम",
    },
    desc: {
      en: "Plumbing job posted 1 km away.",
      hi: "1 किमी दूर प्लंबिंग का नया काम पोस्ट किया गया है।",
    },
    time: {
      en: "5h",
      hi: "5 घंटे पहले",
    },
  },
  {
    icon: Bell,
    title: {
      en: "Reminder",
      hi: "याद दिलाना",
    },
    desc: {
      en: "Complete your profile to get more jobs.",
      hi: "अधिक काम पाने के लिए अपनी प्रोफ़ाइल पूरी करें।",
    },
    time: {
      en: "1d",
      hi: "1 दिन पहले",
    },
  },
];

function Notifs() {
  const { t, lang } = useT();
  return (
    <PageShell title={t("notifications")} back="/worker" bottomNav={<BottomNav role="worker" />}>
      <div className="space-y-3">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <div key={i} className="card-soft flex items-start gap-3 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="truncate font-bold">{it.title[lang]}</h3>
                  <span className="shrink-0 text-xs text-muted-foreground">{it.time[lang]}</span>
                </div>
                <p className="text-sm text-muted-foreground">{it.desc[lang]}</p>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
