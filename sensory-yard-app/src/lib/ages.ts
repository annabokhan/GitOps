/**
 * The age quick-fact accepts one age or several comma-separated ages —
 * the mission doc (and the connection zone it inspired, lib/zones.ts) is
 * explicitly about siblings with different needs sharing one yard, so a
 * single-number field was a real gap. Kept as a plain text field (not a
 * repeatable "add another kid" UI) to avoid adding an intake step —
 * design doc §5.2 keeps intake to a fixed, short sequence on purpose.
 */
export function parseAges(input: string): number[] | null {
  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;

  const nums = parts.map(Number);
  if (nums.some((n) => Number.isNaN(n) || n < 0)) return null;
  return nums;
}
