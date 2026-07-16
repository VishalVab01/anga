import { Car, Hammer, House, PaintRoller, Snowflake, Truck, Wrench, Zap } from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type LocalizedText = {
  en: string;
  hi: string;
};

export type Service = {
  slug: string;
  en: string;
  hi: string;
  icon: LucideIcon;
};

export const services: Service[] = [
  { slug: "electrician", en: "Electrician", hi: "इलेक्ट्रीशियन", icon: Zap },
  { slug: "plumber", en: "Plumber", hi: "प्लंबर", icon: Wrench },
  { slug: "carpenter", en: "Carpenter", hi: "बढ़ई", icon: Hammer },
  { slug: "painter", en: "Painter", hi: "पेंटर", icon: PaintRoller },
  { slug: "ac-repair", en: "AC Repair", hi: "एसी रिपेयर", icon: Snowflake },
  { slug: "driver", en: "Driver", hi: "ड्राइवर", icon: Car },
  { slug: "house-help", en: "House Help", hi: "घर सहायक", icon: House },
  { slug: "delivery", en: "Delivery", hi: "डिलीवरी", icon: Truck },
];

export type ApplicationStatus = "Pending" | "Accepted" | "Rejected" | "Completed";

export type Job = {
  id: string;
  title: LocalizedText;
  service: string;
  location: LocalizedText;
  area: string;
  payment: number;
  wageType: LocalizedText;
  distanceKm: number;
  time: LocalizedText;
  urgency: LocalizedText;
  customer: LocalizedText;
  customerType: LocalizedText;
  customerRating: number;
  description: LocalizedText;
  requirements: LocalizedText[];
  phone: string;
  status: ApplicationStatus | "Open";
  applicants: number;
  workersNeeded: number;
  verifiedCustomer: boolean;
};

export const jobs: Job[] = [
  {
    id: "1",
    title: { en: "Fan installation in 2 rooms", hi: "2 कमरों में पंखा लगाना" },
    service: "electrician",
    location: { en: "Andheri West, Mumbai", hi: "अंधेरी वेस्ट, मुंबई" },
    area: "Andheri West",
    payment: 850,
    wageType: { en: "Same day cash/UPI", hi: "उसी दिन कैश/UPI" },
    distanceKm: 1.8,
    time: { en: "Today, 4:00 PM", hi: "आज, शाम 4:00 बजे" },
    urgency: { en: "Today", hi: "आज" },
    customer: { en: "Rohit S.", hi: "रोहित एस." },
    customerType: { en: "Homeowner", hi: "घर मालिक" },
    customerRating: 4.6,
    description: {
      en: "Install 2 ceiling fans in living room and bedroom. Wiring is ready and ladder is available.",
      hi: "बैठक और बेडरूम में 2 सीलिंग पंखे लगाने हैं। वायरिंग तैयार है और सीढ़ी उपलब्ध है।",
    },
    requirements: [
      { en: "Bring tester and basic tools", hi: "टेस्टर और बेसिक औजार लाएं" },
      { en: "1-2 hours of work", hi: "1-2 घंटे का काम" },
    ],
    phone: "+91 98XXXXXX01",
    status: "Open",
    applicants: 4,
    workersNeeded: 1,
    verifiedCustomer: true,
  },
  {
    id: "2",
    title: { en: "Kitchen sink leakage repair", hi: "रसोई सिंक की लीकेज रिपेयर" },
    service: "plumber",
    location: { en: "Koramangala, Bengaluru", hi: "कोरमंगला, बेंगलुरु" },
    area: "Koramangala",
    payment: 700,
    wageType: { en: "Fixed job payment", hi: "फिक्स काम का भुगतान" },
    distanceKm: 2.4,
    time: { en: "Today, 6:00 PM", hi: "आज, शाम 6:00 बजे" },
    urgency: { en: "Urgent", hi: "जरूरी" },
    customer: { en: "Anita P.", hi: "अनीता पी." },
    customerType: { en: "Homeowner", hi: "घर मालिक" },
    customerRating: 4.8,
    description: {
      en: "Sink pipe leaking under counter. Need quick repair and replacement washer if needed.",
      hi: "सिंक के नीचे पाइप से पानी रिस रहा है। जरूरत हो तो वॉशर बदलकर जल्दी रिपेयर करना है।",
    },
    requirements: [
      { en: "Leak repair experience", hi: "लीकेज रिपेयर का अनुभव" },
      { en: "Carry plumber tape", hi: "प्लंबर टेप साथ लाएं" },
    ],
    phone: "+91 98XXXXXX02",
    status: "Pending",
    applicants: 6,
    workersNeeded: 1,
    verifiedCustomer: true,
  },
  {
    id: "3",
    title: { en: "Wardrobe hinge and polish work", hi: "अलमारी हिंज और पॉलिश का काम" },
    service: "carpenter",
    location: { en: "Gomti Nagar, Lucknow", hi: "गोमती नगर, लखनऊ" },
    area: "Gomti Nagar",
    payment: 1200,
    wageType: { en: "Daily wage", hi: "दैनिक मजदूरी" },
    distanceKm: 3.1,
    time: { en: "Tomorrow, 11:00 AM", hi: "कल, सुबह 11:00 बजे" },
    urgency: { en: "Tomorrow", hi: "कल" },
    customer: { en: "Vikram K.", hi: "विक्रम के." },
    customerType: { en: "Shop owner", hi: "दुकान मालिक" },
    customerRating: 4.4,
    description: {
      en: "Wardrobe door hinge is broken and one shelf needs polishing. Materials paid separately.",
      hi: "अलमारी का दरवाजा हिंज टूटा है और एक शेल्फ की पॉलिश करनी है। सामान का पैसा अलग मिलेगा।",
    },
    requirements: [
      { en: "Bring drill machine", hi: "ड्रिल मशीन लाएं" },
      { en: "Material bill accepted", hi: "सामान का बिल मान्य होगा" },
    ],
    phone: "+91 98XXXXXX03",
    status: "Accepted",
    applicants: 3,
    workersNeeded: 1,
    verifiedCustomer: false,
  },
  {
    id: "4",
    title: { en: "2 BHK interior painting", hi: "2 बीएचके अंदरूनी पेंटिंग" },
    service: "painter",
    location: { en: "Salt Lake, Kolkata", hi: "सॉल्ट लेक, कोलकाता" },
    area: "Salt Lake",
    payment: 9000,
    wageType: { en: "Team payment", hi: "टीम भुगतान" },
    distanceKm: 4.6,
    time: { en: "This weekend", hi: "इस सप्ताहांत" },
    urgency: { en: "Flexible", hi: "समय लचीला" },
    customer: { en: "Meera D.", hi: "मीरा डी." },
    customerType: { en: "Contractor", hi: "कॉन्ट्रैक्टर" },
    customerRating: 4.9,
    description: {
      en: "Full interior painting for two bedrooms and hall. Paint provided. Need two workers.",
      hi: "दो बेडरूम और हॉल की अंदरूनी पेंटिंग। पेंट उपलब्ध है। दो मजदूर चाहिए।",
    },
    requirements: [
      { en: "2 workers preferred", hi: "2 मजदूर बेहतर" },
      { en: "Bring rollers and masking tape", hi: "रोलर और मास्किंग टेप लाएं" },
    ],
    phone: "+91 98XXXXXX04",
    status: "Completed",
    applicants: 8,
    workersNeeded: 2,
    verifiedCustomer: true,
  },
  {
    id: "5",
    title: { en: "Daily school van driver", hi: "रोज स्कूल वैन ड्राइवर" },
    service: "driver",
    location: { en: "Sector 21, Gurgaon", hi: "सेक्टर 21, गुरुग्राम" },
    area: "Sector 21",
    payment: 7000,
    wageType: { en: "Monthly", hi: "मासिक" },
    distanceKm: 2.9,
    time: { en: "Daily, 7:30 AM", hi: "रोज, सुबह 7:30 बजे" },
    urgency: { en: "Starts Monday", hi: "सोमवार से शुरू" },
    customer: { en: "Sandeep T.", hi: "संदीप टी." },
    customerType: { en: "Homeowner", hi: "घर मालिक" },
    customerRating: 4.7,
    description: {
      en: "Pick up and drop children from school daily. Valid license and clean driving record needed.",
      hi: "बच्चों को रोज स्कूल छोड़ना और वापस लाना है। वैध लाइसेंस और अच्छा ड्राइविंग रिकॉर्ड चाहिए।",
    },
    requirements: [
      { en: "Driving license required", hi: "ड्राइविंग लाइसेंस जरूरी" },
      { en: "Police verification preferred", hi: "पुलिस वेरिफिकेशन बेहतर" },
    ],
    phone: "+91 98XXXXXX05",
    status: "Rejected",
    applicants: 5,
    workersNeeded: 1,
    verifiedCustomer: true,
  },
  {
    id: "6",
    title: { en: "AC not cooling service visit", hi: "AC cooling service visit" },
    service: "ac-repair",
    location: { en: "Indiranagar, Bengaluru", hi: "Indiranagar, Bengaluru" },
    area: "Indiranagar",
    payment: 1100,
    wageType: { en: "Service charge", hi: "Service charge" },
    distanceKm: 2.2,
    time: { en: "Today, 3:30 PM", hi: "Aaj, 3:30 PM" },
    urgency: { en: "Today", hi: "Aaj" },
    customer: { en: "Nisha R.", hi: "Nisha R." },
    customerType: { en: "Homeowner", hi: "Homeowner" },
    customerRating: 4.7,
    description: {
      en: "Split AC is running but cooling is low. Need gas check, filter cleaning and basic service.",
      hi: "Split AC chal raha hai lekin cooling kam hai. Gas check, filter cleaning aur basic service chahiye.",
    },
    requirements: [
      { en: "Carry AC service tools", hi: "AC service tools layein" },
      { en: "Gas refill quote separately", hi: "Gas refill ka daam alag batayein" },
    ],
    phone: "+91 98XXXXXX06",
    status: "Open",
    applicants: 5,
    workersNeeded: 1,
    verifiedCustomer: true,
  },
  {
    id: "7",
    title: { en: "Morning cooking and cleaning help", hi: "Morning cooking aur cleaning help" },
    service: "house-help",
    location: { en: "Malviya Nagar, Delhi", hi: "Malviya Nagar, Delhi" },
    area: "Malviya Nagar",
    payment: 650,
    wageType: { en: "Daily wage", hi: "Daily wage" },
    distanceKm: 1.4,
    time: { en: "Daily, 8:00 AM", hi: "Daily, 8:00 AM" },
    urgency: { en: "Starts tomorrow", hi: "Kal se shuru" },
    customer: { en: "Kavita M.", hi: "Kavita M." },
    customerType: { en: "Homeowner", hi: "Homeowner" },
    customerRating: 4.8,
    description: {
      en: "Need reliable morning help for sweeping, utensils and simple cooking for a family of three.",
      hi: "Teen logon ke family ke liye morning jhadu, bartan aur simple cooking help chahiye.",
    },
    requirements: [
      { en: "Prior home work experience", hi: "Ghar ke kaam ka experience" },
      { en: "ID verification preferred", hi: "ID verification preferred" },
    ],
    phone: "+91 98XXXXXX07",
    status: "Open",
    applicants: 9,
    workersNeeded: 1,
    verifiedCustomer: true,
  },
  {
    id: "8",
    title: { en: "Evening parcel delivery rider", hi: "Evening parcel delivery rider" },
    service: "delivery",
    location: { en: "Bandra East, Mumbai", hi: "Bandra East, Mumbai" },
    area: "Bandra East",
    payment: 950,
    wageType: { en: "Daily wage + fuel", hi: "Daily wage + fuel" },
    distanceKm: 2.7,
    time: { en: "Today, 5:00 PM", hi: "Aaj, 5:00 PM" },
    urgency: { en: "Urgent", hi: "Urgent" },
    customer: { en: "QuickMart Store", hi: "QuickMart Store" },
    customerType: { en: "Shop owner", hi: "Shop owner" },
    customerRating: 4.5,
    description: {
      en: "Need rider for local grocery parcel deliveries within 5 km. Bike and phone required.",
      hi: "5 km ke andar local grocery parcel delivery ke liye rider chahiye. Bike aur phone required.",
    },
    requirements: [
      { en: "Own bike/scooter required", hi: "Apni bike/scooter required" },
      { en: "Smartphone with maps", hi: "Maps wala smartphone" },
    ],
    phone: "+91 98XXXXXX08",
    status: "Open",
    applicants: 7,
    workersNeeded: 2,
    verifiedCustomer: true,
  },
  {
    id: "9",
    title: { en: "MCB tripping and wiring check", hi: "MCB tripping aur wiring check" },
    service: "electrician",
    location: { en: "Kankarbagh, Patna", hi: "Kankarbagh, Patna" },
    area: "Kankarbagh",
    payment: 1000,
    wageType: { en: "Fixed job payment", hi: "Fixed job payment" },
    distanceKm: 1.9,
    time: { en: "Tomorrow, 10:00 AM", hi: "Kal, 10:00 AM" },
    urgency: { en: "Tomorrow", hi: "Kal" },
    customer: { en: "Alok J.", hi: "Alok J." },
    customerType: { en: "Homeowner", hi: "Homeowner" },
    customerRating: 4.6,
    description: {
      en: "MCB trips when geyser is switched on. Need wiring and load check.",
      hi: "Geyser on karte hi MCB trip hota hai. Wiring aur load check chahiye.",
    },
    requirements: [
      { en: "MCB and wiring knowledge", hi: "MCB aur wiring knowledge" },
      { en: "Carry tester and clamp meter", hi: "Tester aur clamp meter layein" },
    ],
    phone: "+91 98XXXXXX09",
    status: "Open",
    applicants: 2,
    workersNeeded: 1,
    verifiedCustomer: true,
  },
  {
    id: "10",
    title: { en: "Bathroom tap and flush repair", hi: "Bathroom tap aur flush repair" },
    service: "plumber",
    location: { en: "Civil Lines, Jaipur", hi: "Civil Lines, Jaipur" },
    area: "Civil Lines",
    payment: 800,
    wageType: { en: "Same day cash/UPI", hi: "Same day cash/UPI" },
    distanceKm: 2.3,
    time: { en: "Today, 2:00 PM", hi: "Aaj, 2:00 PM" },
    urgency: { en: "Today", hi: "Aaj" },
    customer: { en: "Manish G.", hi: "Manish G." },
    customerType: { en: "Homeowner", hi: "Homeowner" },
    customerRating: 4.4,
    description: {
      en: "Bathroom tap is loose and flush tank is leaking. Parts paid separately if needed.",
      hi: "Bathroom tap loose hai aur flush tank leak kar raha hai. Parts ka paisa alag milega.",
    },
    requirements: [
      { en: "Carry wrench and seal tape", hi: "Wrench aur seal tape layein" },
      { en: "One visit repair preferred", hi: "Ek visit mein repair preferred" },
    ],
    phone: "+91 98XXXXXX10",
    status: "Open",
    applicants: 4,
    workersNeeded: 1,
    verifiedCustomer: true,
  },
];

export type Worker = {
  id: string;
  name: string;
  phone: string;
  skill: string;
  area: string;
  distanceKm: number;
  rating: number;
  experience: string;
  expectedWage: number;
  verified: boolean;
  documentUploaded: boolean;
  availableToday: boolean;
  completedJobs: number;
  languages: string[];
  bio: LocalizedText;
};

export const workers: Worker[] = [
  {
    id: "w1",
    name: "Suresh Maurya",
    phone: "+91 97XXXXXX11",
    skill: "electrician",
    area: "Andheri West",
    distanceKm: 1.2,
    rating: 4.8,
    experience: "6 years",
    expectedWage: 900,
    verified: true,
    documentUploaded: true,
    availableToday: true,
    completedJobs: 128,
    languages: ["Hindi", "Marathi"],
    bio: {
      en: "Fan, wiring, MCB and home electrical repair specialist.",
      hi: "पंखा, वायरिंग, MCB और घर की इलेक्ट्रिकल रिपेयर में विशेषज्ञ।",
    },
  },
  {
    id: "w2",
    name: "Imran Khan",
    phone: "+91 98XXXXXX22",
    skill: "plumber",
    area: "Koramangala",
    distanceKm: 2.1,
    rating: 4.7,
    experience: "5 years",
    expectedWage: 750,
    verified: true,
    documentUploaded: true,
    availableToday: true,
    completedJobs: 96,
    languages: ["Hindi", "Kannada"],
    bio: {
      en: "Leakage, bathroom fitting and kitchen sink repair worker.",
      hi: "लीकेज, बाथरूम फिटिंग और किचन सिंक रिपेयर का काम।",
    },
  },
  {
    id: "w3",
    name: "Ramesh Kumar",
    phone: "+91 99XXXXXX33",
    skill: "carpenter",
    area: "Gomti Nagar",
    distanceKm: 3.4,
    rating: 4.6,
    experience: "8 years",
    expectedWage: 1100,
    verified: true,
    documentUploaded: false,
    availableToday: false,
    completedJobs: 143,
    languages: ["Hindi"],
    bio: {
      en: "Furniture repair, doors, polish and modular fitting.",
      hi: "फर्नीचर रिपेयर, दरवाजे, पॉलिश और मॉड्यूलर फिटिंग।",
    },
  },
  {
    id: "w4",
    name: "Pooja Sharma",
    phone: "+91 96XXXXXX44",
    skill: "house-help",
    area: "Sector 21",
    distanceKm: 1.9,
    rating: 4.9,
    experience: "4 years",
    expectedWage: 650,
    verified: true,
    documentUploaded: true,
    availableToday: true,
    completedJobs: 82,
    languages: ["Hindi", "English"],
    bio: {
      en: "House cleaning, cooking support and daily home help.",
      hi: "घर की सफाई, खाना बनाने में मदद और रोज का घरेलू काम।",
    },
  },
];

export type Request = {
  id: string;
  service: string;
  title: LocalizedText;
  status: LocalizedText;
  worker: string | null;
  date: LocalizedText;
  location: LocalizedText;
  budget: number;
  urgency: LocalizedText;
  applicants: number;
};

export const seedRequests: Request[] = [
  {
    id: "r1",
    service: "electrician",
    title: { en: "Fan fitting at home", hi: "घर पर पंखा फिटिंग" },
    status: { en: "Assigned", hi: "सौंपा गया" },
    worker: "Suresh Maurya",
    date: { en: "Today, 5:00 PM", hi: "आज, शाम 5:00 बजे" },
    location: { en: "Andheri West", hi: "अंधेरी वेस्ट" },
    budget: 900,
    urgency: { en: "Today", hi: "आज" },
    applicants: 3,
  },
  {
    id: "r2",
    service: "house-help",
    title: { en: "Morning house help", hi: "सुबह घर सहायक" },
    status: { en: "Open", hi: "खुला" },
    worker: null,
    date: { en: "Tomorrow, 9:00 AM", hi: "कल, सुबह 9:00 बजे" },
    location: { en: "Sector 21", hi: "सेक्टर 21" },
    budget: 650,
    urgency: { en: "Tomorrow", hi: "कल" },
    applicants: 5,
  },
  {
    id: "r3",
    service: "painter",
    title: { en: "Room painting", hi: "कमरे की पेंटिंग" },
    status: { en: "Completed", hi: "पूरा हुआ" },
    worker: "Ramesh Kumar",
    date: { en: "Last week", hi: "पिछले सप्ताह" },
    location: { en: "Salt Lake", hi: "सॉल्ट लेक" },
    budget: 3000,
    urgency: { en: "Done", hi: "पूरा" },
    applicants: 7,
  },
];

export const assistantExamples = {
  worker: "Mujhe aaj electrician ka kaam chahiye",
  customer: "Mujhe kal plumber chahiye sink repair ke liye",
};

export function serviceName(slug: string, lang: "en" | "hi") {
  const service = services.find((s) => s.slug === slug);
  return service ? (lang === "hi" ? service.hi : service.en) : slug;
}
