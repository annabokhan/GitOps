import { callGateway } from "./llmGateway";
import { PLAN_SYSTEM_PROMPT, buildPlanUserMessage } from "./planPrompt";
import { PLAN_JSON_SCHEMA } from "./planSchema";
import { findBannedTerm } from "./bannedTerms";
import { generatePlan as fallbackGeneratePlan, extractName as fallbackExtractName } from "./mockGenerate";
import { ZONE_CATALOG } from "./zones";
import { IntakeAnswers, Zone, ZoneId } from "./types";

// PRD §8: "model selection as configuration, not code" — swappable without a deploy if the gateway supports it.
const PRIMARY_MODEL = process.env.PLAN_MODEL || "google/gemini-2.5-flash-lite";
const FALLBACK_MODEL = process.env.PLAN_FALLBACK_MODEL || "anthropic/claude-haiku-4.5";

interface LLMPlanShape {
  kidName: string | null;
  zones: { id: ZoneId; description: string; ideas: string[] }[];
}

function validate(parsed: unknown): LLMPlanShape | null {
  if (!parsed || typeof parsed !== "object") return null;
  const p = parsed as Record<string, unknown>;
  if (!Array.isArray(p.zones) || p.zones.length < 3 || p.zones.length > 5) return null;

  const seenIds = new Set<string>();
  for (const raw of p.zones) {
    if (!raw || typeof raw !== "object") return null;
    const z = raw as Record<string, unknown>;
    if (typeof z.id !== "string" || !(z.id in ZONE_CATALOG)) return null;
    if (seenIds.has(z.id)) return null;
    seenIds.add(z.id);
    if (typeof z.description !== "string" || !z.description.trim()) return null;
    if (!Array.isArray(z.ideas) || z.ideas.length < 3 || z.ideas.some((i) => typeof i !== "string")) return null;
  }

  if (p.kidName !== null && typeof p.kidName !== "string") return null;
  return p as unknown as LLMPlanShape;
}

/** PRD §8: banned-term list must be checked programmatically as a second layer, not just relied on in the prompt. */
function hasBannedContent(plan: LLMPlanShape): boolean {
  if (plan.kidName && findBannedTerm(plan.kidName)) return true;
  return plan.zones.some((z) => findBannedTerm(z.description) || z.ideas.some((idea) => findBannedTerm(idea)));
}

async function attemptModel(model: string, userMessage: string): Promise<LLMPlanShape | null> {
  const res = await callGateway(model, PLAN_SYSTEM_PROMPT, userMessage, PLAN_JSON_SCHEMA);
  console.log(`[plan-gen] model=${model} ok=${res.ok} latency=${res.latencyMs}ms${res.reason ? ` reason=${res.reason}` : ""}`);
  if (!res.ok || !res.content) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(res.content);
  } catch {
    console.log(`[plan-gen] model=${model} returned non-JSON content`);
    return null;
  }

  const valid = validate(parsed);
  if (!valid) {
    console.log(`[plan-gen] model=${model} returned output that failed schema validation`);
    return null;
  }
  if (hasBannedContent(valid)) {
    console.log(`[plan-gen] model=${model} output contained a banned term, discarding`);
    return null;
  }
  return valid;
}

export interface GeneratedPlan {
  zones: Zone[];
  kidName?: string;
  source: "llm" | "fallback";
}

/**
 * Real plan generation (PRD §8): primary model, then fallback model, then
 * — only if both the gateway call and the app-layer validation fail —
 * the deterministic keyword-matching generator (mockGenerate.ts). A
 * report is never failed outright because of this call.
 */
export async function generatePlanViaLLM(answers: IntakeAnswers): Promise<GeneratedPlan> {
  const userMessage = buildPlanUserMessage(answers);

  const result = (await attemptModel(PRIMARY_MODEL, userMessage)) ?? (await attemptModel(FALLBACK_MODEL, userMessage));

  if (result) {
    const zones: Zone[] = result.zones.map((z) => ({
      id: z.id,
      title: ZONE_CATALOG[z.id].title,
      icon: ZONE_CATALOG[z.id].icon,
      description: z.description,
      ideas: z.ideas,
    }));
    return { zones, kidName: result.kidName ?? undefined, source: "llm" };
  }

  console.log("[plan-gen] both models unavailable/invalid, using fallback generator");
  return {
    zones: fallbackGeneratePlan(answers),
    kidName: fallbackExtractName(answers),
    source: "fallback",
  };
}
