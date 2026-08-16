# Sensory Yard — Phase 1 prototype

Working build of the Phase 1 flow described in
`../docs/design/sensory-yard-phase1-app-design.md`: landing → chat intake →
generating → report, plus About/Research/Privacy and the anonymous
usage-limit gate.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Works in any modern mobile or desktop
browser — this is the responsive web app described in the design doc §2,
not a native build.

## What's real vs. mocked

- **Chat intake, review, usage limiting, report rendering** — real,
  end-to-end.
- **Plan generation** — real, via `src/lib/generatePlanLLM.ts`, not
  mocked (design doc §5.2 / PRD §8). The system prompt lives in
  `src/lib/planPrompt.ts` (edit that file to iterate on it — nothing
  else needs to change) and opens with the product's actual mission
  (why it exists, what "regulation, curiosity, connection, and rest"
  means) before the mechanical rules — a first draft that skipped
  straight to taxonomy/schema/safety read as generic, never used the
  age field, and never asked about the parent's own experience of the
  space. Taxonomy is 6 zone types now, not 5 — added `connection` (a
  shared spot for two kids, or a kid and a parent, to be at ease
  together) after re-reading the mission doc's own saucer-swing scene,
  which the original five didn't cover. The structured-output schema
  lives in `src/lib/planSchema.ts`, the banned-term list + programmatic
  second-layer check in `src/lib/bannedTerms.ts`, and the
  provider-agnostic OpenRouter call in `src/lib/llmGateway.ts`. Chain on
  every request: primary model → fallback model → `src/lib/mockGenerate.ts`
  (the original deterministic keyword-matcher, now the last-resort
  fallback — same role the SVG plays for the yard image) if both models
  are unavailable or return invalid/banned output. **Untested against a
  live key**: this sandbox has no `OPENROUTER_API_KEY`; every request
  here falls through to the mock generator, which has been verified end-
  to-end (see below) — the gateway call itself has not.
- **Name extraction** — the LLM's own `kidName` field is used when the
  real plan-generation call succeeds; `extractName` in
  `src/lib/mockGenerate.ts` (a conservative regex heuristic) only runs
  when the LLM path falls all the way back to the mock. Try typing
  "...named Emma..." into any chat answer to see it personalize the
  report title either way.
- **Persistence** (`src/lib/store.ts`) — in-memory, pinned to `globalThis`
  so it survives Turbopack's per-route module instances in dev. Resets on
  server restart and won't work across multiple server instances — fine
  for this prototype, but design doc §9 calls for real Redis/Postgres
  before this goes further than a demo.
- **Email capture** (`src/app/api/notify`) — logs to the console instead
  of writing to a real list.
- **Yard visual** — two real paths, not mocked, chosen by `YardVisual.tsx`:
  - **AI image** (`src/lib/imageGen.ts` + `src/lib/imagePrompt.ts`) — a
    real call to fal.ai's Flux Schnell (cheap tier, ~$0.003–$0.005/image;
    design doc §5.4 has the full cost reasoning), with a detailed prompt
    enumerating each zone's specific idea items, not just its name.
    **Untested against a live key**: this sandbox has no `FAL_KEY` and
    fal.ai is blocked at the network egress proxy here, so this path has
    only been verified to fail gracefully (see below), not to succeed —
    double-check the request/response shape against fal's current docs
    once you wire a real key somewhere that can reach it.
  - **SVG fallback** (`src/components/YardSketch.tsx`, `src/lib/blob.ts`,
    `src/lib/seededRandom.ts`, `src/components/sketch/doodles.tsx`) —
    procedural, always available. Used whenever the image call is
    skipped (no `FAL_KEY`), times out, errors, or the returned URL fails
    to load client-side. Organic zone shapes and a wobbled yard boundary
    come from a small deterministic path library; per-zone doodles (tree,
    flowers, sprouts, pebbles, motion lines) are hand-coded SVG.
    Everything is seeded from the report id + zone id, never
    `Math.random()` — required so server-rendered and client-hydrated SVG
    match exactly (a `Math.random()`-based version throws a hydration
    mismatch error).

## Config (plan generation)

| Env var | Default | Meaning |
|---|---|---|
| `OPENROUTER_API_KEY` | unset | OpenRouter API key. Unset = every report silently uses the deterministic mock generator — nothing breaks, no error surfaces to the parent. |
| `PLAN_MODEL` | `google/gemini-2.5-flash-lite` | Primary model, OpenRouter slug |
| `PLAN_FALLBACK_MODEL` | `anthropic/claude-haiku-4.5` | Tried only if the primary call fails or returns invalid/banned output |

Get a key at [openrouter.ai](https://openrouter.ai). Treat the model slugs above as a reasonable starting point, not a locked-in choice — OpenRouter's catalog and pricing shift; check current availability before launch.

## Config (design doc §9 — usage limits)

| Env var | Default | Meaning |
|---|---|---|
| `USAGE_LIMIT_PER_ANON` | 3 | Free generations per anonymous device |
| `USAGE_LIMIT_WINDOW_DAYS` | 7 | Rolling window for the above |
| `USAGE_LIMIT_PER_IP` | 12 | Coarser per-IP/day abuse backstop |

## Config (yard image generation)

| Env var | Default | Meaning |
|---|---|---|
| `FAL_KEY` | unset | fal.ai API key. Unset = every report silently uses the SVG fallback (this is the state in this sandbox and in any deploy without the key set) — nothing breaks, no error surfaces to the parent. |

Get a key at [fal.ai](https://fal.ai). Flux Schnell is priced per-image on their site; treat the ~$0.003–$0.005 figure in the design doc as a planning estimate, not a quote — check current pricing before relying on it for a budget.

## Known gaps vs. the design doc

- No PWA manifest/icons yet (design doc §2).
- No bot/abuse protection on intake submit (design doc §9 recommends
  Cloudflare Turnstile or similar).
- Visual design (palette, type) is a first pass, not a final brand pass —
  see design doc §13.
- Image generation (`FAL_KEY`) has not been exercised against a live API
  — see the "Yard visual" note above.
- Plan generation (`OPENROUTER_API_KEY`) has not been exercised against a
  live API either — see the "Plan generation" note above. Both external
  calls have only been verified via their no-key fallback path.
- The plan call and the image call run sequentially, not in parallel —
  see design doc §13 for the worst-case-latency tradeoff this implies.
