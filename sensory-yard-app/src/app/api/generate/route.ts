import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { checkUsage, recordUsage, saveReport } from "@/lib/store";
import { generatePlan, extractName } from "@/lib/mockGenerate";
import { IntakeAnswers } from "@/lib/types";

/**
 * Design doc §5.3/§9: usage check runs before generation fires, so a
 * blocked request never pays for a wasted LLM call. In this mock the
 * "extraction + generation" pass is a single fast local call, so the
 * check and the generation happen in one request; a real build would
 * likely split a fast pre-check from the (slower) gateway call so the
 * /generating screen only renders once the check has already passed.
 */
export async function POST(req: NextRequest) {
  const answers = (await req.json()) as IntakeAnswers;

  const anonId = req.headers.get("x-anon-id") || req.cookies.get("sy_anon")?.value || "unknown";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  const usage = checkUsage(anonId, ip);
  if (!usage.allowed) {
    return NextResponse.json({ blocked: true, resetAt: usage.resetAt });
  }

  const zones = generatePlan(answers);
  const kidName = extractName(answers);
  const id = randomUUID();

  saveReport({ id, kidName, zones, createdAt: new Date().toISOString() });
  recordUsage(anonId, ip);

  return NextResponse.json({ blocked: false, id });
}
