import { Application } from "./models/Application.js";
import { CustomerProfile } from "./models/CustomerProfile.js";
import { Job } from "./models/Job.js";
import { Notification } from "./models/Notification.js";
import { User } from "./models/User.js";
import { WorkerProfile } from "./models/WorkerProfile.js";

const demoCustomers = [
  {
    name: "Rohit Shah",
    phone: "9000000001",
    location: "Andheri West, Mumbai",
    address: "Andheri West, Mumbai",
    customerType: "homeowner",
    rating: 4.7,
  },
  {
    name: "Anita Patel",
    phone: "9000000002",
    location: "Koramangala, Bengaluru",
    address: "Koramangala, Bengaluru",
    customerType: "shop_owner",
    rating: 4.8,
  },
  {
    name: "Meera Contractor",
    phone: "9000000003",
    location: "Delhi NCR",
    address: "Malviya Nagar, Delhi",
    customerType: "contractor",
    rating: 4.9,
  },
];

const demoWorkers = [
  {
    name: "Suresh Maurya",
    phone: "9111111111",
    skills: ["electrician", "ac-repair"],
    experience: "6 years",
    expectedWage: 900,
    location: "Andheri West, Mumbai",
    preferredDistance: "5 km",
    rating: 4.8,
    totalJobsCompleted: 128,
  },
  {
    name: "Imran Khan",
    phone: "9222222222",
    skills: ["plumber"],
    experience: "5 years",
    expectedWage: 750,
    location: "Koramangala, Bengaluru",
    preferredDistance: "5 km",
    rating: 4.7,
    totalJobsCompleted: 96,
  },
  {
    name: "Ramesh Kumar",
    phone: "9333333333",
    skills: ["carpenter", "painter"],
    experience: "8 years",
    expectedWage: 1100,
    location: "Gomti Nagar, Lucknow",
    preferredDistance: "10 km",
    rating: 4.6,
    totalJobsCompleted: 143,
    documentsUploaded: false,
  },
  {
    name: "Pooja Sharma",
    phone: "9444444444",
    skills: ["house-help"],
    experience: "4 years",
    expectedWage: 650,
    location: "Malviya Nagar, Delhi",
    preferredDistance: "3 km",
    rating: 4.9,
    totalJobsCompleted: 82,
  },
  {
    name: "Amit Verma",
    phone: "9555555555",
    skills: ["driver", "delivery"],
    experience: "7 years",
    expectedWage: 950,
    location: "Bandra East, Mumbai",
    preferredDistance: "8 km",
    rating: 4.7,
    totalJobsCompleted: 111,
  },
  {
    name: "Nadeem Ansari",
    phone: "9666666666",
    skills: ["ac-repair", "electrician"],
    experience: "5 years",
    expectedWage: 1050,
    location: "Indiranagar, Bengaluru",
    preferredDistance: "6 km",
    rating: 4.8,
    totalJobsCompleted: 74,
  },
  {
    name: "Kavita Devi",
    phone: "9777777777",
    skills: ["house-help", "delivery"],
    experience: "3 years",
    expectedWage: 600,
    location: "Civil Lines, Jaipur",
    preferredDistance: "4 km",
    rating: 4.6,
    totalJobsCompleted: 58,
  },
  {
    name: "Harish Pal",
    phone: "9888888888",
    skills: ["painter", "carpenter"],
    experience: "9 years",
    expectedWage: 1200,
    location: "Salt Lake, Kolkata",
    preferredDistance: "10 km",
    rating: 4.8,
    totalJobsCompleted: 169,
  },
];

const demoJobs = [
  {
    customerPhone: "9000000001",
    title: "Fan installation in 2 rooms",
    category: "electrician",
    description: "Install two ceiling fans. Wiring is ready and ladder is available.",
    location: "Andheri West, Mumbai",
    wage: 850,
    date: "Today",
    time: "4:00 PM",
    urgent: false,
    workersNeeded: 1,
  },
  {
    customerPhone: "9000000002",
    title: "Kitchen sink leakage repair",
    category: "plumber",
    description: "Sink pipe leaking under counter. Need quick repair.",
    location: "Koramangala, Bengaluru",
    wage: 700,
    date: "Today",
    time: "6:00 PM",
    urgent: true,
    workersNeeded: 1,
  },
  {
    customerPhone: "9000000001",
    title: "Wardrobe hinge repair",
    category: "carpenter",
    description: "Door hinge broken and shelf needs polishing.",
    location: "Gomti Nagar, Lucknow",
    wage: 1200,
    date: "Tomorrow",
    time: "11:00 AM",
    urgent: false,
    workersNeeded: 1,
  },
  {
    customerPhone: "9000000003",
    title: "2 BHK interior painting",
    category: "painter",
    description: "Paint provided. Need two painters for interior wall finishing.",
    location: "Salt Lake, Kolkata",
    wage: 9000,
    date: "Weekend",
    time: "10:00 AM",
    urgent: false,
    workersNeeded: 2,
  },
  {
    customerPhone: "9000000001",
    title: "AC not cooling service visit",
    category: "ac-repair",
    description: "Split AC is running but cooling is low. Need gas check and cleaning.",
    location: "Indiranagar, Bengaluru",
    wage: 1100,
    date: "Today",
    time: "3:30 PM",
    urgent: true,
    workersNeeded: 1,
  },
  {
    customerPhone: "9000000002",
    title: "Daily school van driver",
    category: "driver",
    description: "Valid license required for school pickup and drop.",
    location: "Sector 21, Gurgaon",
    wage: 7000,
    date: "Monday",
    time: "7:30 AM",
    urgent: false,
    workersNeeded: 1,
  },
  {
    customerPhone: "9000000003",
    title: "Morning cooking and cleaning help",
    category: "house-help",
    description: "Need reliable morning help for utensils, sweeping and simple cooking.",
    location: "Malviya Nagar, Delhi",
    wage: 650,
    date: "Tomorrow",
    time: "8:00 AM",
    urgent: false,
    workersNeeded: 1,
  },
  {
    customerPhone: "9000000002",
    title: "Evening parcel delivery rider",
    category: "delivery",
    description: "Need rider for local grocery parcel deliveries within 5 km.",
    location: "Bandra East, Mumbai",
    wage: 950,
    date: "Today",
    time: "5:00 PM",
    urgent: true,
    workersNeeded: 2,
  },
];

async function upsertUser({ role, name, phone, location, address = "" }) {
  return User.findOneAndUpdate(
    { phone },
    {
      name,
      phone,
      role,
      avatarInitial: name.charAt(0).toUpperCase(),
      location,
      address,
      isProfileComplete: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function ensureDemoProfile(user, role) {
  if (role === "customer") {
    return CustomerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        name: user.name || "Demo Customer",
        phone: user.phone,
        address: user.address || user.location || "Andheri West, Mumbai",
        customerType: "homeowner",
        rating: 4.8,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  return WorkerProfile.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      name: user.name || "Demo Worker",
      phone: user.phone,
      skills: ["electrician", "plumber", "delivery"],
      experience: "5 years",
      expectedWage: 900,
      availableToday: true,
      preferredDistance: "5 km",
      location: user.location || "Andheri West, Mumbai",
      documentsUploaded: true,
      verified: true,
      rating: 4.8,
      totalJobsCompleted: 64,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

export async function seedIfEmpty() {
  const customerMap = new Map();
  const workerMap = new Map();

  for (const customer of demoCustomers) {
    const user = await upsertUser({ ...customer, role: "customer" });
    customerMap.set(customer.phone, user);
    await CustomerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        customerType: customer.customerType,
        rating: customer.rating,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  for (const worker of demoWorkers) {
    const user = await upsertUser({ ...worker, role: "worker" });
    workerMap.set(worker.phone, user);
    await WorkerProfile.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        name: worker.name,
        phone: worker.phone,
        skills: worker.skills,
        experience: worker.experience,
        expectedWage: worker.expectedWage,
        availableToday: true,
        preferredDistance: worker.preferredDistance,
        location: worker.location,
        documentsUploaded: worker.documentsUploaded ?? true,
        verified: true,
        rating: worker.rating,
        totalJobsCompleted: worker.totalJobsCompleted,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  const jobMap = new Map();
  for (const demoJob of demoJobs) {
    const customer = customerMap.get(demoJob.customerPhone);
    if (!customer) continue;
    const job = await Job.findOneAndUpdate(
      { title: demoJob.title, category: demoJob.category, customerId: customer._id },
      {
        customerId: customer._id,
        title: demoJob.title,
        category: demoJob.category,
        description: demoJob.description,
        location: demoJob.location,
        wage: demoJob.wage,
        date: demoJob.date,
        time: demoJob.time,
        urgent: demoJob.urgent,
        workersNeeded: demoJob.workersNeeded,
        status: "open",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    jobMap.set(demoJob.category, job);
  }

  const sampleApplications = [
    { workerPhone: "9111111111", category: "electrician", status: "pending" },
    { workerPhone: "9222222222", category: "plumber", status: "pending" },
    { workerPhone: "9666666666", category: "ac-repair", status: "pending" },
    { workerPhone: "9444444444", category: "house-help", status: "pending" },
  ];

  for (const sample of sampleApplications) {
    const worker = workerMap.get(sample.workerPhone);
    const job = jobMap.get(sample.category);
    if (!worker || !job) continue;
    const application = await Application.findOneAndUpdate(
      { jobId: job._id, workerId: worker._id },
      {
        jobId: job._id,
        workerId: worker._id,
        customerId: job.customerId,
        status: sample.status,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    await Job.findByIdAndUpdate(job._id, { $addToSet: { applicants: worker._id } });
    await Notification.findOneAndUpdate(
      {
        userId: job.customerId,
        type: "application",
        message: `${worker.name} applied to ${job.title}`,
      },
      {
        userId: job.customerId,
        title: "New application",
        message: `${worker.name} applied to ${job.title}`,
        type: "application",
        read: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    await Notification.findOneAndUpdate(
      {
        userId: worker._id,
        type: "application",
        message: `Your application is pending for ${job.title}`,
      },
      {
        userId: worker._id,
        title: "Application pending",
        message: `Your application is pending for ${job.title}`,
        type: "application",
        read: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    void application;
  }

  const categoryCount = await Job.distinct("category", { status: "open" });
  console.log(`Anga demo data ready. Open job categories: ${categoryCount.length}`);
}
