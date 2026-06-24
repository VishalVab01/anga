export type Service = { slug: string; en: string; hi: string; emoji: string };

export const services: Service[] = [
  { slug: "electrician", en: "Electrician", hi: "इलेक्ट्रीशियन", emoji: "⚡" },
  { slug: "plumber", en: "Plumber", hi: "प्लंबर", emoji: "🔧" },
  { slug: "carpenter", en: "Carpenter", hi: "बढ़ई", emoji: "🪚" },
  { slug: "painter", en: "Painter", hi: "पेंटर", emoji: "🎨" },
  { slug: "driver", en: "Driver", hi: "ड्राइवर", emoji: "🚗" },
  { slug: "house-help", en: "House Help", hi: "घर सहायक", emoji: "🏠" },
  { slug: "delivery", en: "Delivery", hi: "डिलीवरी", emoji: "🚚" },
  { slug: "construction", en: "Construction", hi: "निर्माण", emoji: "👷" },
];

export type Job = {
  id: string;
  title: string;
  service: string;
  location: string;
  payment: number;
  customer: string;
  rating: number;
  description: string;
  phone: string;
  date: string;
};

export const jobs: Job[] = [
  { id: "1", title: "Fan installation", service: "electrician", location: "Andheri West, Mumbai", payment: 800, customer: "Rohit S.", rating: 4.6, description: "Install 2 ceiling fans in living room and bedroom. Wiring already done.", phone: "+91 98XXXXXX01", date: "Today, 4:00 PM" },
  { id: "2", title: "Kitchen sink leak", service: "plumber", location: "Koramangala, Bengaluru", payment: 600, customer: "Anita P.", rating: 4.8, description: "Sink pipe leaking under counter. Need urgent fix.", phone: "+91 98XXXXXX02", date: "Today, 6:00 PM" },
  { id: "3", title: "Wardrobe repair", service: "carpenter", location: "Gomti Nagar, Lucknow", payment: 1200, customer: "Vikram K.", rating: 4.4, description: "Door hinge broken, shelf needs polishing.", phone: "+91 98XXXXXX03", date: "Tomorrow, 11:00 AM" },
  { id: "4", title: "2 BHK painting", service: "painter", location: "Salt Lake, Kolkata", payment: 9000, customer: "Meera D.", rating: 4.9, description: "Full interior painting, 2 bedrooms and hall. Paint provided.", phone: "+91 98XXXXXX04", date: "This weekend" },
  { id: "5", title: "Daily school drop", service: "driver", location: "Sector 21, Gurgaon", payment: 7000, customer: "Sandeep T.", rating: 4.7, description: "School drop and pickup, Mon-Fri.", phone: "+91 98XXXXXX05", date: "Starts Monday" },
  { id: "6", title: "House cleaning", service: "house-help", location: "Banjara Hills, Hyderabad", payment: 4000, customer: "Priya R.", rating: 4.5, description: "Daily cleaning and utensils. 2 hours per day.", phone: "+91 98XXXXXX06", date: "Starts tomorrow" },
];

export type Request = {
  id: string;
  service: string;
  status: "Open" | "Assigned" | "Done";
  worker: string | null;
  date: string;
  applicants: number;
};

export const seedRequests: Request[] = [
  { id: "r1", service: "electrician", status: "Assigned", worker: "Suresh M.", date: "Today, 5:00 PM", applicants: 3 },
  { id: "r2", service: "house-help", status: "Open", worker: null, date: "Tomorrow, 9:00 AM", applicants: 5 },
  { id: "r3", service: "painter", status: "Done", worker: "Ramesh K.", date: "Last week", applicants: 7 },
];
