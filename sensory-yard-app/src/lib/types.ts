export type ZoneId = "movement" | "texture" | "calm" | "taste-smell" | "visual";

export interface Zone {
  id: ZoneId;
  title: string;
  icon: string;
  description: string;
  ideas: string[];
}

export interface IntakeAnswers {
  age: string;
  zip: string;
  gravitates: string;
  challenges: string;
  space: string;
}

export interface Report {
  id: string;
  kidName?: string;
  zones: Zone[];
  createdAt: string;
  /** Set only when AI image generation succeeded (lib/imageGen.ts) — absent means the frontend renders the deterministic SVG sketch instead. */
  imageUrl?: string;
}
