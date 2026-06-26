import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi";

const dict = {
  en: {
    welcome: "Welcome to Anga",
    chooseLanguage: "Choose your language",
    whoAreYou: "Who are you?",
    worker: "Worker",
    workerSub: "I am looking for work",
    customer: "Customer",
    customerSub: "I want to hire someone",
    findWork: "Find work near you",
    whatService: "What service do you need?",
    search: "Search jobs",
    nearby: "Nearby Jobs",
    myApps: "My Applications",
    profile: "Profile",
    home: "Home",
    jobs: "Jobs",
    notifications: "Notifications",
    requests: "My Requests",
    apply: "Apply",
    callCustomer: "Call Customer",
    saveJob: "Save Job",
    back: "Back",
    postJob: "Post Job",
    cancel: "Cancel",
    description: "Description",
    location: "Location",
    date: "Date",
    payment: "Payment Offered",
    serviceType: "Service Type",
    editProfile: "Edit Profile",
    uploadDocs: "Upload Documents",
    logout: "Logout",
    myRequests: "My Requests",
    editRequest: "Edit",
    cancelRequest: "Cancel",
    viewApplicants: "View Applicants",
    name: "Name",
    skills: "Skills",
    experience: "Experience",
    phone: "Phone Number",
    address: "Address",
    rating: "Rating",
    newRequest: "New Request",
    selectService: "Select a service to book",
    continue: "Continue",
    bookNow: "Book Now",
    book: "Book",
    noNotifications: "You have no notifications yet",
    status: "Status",
    saved: "Saved",
    greeting: "Namaste",
  },
  hi: {
    welcome: "रोज़गार में आपका स्वागत है",
    chooseLanguage: "अपनी भाषा चुनें",
    whoAreYou: "आप कौन हैं?",
    worker: "मज़दूर",
    workerSub: "मैं काम ढूंढ रहा हूँ",
    customer: "ग्राहक",
    customerSub: "मुझे काम करवाना है",
    findWork: "अपने पास काम ढूंढें",
    whatService: "आपको कौन सी सेवा चाहिए?",
    search: "काम खोजें",
    nearby: "पास के काम",
    greeting: "नमस्ते",
    myApps: "मेरे आवेदन",
    profile: "प्रोफ़ाइल",
    home: "होम",
    jobs: "काम",
    notifications: "सूचनाएँ",
    requests: "मेरी रिक्वेस्ट",
    apply: "आवेदन करें",
    callCustomer: "ग्राहक को कॉल करें",
    saveJob: "सेव करें",
    back: "वापस",
    postJob: "पोस्ट करें",
    cancel: "रद्द करें",
    description: "विवरण",
    location: "स्थान",
    date: "तारीख़",
    payment: "भुगतान",
    serviceType: "सेवा का प्रकार",
    editProfile: "प्रोफ़ाइल बदलें",
    uploadDocs: "दस्तावेज़ अपलोड करें",
    logout: "लॉगआउट",
    myRequests: "मेरी रिक्वेस्ट",
    editRequest: "बदलें",
    cancelRequest: "रद्द करें",
    viewApplicants: "आवेदक देखें",
    name: "नाम",
    skills: "कौशल",
    experience: "अनुभव",
    phone: "फ़ोन नंबर",
    address: "पता",
    rating: "रेटिंग",
    newRequest: "नई रिक्वेस्ट",
    selectService: "बुक करने के लिए सेवा चुनें",
    continue: "आगे बढ़ें",
    bookNow: "अभी बुक करें",
    book: "बुक",
    noNotifications: "अभी कोई सूचना नहीं है",
    status: "स्थिति",
    Hindi: "हिंदी",
    Namaste: "नमस्ते",
    saved: "सहेजा गया",
  },
} as const;


type Key = keyof typeof dict.en;

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("rozgaar.lang") as Lang | null) : null;
    if (stored === "en" || stored === "hi") setLangState(stored);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("rozgaar.lang", l);
  };
  const t = (k: Key) => dict[lang][k] ?? dict.en[k];
  return <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>;
}

export const useT = () => useContext(LangCtx);
