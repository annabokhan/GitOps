import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { checkUsage, recordUsage, saveReport } from "@/lib/store";
import { generatePlanViaLLM } from "@/lib/generatePlanLLM";
import { generateYardImage } from "@/lib/imageGen";
import { buildYardImagePrompt } from "@/lib/imagePrompt";
import { IntakeAnswers } from "@/lib/types";

/**
 * Design doc §5.3/§9: usage check runs before generation fires, so a
 * blocked request never pays for a wasted LLM call. The plan call
 * (generatePlanViaLLM) and the image call (generateYardImage) are two
 * sequential external calls, each with its own timeout and its own
 * fallback — a real build should consider whether that combined
 * worst-case wait is still acceptable against the GeneratingAnimation's
 * hard-timeout assumption (§5.3); see design doc §13.
 */
export async function POST(req: NextRequest) {
  const answers = (await req.json()) as IntakeAnswers;

  const anonId = req.headers.get("x-anon-id") || req.cookies.get("sy_anon")?.value || "unknown";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  const usage = checkUsage(anonId, ip);
  if (!usage.allowed) {
    return NextResponse.json({ blocked: true, resetAt: usage.resetAt });
  }

  const { zones, kidName } = await generatePlanViaLLM(answers);
  const id = randomUUID();

  // Best-effort — a failed/skipped image never fails the report or the
  // usage accounting below; the frontend falls back to the SVG sketch.
  const imageResult = await generateYardImage(buildYardImagePrompt(zones));

  saveReport({
    id,
    kidName,
    zones,
    createdAt: new Date().toISOString(),
    imageUrl: imageResult.ok ? imageResult.url : undefined,
  });
  recordUsage(anonId, ip);

  return NextResponse.json({ blocked: false, id });
}
