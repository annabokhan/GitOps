import { Report } from "./types";

/**
 * In-memory stand-in for the real persistence layer (design doc §9:
 * Redis/Postgres for usage counters, a real DB for reports). Fine for
 * a single dev-server process / demo; state resets on server restart
 * and won't work across multiple server instances — a known
 * limitation flagged in the app README, not something to build around
 * here.
 */

// Next.js dev (Turbopack) can instantiate this module separately per
// bundling context (route handlers vs. page renders), so a plain
// module-level Map isn't reliably shared between /api/generate and
// the /report/[id] page. Pinning to globalThis forces one instance
// per Node process, which is what we actually want for this demo.
interface StoreGlobal {
  __sy_reports?: Map<string, Report>;
  __sy_anonUsage?: Map<string, number[]>;
  __sy_ipUsage?: Map<string, number[]>;
}
const g = globalThis as unknown as StoreGlobal;

const reports = (g.__sy_reports ??= new Map<string, Report>());
const anonUsage = (g.__sy_anonUsage ??= new Map<string, number[]>());
const ipUsage = (g.__sy_ipUsage ??= new Map<string, number[]>());

const ANON_LIMIT = Number(process.env.USAGE_LIMIT_PER_ANON ?? 3);
const ANON_WINDOW_MS = Number(process.env.USAGE_LIMIT_WINDOW_DAYS ?? 7) * 24 * 60 * 60 * 1000;
const IP_LIMIT = Number(process.env.USAGE_LIMIT_PER_IP ?? 12);
const IP_WINDOW_MS = 24 * 60 * 60 * 1000;

function prune(timestamps: number[], windowMs: number, now: number): number[] {
  return timestamps.filter((t) => now - t < windowMs);
}

export type UsageResult = { allowed: true } | { allowed: false; resetAt: number };

/** Design doc §9: per-anon_id limit is primary/user-facing, per-IP is a coarser abuse backstop. */
export function checkUsage(anonId: string, ip: string): UsageResult {
  const now = Date.now();
  const anonTimes = prune(anonUsage.get(anonId) ?? [], ANON_WINDOW_MS, now);
  const ipTimes = prune(ipUsage.get(ip) ?? [], IP_WINDOW_MS, now);

  if (anonTimes.length >= ANON_LIMIT) {
    return { allowed: false, resetAt: anonTimes[0] + ANON_WINDOW_MS };
  }
  if (ipTimes.length >= IP_LIMIT) {
    return { allowed: false, resetAt: ipTimes[0] + IP_WINDOW_MS };
  }
  return { allowed: true };
}

/** Only call after a generation actually succeeds — design doc §9: failed generations are free. */
export function recordUsage(anonId: string, ip: string): void {
  const now = Date.now();
  anonUsage.set(anonId, [...prune(anonUsage.get(anonId) ?? [], ANON_WINDOW_MS, now), now]);
  ipUsage.set(ip, [...prune(ipUsage.get(ip) ?? [], IP_WINDOW_MS, now), now]);
}

export function saveReport(report: Report): void {
  reports.set(report.id, report);
}

export function getReport(id: string): Report | undefined {
  return reports.get(id);
}
