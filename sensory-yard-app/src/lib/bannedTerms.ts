/**
 * PRD §3 language policy: no parent-facing copy — UI, email, generated
 * report, ad/SEO copy — may use clinical/therapeutic or diagnostic
 * language, even if a parent volunteers a diagnosis themselves. This
 * list is the single source of truth: it's embedded into the system
 * prompt (planPrompt.ts) AND used as the programmatic second-layer
 * check on LLM output (PRD §8 — "not every model will follow
 * instruction-following constraints with equal reliability").
 */
export const BANNED_TERMS = [
  "therapeutic",
  "therapy",
  "occupational therapy",
  "ot",
  "intervention",
  "sensory processing disorder",
  "spd",
  "autism",
  "autistic",
  "adhd",
  "special needs",
  "diagnosis",
  "diagnosed",
];

/** Returns the matched term (whole-word, case-insensitive) or null. */
export function findBannedTerm(text: string): string | null {
  for (const term of BANNED_TERMS) {
    const pattern = term.replace(/\s+/g, "\\s+");
    const re = new RegExp(`\\b${pattern}\\b`, "i");
    if (re.test(text)) return term;
  }
  return null;
}
