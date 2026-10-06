/**
 * sessionStorage helpers that never throw.
 *
 * Storage access fails in Safari private browsing, when cookies/site data are
 * blocked, and when the 5MB quota is exceeded. Every access here is guarded so
 * a storage failure degrades to "no saved value" instead of crashing a page.
 */

export const STORAGE_KEYS = {
  input: "pratibimb_input",
  teachback: "pratibimb_teachback",
  locale: "pratibimb_locale",
  lowBandwidth: "pratibimb_low_bandwidth",
} as const;

export function readSessionItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Returns false when the value could not be persisted. */
export function writeSessionItem(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function writeSessionJSON(key: string, value: unknown): boolean {
  try {
    return writeSessionItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

export function removeSessionItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* nothing to do */
  }
}

export function isSessionStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const probe = "__pratibimb_probe__";
    window.sessionStorage.setItem(probe, "1");
    window.sessionStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}