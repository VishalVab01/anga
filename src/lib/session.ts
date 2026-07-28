export type Role = "worker" | "customer";
export type AuthMode = "signup" | "login";
export type AuthMethod = "credentials" | "mobile";

const keys = {
  role: "rozgaar.role",
  phone: "rozgaar.phone",
  mode: "rozgaar.authMode",
  method: "anga.authMethod",
  token: "anga.token",
  workerProfile: "rozgaar.workerProfile",
  customerProfile: "rozgaar.customerProfile",
  workerProfileComplete: "anga.workerProfileComplete",
  customerProfileComplete: "anga.customerProfileComplete",
};

export function setAuthMode(mode: AuthMode) {
  if (typeof window !== "undefined") localStorage.setItem(keys.mode, mode);
}

export function getAuthMode(): AuthMode {
  if (typeof window === "undefined") return "signup";
  return localStorage.getItem(keys.mode) === "login" ? "login" : "signup";
}

export function setAuthMethod(method: AuthMethod) {
  if (typeof window !== "undefined") localStorage.setItem(keys.method, method);
}

export function getAuthMethod(): AuthMethod {
  if (typeof window === "undefined") return "credentials";
  return localStorage.getItem(keys.method) === "mobile" ? "mobile" : "credentials";
}

export function setRole(role: Role) {
  if (typeof window !== "undefined") localStorage.setItem(keys.role, role);
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem(keys.role);
  return role === "worker" || role === "customer" ? role : null;
}

export function setPhone(phone: string) {
  if (typeof window !== "undefined") localStorage.setItem(keys.phone, phone);
}

export function getPhone() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(keys.phone) ?? "";
}

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(keys.token, token);
}

export function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(keys.token) ?? "";
}

export function logoutLocal() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(keys.token);
  localStorage.removeItem(keys.role);
  localStorage.removeItem(keys.phone);
  localStorage.removeItem(keys.method);
  localStorage.removeItem(keys.workerProfileComplete);
  localStorage.removeItem(keys.customerProfileComplete);
}

export function setProfileComplete(role: Role, complete: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    role === "worker" ? keys.workerProfileComplete : keys.customerProfileComplete,
    complete ? "true" : "false",
  );
}

export function isProfileComplete(role: Role) {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(
      role === "worker" ? keys.workerProfileComplete : keys.customerProfileComplete,
    ) === "true"
  );
}

export function saveProfile(role: Role, data: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    role === "worker" ? keys.workerProfile : keys.customerProfile,
    JSON.stringify(data),
  );
}

export function getProfile(role: Role) {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(role === "worker" ? keys.workerProfile : keys.customerProfile);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}
