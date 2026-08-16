/**
 * Structured-output schema sent as `response_format` (PRD §8: "Structured-
 * output enforcement should use a method the gateway can pass through
 * consistently across providers"). Kept in sync by hand with the shape
 * described in planPrompt.ts and validated again in generatePlanLLM.ts —
 * not every model honors `strict` equally, so this is belt-and-suspenders
 * with the app-layer validation, not a substitute for it.
 */
export const PLAN_JSON_SCHEMA = {
  name: "sensory_yard_plan",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      kidName: { type: ["string", "null"] },
      zones: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: {
              type: "string",
              enum: ["movement", "texture", "calm", "taste-smell", "visual", "connection", "critters"],
            },
            description: { type: "string" },
            ideas: {
              type: "array",
              minItems: 3,
              maxItems: 5,
              items: { type: "string" },
            },
            whereToShop: { type: "string" },
          },
          required: ["id", "description", "ideas", "whereToShop"],
        },
      },
    },
    required: ["kidName", "zones"],
  },
} as const;
