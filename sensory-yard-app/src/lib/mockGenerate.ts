import { ZONE_CATALOG } from "./zones";
import { IntakeAnswers, Zone, ZoneId } from "./types";

/**
 * Very rough signal for "not handy and not hiring anyone" from the
 * free-text handiness answer. A static keyword check can't do the
 * nuanced per-idea tailoring the real LLM path does (planPrompt.ts) —
 * this only decides whether to swap in each zone's easyIdeas list
 * wholesale (zones.ts), a known approximation for the fallback path.
 */
function wantsLowAssembly(handiness: string): boolean {
  const t = handiness.toLowerCase();
  if (!t.trim()) return false;
  const noBuildSignal = /keep it simple|no building|not (very )?handy|don'?t want to build|store.?bought|ready.?made|no diy/.test(t);
  // Deliberately excludes bare "handy" — "not handy" would otherwise also
  // match this as a false positive override, since "handy" alone doesn't
  // distinguish "I'm handy" from "I'm not handy".
  const buildOrHireSignal = /\bdiy\b|\bbuild\b|love (a )?project|construct|\bhire\b|contractor|handyman|pay someone|professional/.test(t);
  return noBuildSignal && !buildOrHireSignal;
}

/**
 * Deterministic keyword-matching fallback — used by generatePlanLLM.ts
 * only when the real gateway call (primary and fallback model, both via
 * lib/llmGateway.ts) fails, times out, or returns invalid/banned-term
 * output. Same role SVG plays for the yard image: never let a report
 * fail outright just because the LLM path had a bad moment.
 */
export function generatePlan(answers: IntakeAnswers): Zone[] {
  const combined = `${answers.gravitates} ${answers.challenges} ${answers.space}`.toLowerCase();
  const lowAssembly = wantsLowAssembly(answers.handiness ?? "");

  const scores = Object.fromEntries(
    (Object.keys(ZONE_CATALOG) as ZoneId[]).map((id) => [
      id,
      ZONE_CATALOG[id].keywords.filter((k) => combined.includes(k)).length,
    ])
  ) as Record<ZoneId, number>;

  const ranked = (Object.keys(ZONE_CATALOG) as ZoneId[]).sort(
    (a, b) => scores[b] - scores[a]
  );

  const chosen = ranked.filter((id) => scores[id] > 0).slice(0, 5);
  if (chosen.length < 3) {
    for (const id of ranked) {
      if (!chosen.includes(id)) chosen.push(id);
      if (chosen.length >= 3) break;
    }
  }

  return chosen.map((id) => {
    const z = ZONE_CATALOG[id];
    const ideas = lowAssembly && z.easyIdeas.length ? z.easyIdeas : z.ideas;
    return { id, title: z.title, icon: z.icon, description: z.description, ideas, whereToShop: z.whereToShop };
  });
}

/**
 * Regex name extraction — used as the fallback path's name extractor
 * (when the LLM call itself fails, so its more reliable `kidName` field
 * from planPrompt.ts never runs). Conservative on purpose: only fires on
 * explicit "named X" / "name is X" phrasing to avoid false positives
 * from ordinary capitalized words.
 */
export function extractName(answers: IntakeAnswers): string | undefined {
  const combined = `${answers.gravitates} ${answers.challenges} ${answers.space}`;
  const patterns = [
    /\bnamed\s+([A-Z][a-z]+)/,
    /\bname(?:'s| is)\s+([A-Z][a-z]+)/,
    /\bmy (?:son|daughter|kid),?\s+([A-Z][a-z]+)/,
  ];
  for (const p of patterns) {
    const m = combined.match(p);
    if (m) return m[1];
  }
  return undefined;
}
