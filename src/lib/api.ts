import type { Role } from "./session";

const RAW_API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "https://anga-s5vx.onrender.com/api" : "http://localhost:5000/api");
const API_URL = normalizeApiUrl(RAW_API_URL);

function normalizeApiUrl(url: string) {
  const trimmed = url.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type ApiJob = {
  _id: string;
  title: string;
  category: string;
  description: string;
  problemImageUrl?: string;
  location: string;
  wage: number;
  date: string;
  time: string;
  urgent: boolean;
  workersNeeded: number;
  status: "open" | "assigned" | "completed" | "cancelled";
  assignedWorkerId?: string | null;
  applicants: string[];
  applicationStatus?: "pending" | "accepted" | "rejected" | "completed" | null;
  createdAt: string;
};

export type ApiApplication = {
  _id: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  jobId: ApiJob;
  workerId: string;
  customerId: string;
  createdAt: string;
};

export type ApiNotification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

export type ApiWorkerProfile = {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  skills: string[];
  experience: string;
  expectedWage: number;
  availableToday: boolean;
  preferredDistance: string;
  location: string;
  photoUrl?: string;
  documentsUploaded: boolean;
  verified: boolean;
  rating: number;
  totalJobsCompleted: number;
};

export type ApiCustomerProfile = {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  customerType: string;
  rating: number;
};

function token() {
  return typeof window === "undefined" ? "" : localStorage.getItem("anga.token") || "";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const authToken = token();
  if (authToken) headers.set("Authorization", `Bearer ${authToken}`);

  const url = `${API_URL}${path}`;
  const response = await fetch(url, { ...options, headers }).catch(() => {
    throw new ApiError(`Could not reach API at ${API_URL}. Check backend URL and CORS.`, 0);
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.message || "Request failed", response.status);
  return data as T;
}

export const api = {
  warmup: () =>
    fetch(`${API_URL}/health`, { method: "GET" }).catch(() => {
      // Best-effort Render warmup. User-facing requests still handle real errors.
    }),
  sendOtp: (phone: string) =>
    request<{ otp?: string; message: string }>("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),
  verifyOtp: (phone: string, otp: string, role: Role) =>
    request<{
      token: string;
      user: {
        _id: string;
        role: Role;
        isProfileComplete: boolean;
        name?: string;
        phone?: string;
        location?: string;
        address?: string;
      };
    }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp, role }),
    }),
  me: () =>
    request<{
      user: { _id: string; role: Role; isProfileComplete: boolean; name: string; phone: string };
    }>("/auth/me"),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
  profile: () =>
    request<{ user: unknown; profile: ApiWorkerProfile | ApiCustomerProfile | null }>("/profile"),
  saveWorkerProfile: (body: unknown) =>
    request<{ profile: ApiWorkerProfile }>("/profile/worker", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  saveCustomerProfile: (body: unknown) =>
    request<{ profile: ApiCustomerProfile }>("/profile/customer", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  jobs: (params = "") => request<{ jobs: ApiJob[] }>(`/jobs${params}`),
  nearbyJobs: (params = "") => request<{ jobs: ApiJob[] }>(`/jobs/nearby${params}`),
  job: (id: string) => request<{ job: ApiJob }>(`/jobs/${id}`),
  createJob: (body: unknown) =>
    request<{ job: ApiJob }>("/jobs", { method: "POST", body: JSON.stringify(body) }),
  updateJob: (id: string, body: unknown) =>
    request<{ job: ApiJob }>(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  cancelJob: (id: string) => request<{ job: ApiJob }>(`/jobs/${id}`, { method: "DELETE" }),
  apply: (id: string) => request<{ application: unknown }>(`/jobs/${id}/apply`, { method: "POST" }),
  applicants: (id: string) =>
    request<{
      job: ApiJob;
      applicants: Array<{
        application: {
          _id: string;
          status: "pending" | "accepted" | "rejected" | "completed";
          workerId: string;
        };
        worker: ApiWorkerProfile | null;
      }>;
    }>(`/jobs/${id}/applicants`),
  assign: (id: string, workerId: string) =>
    request(`/jobs/${id}/assign`, { method: "POST", body: JSON.stringify({ workerId }) }),
  complete: (id: string) => request(`/jobs/${id}/complete`, { method: "POST" }),
  myApplications: () => request<{ applications: ApiApplication[] }>("/applications/my"),
  notifications: () => request<{ notifications: ApiNotification[] }>("/notifications"),
  markNotificationRead: (id: string) =>
    request<{ notification: ApiNotification }>(`/notifications/${id}/read`, { method: "PATCH" }),
  markNotificationsRead: () =>
    request<{ message: string }>("/notifications/read-all", { method: "PATCH" }),
  workers: (params = "") => request<{ workers: ApiWorkerProfile[] }>(`/workers${params}`),
};
