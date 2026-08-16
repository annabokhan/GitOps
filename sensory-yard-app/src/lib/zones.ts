import { ZoneId } from "./types";

/**
 * Zone taxonomy. Originally guessed from the PRD's references to a
 * "source-spec §4.1" this app never had the actual text of — "connection"
 * was added after realizing the mission doc's own saucer-swing scene
 * (two very different kids at ease in the same spot at once) and its
 * closing line — "regulation, curiosity, connection, and rest" — named a
 * zone type the original five didn't cover. Keywords drive the mock
 * fallback's relevance scoring (lib/mockGenerate.ts); the real LLM path
 * (lib/planPrompt.ts) uses the same fixed ids for its own reasons: the
 * UI (icons, swatches, sketch layout) is keyed to this exact set.
 *
 * Default ideas for texture/taste-smell lean on real Bay Area / Northern
 * California plant knowledge (pomegranate, fig, persimmon, kumquat;
 * tough Mediterranean herbs — rosemary, thyme, lavender — over
 * water-needy ones in full sun), not generic ideas that happen to work
 * anywhere — this product's actual audience is regional (PRD §10), and
 * this static catalog can't do the per-request zip-code reasoning the
 * real LLM path does (planPrompt.ts), so it's worth getting the fixed
 * defaults right for the region that matters.
 */
export const ZONE_CATALOG: Record<
  ZoneId,
  { title: string; icon: string; keywords: string[]; description: string; ideas: string[]; whereToShop: string }
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
    whereToShop:
      "Lumber and hardware from Home Depot or Lowe's; secondhand swing sets and climbing structures often turn up on Facebook Marketplace or Craigslist for a fraction of retail price.",
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
      "Mint, chives, and lamb's ear planted low in a partly shaded spot",
      "Rosemary or lavender planted low in the sunnier stretches — tougher and just as touchable",
      "Textured stepping stones",
      "Water table or creek rocks",
      "A simple mud kitchen from a repurposed pallet or old kitchen cart",
    ],
    whereToShop:
      "Sand, mulch, and stepping stones from Home Depot, Lowe's, or a local landscaping-supply yard; herb starts from a local nursery; a repurposed pallet or old kitchen cart for a mud kitchen is easy to find free or cheap on Facebook Marketplace.",
  },
  calm: {
    title: "Calm Corner",
    icon: "🌤️",
    keywords: [
      "cautious", "overwhelm", "loud", "crowd", "quiet", "meltdown", "shy",
      "slow to warm", "retreat", "calm", "anxious", "noise",
    ],
    description: "A low-stimulation spot to retreat to when it's all a bit much — and just as much a spot for you to sit down and actually watch, not just supervise.",
    ideas: [
      "Small tucked-away nook with a canopy or tall grasses",
      "A genuinely comfortable two-person hammock chair or papasan, not just any bench",
      "Wind chimes or rustling grasses for gentle sound",
      "Shade cover from a tree or simple pergola, sized to fit an adult chair underneath",
    ],
    whereToShop:
      "A hammock chair or outdoor cushions from a home-goods store like Target or World Market; shade cloth or a simple pergola kit from Home Depot or a local garden center.",
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
      "Tough, sun-loving herbs like rosemary, thyme, or oregano for easy, low-water picking — basil and mint are lovely but want more shade and water",
      "A pomegranate, fig, persimmon, or kumquat tree — all reliable in a hot, dry summer and something to track ripening over a season",
      "A few cherry tomato plants if there's a bit of extra water to give them in summer",
      "Raised bed at kid height for easy reach",
    ],
    whereToShop:
      "Herb and fruit-tree starts from a local nursery (ask specifically for what's suited to a hot, dry summer); raised-bed kits from Home Depot, Lowe's, or online.",
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
    whereToShop:
      "Bird- and butterfly-friendly plants from a local nursery; wind spinners and birdbaths from a garden center, Target, or a marketplace like Etsy.",
  },
  connection: {
    title: "Together Spot",
    icon: "🤝",
    keywords: [
      "together", "swing", "both kids", "share", "sibling", "side by side",
      "hammock", "each other", "family",
    ],
    description:
      "A shared spot built for more than one to be at ease in at the same time — including you.",
    ideas: [
      "Saucer or platform swing built for two",
      "Wide hammock or hammock chair",
      "A shaded, comfortable sitting area right at the edge of it — real outdoor chairs, not a plank of wood — so you can actually be there with them",
      "A blanket-sized flat patch for a shared picnic spot",
    ],
    whereToShop:
      "A saucer swing or wide hammock from a garden center or Target/Walmart, or secondhand on Facebook Marketplace; outdoor chairs and shade structures from Home Depot, Lowe's, or a home-goods store.",
  },
  critters: {
    title: "Critter Corner",
    icon: "🐾",
    keywords: [
      "chicken", "chickens", "coop", "fish pond", "pond", "rabbit", "rabbits",
      "duck", "ducks", "critter", "critters", "pet", "pets", "animals",
    ],
    description:
      "A small-animal corner for a family ready to take on the ongoing care that comes with it — start smaller if you're not sure yet.",
    ideas: [
      "A simple bird feeder station, if you'd rather start smaller",
      "A small backyard chicken coop (check local rules first)",
      "A fenced, shallow, kid-safe fish pond",
      "A rabbit hutch with a grass run",
    ],
    whereToShop:
      "Coop and hutch kits from Tractor Supply or online; check Facebook Marketplace for secondhand structures, and always check local ordinances before bringing animals home.",
  },
};

/** Pastel fills for the yard sketch (components/YardSketch.tsx) — kept off the main palette so zones stay visually distinct without competing with CTAs. */
export const ZONE_SWATCH: Record<ZoneId, string> = {
  movement: "#dfe8da",
  texture: "#f1e4cd",
  calm: "#e2e7ea",
  "taste-smell": "#eef0d2",
  visual: "#ecdfea",
  connection: "#f2ddc9",
  critters: "#dde8e2",
};
