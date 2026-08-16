import { Zone } from "./types";

function positionPhrase(index: number, total: number): string {
  if (total <= 1) return "filling the whole yard";
  if (total === 2) return index === 0 ? "on the left side of the yard" : "on the right side of the yard";
  if (total === 3) {
    if (index === 0) return "along the top, spanning most of the width, just below the house";
    return index === 1 ? "in the bottom-left corner" : "in the bottom-right corner";
  }
  if (total === 4) {
    // matches the 2x2 grid in lib/layout.ts
    const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];
    return `in the ${corners[index]} of the yard`;
  }
  // 5 — matches the top-strip + 2x2-grid layout in lib/layout.ts
  if (index === 0) return "along the top, spanning most of the width, just below the house";
  const rest = ["in the middle-left area", "in the middle-right area", "in the bottom-left corner", "in the bottom-right corner"];
  return rest[index - 1];
}

/**
 * Enumerates each zone's actual idea items (not just its name) so the
 * generated image shows a specific, detailed plan rather than generic
 * labeled patches — the explicit ask that drove trying image generation
 * in the first place (design doc §5.4). Deliberately instructs no text
 * in the image: image models render legible text unreliably, and the
 * numbered zone cards below are already the authoritative, accurate
 * legend — the image doesn't need to duplicate that job.
 */
export function buildYardImagePrompt(zones: Zone[]): string {
  const zoneLines = zones
    .map((zone, i) => {
      const pos = positionPhrase(i, zones.length);
      const items = zone.ideas.join(", ").toLowerCase();
      return `${pos}: a "${zone.title.toLowerCase()}" area containing ${items}.`;
    })
    .join(" ");

  return [
    "A warm, hand-illustrated bird's-eye-view map of a small suburban backyard, colored-pencil and watercolor style, cream paper background, soft muted natural colors.",
    "A small house with a peaked roof sits at the top edge of the yard, with a short path leading down into the yard. A simple wobbly wooden fence encloses the whole yard.",
    "The yard is divided into clearly separate illustrated garden-bed areas, each drawn with specific, recognizable objects in it — not generic empty patches of grass. Include, drawn in detail:",
    zoneLines,
    "Style: whimsical children's-book illustration, top-down landscape-plan perspective, soft rounded outlines, warm color palette of sage greens, sandy tans, and dusty blues, inviting and calm, like a hand-drawn map from a picture book.",
    "Do not include any text, words, letters, numbers, or labels anywhere in the image.",
  ].join(" ");
}
