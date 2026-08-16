import { ZONE_CATALOG } from "./zones";
import { IntakeAnswers, Zone, ZoneId } from "./types";

/**
 * PLACEHOLDER for the real LLM gateway call (PRD §8 / design doc §5.2).
 * Deterministic keyword scoring stands in for the extraction+generation
 * pass so the app is fully click-through-able before a gateway/provider
 * is chosen. Swap this function's internals for the real gateway call —
 * callers (the /api/generate route) don't need to change.
 */
export function generatePlan(answers: IntakeAnswers): Zone[] {
  const combined = `${answers.gravitates} ${answers.challenges} ${answers.space}`.toLowerCase();

  const scores = Object.fromEntries(
    (Object.keys(ZONE_CATALOG) as ZoneId[]).map((id) => [
      id,
      ZONE_CATALOG[id].keywords.filter((k) => combined.includes(k)).length,
    ])
  ) as Record<ZoneId, number>;

  const ranked = (Object.keys(ZONE_CATALOG) as ZoneId[]).sort(
    (a, b) => scores[b] - scores[a]
  );

  const chosen = ranked.filter((id) => scores[id] > 0).slice(0, 4);
  if (chosen.length < 3) {
    for (const id of ranked) {
      if (!chosen.includes(id)) chosen.push(id);
      if (chosen.length >= 3) break;
    }
  }

  return chosen.map((id) => {
    const z = ZONE_CATALOG[id];
    return { id, title: z.title, icon: z.icon, description: z.description, ideas: z.ideas };
  });
}

/**
 * Heuristic name extraction — a stand-in for the real extraction pass
 * (design doc §10) that would pull a volunteered first name out of
 * free text using the LLM, not regex. Conservative on purpose: only
 * fires on explicit "named X" / "name is X" phrasing to avoid false
 * positives from ordinary capitalized words.
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
