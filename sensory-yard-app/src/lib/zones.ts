import { ZoneId } from "./types";

/**
 * Zone taxonomy per source-spec §4.1. Keywords drive the mock
 * generator's relevance scoring (lib/mockGenerate.ts) — a stand-in
 * for the real LLM extraction+generation pass (PRD §8).
 */
export const ZONE_CATALOG: Record<
  ZoneId,
  { title: string; icon: string; keywords: string[]; description: string; ideas: string[] }
> = {
  movement: {
    title: "Movement Zone",
    icon: "🏃",
    keywords: [
      "climb", "run", "jump", "spin", "swing", "big movement", "cant sit still",
      "can't sit still", "balance", "bike", "chase", "energy", "bolt", "wired",
    ],
    description:
      "Big, safe ways to move — built for a kid whose body needs to move to feel settled.",
    ideas: [
      "Balance beam or stepping logs",
      "Tunnel to crawl through",
      "Saucer or platform swing",
      "Low climbing structure or log pile",
    ],
  },
  texture: {
    title: "Texture Zone",
    icon: "🤚",
    keywords: [
      "texture", "touch", "sand", "dirt", "mud", "sensory bin", "mint", "chives",
      "soft", "rough", "hands",
    ],
    description:
      "Hands-on materials to touch, dig through, and explore at their own pace.",
    ideas: [
      "Sand or dirt digging pit",
      "Mint, chives, and lamb's ear planted low",
      "Textured stepping stones",
      "Water table or creek rocks",
    ],
  },
  calm: {
    title: "Calm Corner",
    icon: "🌤️",
    keywords: [
      "cautious", "overwhelm", "loud", "crowd", "quiet", "meltdown", "shy",
      "slow to warm", "retreat", "calm", "anxious", "noise",
    ],
    description: "A low-stimulation spot to retreat to when it's all a bit much.",
    ideas: [
      "Small tucked-away nook with a canopy or tall grasses",
      "Soft seating or a hammock chair",
      "Wind chimes or rustling grasses for gentle sound",
      "Shade cover from a tree or simple pergola",
    ],
  },
  "taste-smell": {
    title: "Taste & Smell Garden",
    icon: "🌱",
    keywords: [
      "smell", "taste", "eat", "food", "picky", "garden", "fruit", "herbs",
      "try new", "peach", "grow",
    ],
    description:
      "Low-pressure ways to explore smell and taste — picking, smelling, and tasting on their own terms.",
    ideas: [
      "Easy-to-grow herbs like mint and basil",
      "A few cherry tomato or strawberry plants",
      "A young fruit tree to track over a season",
      "Raised bed at kid height for easy reach",
    ],
  },
  visual: {
    title: "Watching & Wondering Zone",
    icon: "🦋",
    keywords: [
      "watch", "look", "colors", "bugs", "butterflies", "birds", "curious", "notice",
    ],
    description:
      "Slow-moving, colorful things to notice and watch — good for a kid who explores with their eyes first.",
    ideas: [
      "Butterfly- and bird-friendly flowers",
      "Wind spinners or ribbon streamers",
      "A small pond-safe birdbath",
      "Colorful, varied plantings at eye level",
    ],
  },
};

/** Pastel fills for the yard sketch (components/YardSketch.tsx) — kept off the main palette so zones stay visually distinct without competing with CTAs. */
export const ZONE_SWATCH: Record<ZoneId, string> = {
  movement: "#dfe8da",
  texture: "#f1e4cd",
  calm: "#e2e7ea",
  "taste-smell": "#eef0d2",
  visual: "#ecdfea",
};
