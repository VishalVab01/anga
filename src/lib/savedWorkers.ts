const savedWorkersKey = "anga.savedWorkers";

export type SavedWorker = {
  id: string;
  name: string;
  phone: string;
  skill: string;
  area: string;
  rating: number;
  expectedWage: number;
  verified: boolean;
  photoUrl?: string;
};

export function getSavedWorkers(): SavedWorker[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(savedWorkersKey) || "[]");
    return Array.isArray(value) ? (value as SavedWorker[]) : [];
  } catch {
    return [];
  }
}

export function isWorkerSaved(id: string) {
  return getSavedWorkers().some((worker) => worker.id === id);
}

export function saveWorker(worker: SavedWorker) {
  const next = [worker, ...getSavedWorkers().filter((item) => item.id !== worker.id)].slice(0, 30);
  localStorage.setItem(savedWorkersKey, JSON.stringify(next));
  return next;
}

export function removeSavedWorker(id: string) {
  const next = getSavedWorkers().filter((worker) => worker.id !== id);
  localStorage.setItem(savedWorkersKey, JSON.stringify(next));
  return next;
}
