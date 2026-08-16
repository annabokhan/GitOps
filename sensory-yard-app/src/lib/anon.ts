const STORAGE_KEY = "sy_anon_id";
const COOKIE_KEY = "sy_anon";

function readCookie(name: string): string | undefined {
  return document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1];
}

/**
 * Client-generated anonymous device ID (design doc §9). Stored in both
 * localStorage and a first-party cookie so iOS Safari's ITP clearing
 * one doesn't silently reset a parent's usage window (design doc §7).
 * Not an account — never tied to an email unless separately submitted
 * via EmailCapture.
 */
export function getAnonId(): string {
  if (typeof window === "undefined") return "server";

  let id = window.localStorage.getItem(STORAGE_KEY) ?? readCookie(COOKIE_KEY);
  if (!id) {
    id = crypto.randomUUID();
  }

  window.localStorage.setItem(STORAGE_KEY, id);
  document.cookie = `${COOKIE_KEY}=${id}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  return id;
}

export function getLastReportId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("sy_last_report_id");
}

export function setLastReportId(id: string): void {
  window.localStorage.setItem("sy_last_report_id", id);
}
