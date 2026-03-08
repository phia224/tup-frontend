export interface StoredAnnouncement {
  date: string;
  description: string;
  url?: string;
}

const STORAGE_KEY = "tup_announcements";

export function loadAnnouncements(): StoredAnnouncement[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredAnnouncement[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveAnnouncements(items: StoredAnnouncement[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export function addAnnouncement(item: StoredAnnouncement) {
  const current = loadAnnouncements();
  const updated = [item, ...current];
  saveAnnouncements(updated);
}





