import {
  Zap,
  Wrench,
  Hammer,
  PaintRoller,
  Car,
  House,
  Truck,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type Service = {
  slug: string;
  en: string;
  hi: string;
  icon: LucideIcon;
};

export const services: Service[] = [
  { slug: "an", en: "Electrician", hi: "इलेक्ट्रीशियन", icon: Zap },
  { slug: "plumber", en: "Plumber", hi: "प्लंबर", icon: Wrench },
  { slug: "carpenter", en: "Carpenter", hi: "बढ़ई", icon: Hammer },
  { slug: "painter", en: "Painter", hi: "पेंटर", icon: PaintRoller },
  { slug: "driver", en: "Driver", hi: "ड्राइवर", icon: Car },
  { slug: "house-help", en: "House Help", hi: "घर सहायक", icon: House },
  { slug: "delivery", en: "Delivery", hi: "डिलीवरी", icon: Truck },
];

export type LocalizedText = {
  en: string;
  hi: string;
};

export type Job = {
  id: string;
  title: LocalizedText;
  service: string;
  location: LocalizedText;
  payment: number;
  customer: LocalizedText;
  rating: number;
  description: LocalizedText;
  phone: string;
  date: LocalizedText;
};

export const jobs: Job[] = [
  {
    id: "1",
    title: {
      en: "Fan installation",
      hi: "पंखा लगाना",
    },
    service: "electrician",
    location: {
      en: "Andheri West, Mumbai",
      hi: "अंधेरी पश्चिम, मुंबई",
    },
    payment: 800,
    customer: {
      en: "Rohit S.",
      hi: "रोहित एस.",
    },
    rating: 4.6,
    description: {
      en: "Install 2 ceiling fans in living room and bedroom. Wiring already done.",
      hi: "बैठक और शयनकक्ष में 2 सीलिंग पंखे लगाने हैं। वायरिंग पहले से की हुई है।",
    },
    phone: "+91 98XXXXXX01",
    date: {
      en: "Today, 4:00 PM",
      hi: "आज, शाम 4:00 बजे",
    },
  },

  {
    id: "2",
    title: {
      en: "Kitchen sink leak",
      hi: "रसोई के सिंक में रिसाव",
    },
    service: "plumber",
    location: {
      en: "Koramangala, Bengaluru",
      hi: "कोरमंगला, बेंगलुरु",
    },
    payment: 600,
    customer: {
      en: "Anita P.",
      hi: "अनीता पी.",
    },
    rating: 4.8,
    description: {
      en: "Sink pipe leaking under counter. Need urgent fix.",
      hi: "सिंक के नीचे पाइप से पानी रिस रहा है। तुरंत मरम्मत की आवश्यकता है।",
    },
    phone: "+91 98XXXXXX02",
    date: {
      en: "Today, 6:00 PM",
      hi: "आज, शाम 6:00 बजे",
    },
  },

  {
    id: "3",
    title: {
      en: "Wardrobe repair",
      hi: "अलमारी की मरम्मत",
    },
    service: "carpenter",
    location: {
      en: "Gomti Nagar, Lucknow",
      hi: "गोमती नगर, लखनऊ",
    },
    payment: 1200,
    customer: {
      en: "Vikram K.",
      hi: "विक्रम के.",
    },
    rating: 4.4,
    description: {
      en: "Door hinge broken, shelf needs polishing.",
      hi: "अलमारी का कब्ज़ा टूट गया है और शेल्फ की पॉलिश करनी है।",
    },
    phone: "+91 98XXXXXX03",
    date: {
      en: "Tomorrow, 11:00 AM",
      hi: "कल, सुबह 11:00 बजे",
    },
  },

  {
    id: "4",
    title: {
      en: "2 BHK painting",
      hi: "2 बीएचके पेंटिंग",
    },
    service: "painter",
    location: {
      en: "Salt Lake, Kolkata",
      hi: "सॉल्ट लेक, कोलकाता",
    },
    payment: 9000,
    customer: {
      en: "Meera D.",
      hi: "मीरा डी.",
    },
    rating: 4.9,
    description: {
      en: "Full interior painting, 2 bedrooms and hall. Paint provided.",
      hi: "2 बेडरूम और हॉल की पूरी अंदरूनी पेंटिंग करनी है। पेंट उपलब्ध है।",
    },
    phone: "+91 98XXXXXX04",
    date: {
      en: "This weekend",
      hi: "इस सप्ताहांत",
    },
  },

  {
    id: "5",
    title: {
      en: "Daily school drop",
      hi: "रोज़ाना स्कूल छोड़ना",
    },
    service: "driver",
    location: {
      en: "Sector 21, Gurgaon",
      hi: "सेक्टर 21, गुरुग्राम",
    },
    payment: 7000,
    customer: {
      en: "Sandeep T.",
      hi: "संदीप टी.",
    },
    rating: 4.7,
    description: {
      en: "Pick up and drop off children from school daily.",
      hi: "बच्चों को प्रतिदिन स्कूल छोड़ना और वापस लाना।",
    },
    phone: "+91 98XXXXXX05",
    date: {
      en: "Daily",
      hi: "प्रतिदिन",
    },
  },
];

export type Request = {
  id: string;
  service: string;
  status: LocalizedText;
  worker: string | null;
  date: LocalizedText;
  applicants: number;
};

export const seedRequests: Request[] = [
  {
    id: "r1",
    service: "electrician",
    status: {
      en: "Assigned",
      hi: "सौंपा गया",
    },
    worker: "Suresh M.",
    date: {
      en: "Today, 5:00 PM",
      hi: "आज, शाम 5:00 बजे",
    },
    applicants: 3,
  },
  {
    id: "r2",
    service: "house-help",
    status: {
      en: "Open",
      hi: "खुला",
    },
    worker: null,
    date: {
      en: "Tomorrow, 9:00 AM",
      hi: "कल, सुबह 9:00 बजे",
    },
    applicants: 5,
  },
  {
    id: "r3",
    service: "painter",
    status: {
      en: "Done",
      hi: "पूरा हुआ",
    },
    worker: "Ramesh K.",
    date: {
      en: "Last week",
      hi: "पिछले सप्ताह",
    },
    applicants: 7,
  },
];
