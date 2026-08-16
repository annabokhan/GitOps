export interface ChatPrompt {
  key: "gravitates" | "challenges" | "space" | "handiness";
  assistant: string;
  placeholder: string;
  chips: string[];
}

// Design doc §5.2, prompt sequence steps 2-4 (step 1 is the quick-facts age/zip screen).
export const CHAT_PROMPTS: ChatPrompt[] = [
  {
    key: "gravitates",
    assistant:
      "Tell us what your kid's into outdoors — what do they gravitate toward? If you're planning for more than one kid, tell us about each of them here.",
    placeholder: "e.g. climbs everything, loves digging in the dirt, can't sit still...",
    chips: ["seeks big movement", "loves textures", "curious about plants", "watches everything closely"],
  },
  {
    key: "challenges",
    assistant: "What's hard for them, or what do you find yourselves avoiding?",
    placeholder: "e.g. melts down in loud crowds, won't touch grass barefoot, slow to warm up to new things...",
    chips: ["overwhelmed by crowds", "cautious with new things", "sensitive to loud sound", "picky about textures"],
  },
  {
    key: "space",
    assistant: "Tell us about your outdoor space — size, sun or shade, what's already out there.",
    placeholder: "e.g. small fenced backyard, mostly shady, just grass and a patio right now...",
    chips: [
      "small yard",
      "mostly shade",
      "already have a garden bed",
      "open, no fence",
      "open to a bigger project (coop, pond, tree house)",
    ],
  },
  {
    key: "handiness",
    assistant:
      "Last one — how hands-on do you want to be? Comfortable building things yourself, would rather hire someone for bigger projects, or want to keep it mostly ready-made?",
    placeholder: "e.g. I love a DIY project, or we'd hire someone for anything big, or keep it simple — no building for us...",
    chips: [
      "I like building things myself",
      "happy to hire someone for bigger stuff",
      "keep it simple — no building",
      "a mix, depends on the project",
    ],
  },
];
