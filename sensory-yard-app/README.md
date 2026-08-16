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
  space. Taxonomy is 7 zone types now, not 5 — `connection` (a shared
  spot for two kids, or a kid and a parent, to be at ease together) and
  `critters` (a small-animal corner — chickens, a pond, rabbits — for a
  family ready for real ongoing care) were both added after re-reading
  the mission doc more closely. `critters`, and "bigger-ticket" ideas
  like a tree house within other zones, are explicitly gated in the
  prompt behind a genuine signal in the parent's own words (or the
  "open to a bigger project" suggestion chip on the space prompt,
  `src/lib/prompts.ts`) — the prompt otherwise defaults to ordinary
  DIY-budget ideas, and these are meaningfully bigger commitments than
  that default. A mud kitchen was added to the texture zone's idea pool
  instead of becoming its own zone (`src/lib/zones.ts`). Movement zone
  now explicitly covers a smooth hard-surfaced loop for bikes/scooters/
  trikes, not just climbing/balance equipment, and treats a mentioned
  patio or deck as a ready-made loop worth reusing — a real parent
  anecdote (an unplanned deck that became a bike/scooter track) that
  the prompt was missing entirely before. Its balance/stepping idea
  now specifically suggests tree rounds instead of generic "stepping
  logs," and `whereToShop` guidance (both the prompt and the mock
  catalog) now names Nextdoor alongside Facebook Marketplace/Craigslist
  — Nextdoor in particular for things a neighbor's giving away after
  yard work, tree rounds being the classic example. The movement zone
  also now includes a spinning chair/fabric sensory swing (hung, not
  built) as a full peer to the saucer swing, and a climbing-wall panel
  mounted against a sturdy tree or fence post as a step-up option —
  gated in the prompt to a kid described as daring, fearless, or
  chasing a bigger challenge, not offered by default. The
  structured-output schema lives in `src/lib/planSchema.ts`, the
  banned-term list + programmatic
  second-layer check in `src/lib/bannedTerms.ts`, and the
  provider-agnostic OpenRouter call in `src/lib/llmGateway.ts`. Chain on
  every request: primary model → fallback model → `src/lib/mockGenerate.ts`
  (the original deterministic keyword-matcher, now the last-resort
  fallback — same role the SVG plays for the yard image) if both models
  are unavailable or return invalid/banned output. **Untested against a
  live key**: this sandbox has no `OPENROUTER_API_KEY`; every request
  here falls through to the mock generator, which has been verified end-
  to-end (see below) — the gateway call itself has not.
- **Prompt review pass — "guide, don't restrict."** A full re-read of
  `planPrompt.ts` found several spots that had drifted from calibrating
  examples into forced substitutions: "reach for tree rounds *rather
  than* stepping logs," a fixed list of the same four fruit trees and
  five herbs on every plan, a hard cap of exactly one bigger-ticket
  idea, and a `whereToShop` instruction that cycled the same six stores
  every time. Added an explicit meta-instruction near the top of the
  prompt ("Examples in this prompt are inspiration, not a fixed menu")
  and reworded each of those spots to present its specifics as a
  starting range to draw from, not a checklist — the model is now told
  outright to notice if it's reusing the same idea/plant/store across
  different families and reach for something more specific instead.
  Verified with two hand-simulated sample plans (different zips,
  different handiness answers) that came out with different fruit
  trees, different movement equipment, and different sourcing rather
  than the same fixed set both times.
- **Texture zone widened to cover plant-texture exploration, not just
  dig/mess materials.** The taxonomy line and mock catalog both leaned
  entirely on sand/dirt/mud; a review found that a lot of kids
  (sensory-seeking and not) are just as drawn to wandering through and
  brushing a hand along a variety of plant textures (fuzzy, wooly,
  waxy, papery) as they are to digging. The prompt now names both as
  equally valid ways to fill this zone, and the mock catalog
  (`zones.ts`) gained a "meandering path of contrasting-texture plants"
  idea (lamb's ear, wooly thyme, ornamental grasses) plus matching
  keywords (`wander`, `brush`, `leaves`, `feel`).
- **Business-plan gap review.** A full pass against the design doc/PRD
  citations turned up two real gaps, both fixed: (1) the founder's own
  story explicitly names a kid who'd bolt in an open yard and needed
  real containment, but nothing told the model to act on it — the
  Safety section now instructs treating a defined boundary as a real
  idea when a parent describes an open/unfenced yard together with a
  bolt-risk kid; (2) `kidName` said "return it exactly as given," which
  could carry a surname through if one was typed alongside a first name
  — now explicitly stripped to first-name-only. Also surfaced (and
  resolved by explicit user decision) a tension the design doc flags
  but the prompt never addressed: PRD §7's paid Design Review
  ($1,500–6,000+) needs to stay visibly distinct from the free report,
  previously protected only by the visual being schematic/not-to-scale.
  "Don't undersell it" now has a paired instruction: stay generous and
  specific, but never drift into measured dimensions, installation
  instructions, or material takeoffs — ideas and direction, not a
  ready-to-build professional plan.
- **Banned-term list expanded.** `bannedTerms.ts` originally covered the
  PRD §3 core list (therapeutic, therapy, OT, intervention, SPD,
  autism/autistic, ADHD, special needs, diagnosis/diagnosed). Added
  adjacent clinical/diagnostic-adjacent terms a parent might volunteer
  that weren't covered: therapist, occupational therapist, sensory
  processing (without "disorder"), Asperger's, special education,
  neurodivergent/neurodivergence/neurotypical, "on the spectrum,"
  developmental delay, IEP, 504 plan, stimming/stim. Checked against
  the app's own copy (zone catalog, prompts, chips) for false-positive
  collisions before committing — none found.
- **Regional climate/water awareness** — a review of an actual sample
  plan found the zip code was collected at intake but never sent to the
  model at all. `buildPlanUserMessage` now includes it, with an explicit
  instruction to infer regional climate from it and default to
  drought-tolerant plants/ground covers for an arid zip rather than a
  thirsty lawn. Since this product's real audience is regional, not
  nationwide (PRD §10 — Tri-Valley/East Bay lead-gen, not national
  scaling), a follow-up pass went further for the primary region
  specifically: the prompt now names real, reliable Bay Area / Northern
  California plants outright — pomegranate, fig, persimmon, kumquat/
  Meyer lemon; rosemary, thyme, lavender, sage for sunny spots, with
  mint/chives called out as better suited to shade — instead of relying
  on generic inference there. Everywhere else still falls back to
  general climate inference from the model's own geographic knowledge —
  a known approximation, not a real lookup (design doc §13). The mock
  fallback's static catalog (`zones.ts`) carries the same regional
  plant defaults, since it can't reason per-request at all.
- **The parent's own experience** — same review found it only showed up
  if the calm zone happened to get picked, and even then as a single
  "add a bench" line. The prompt now has a standalone requirement
  (`planPrompt.ts`, "The parent's own experience is not optional") for a
  real, specifically-described adult-seating element in every plan,
  regardless of which zones are chosen.
- **`whereToShop`** — new required field per zone (`types.ts`,
  `planSchema.ts`) with 1–2 sentences of realistic sourcing (real store/
  chain categories, online marketplaces for secondhand). Validated and
  banned-term-checked the same as `description`/`ideas`
  (`generatePlanLLM.ts`); the mock fallback's catalog carries a default
  per zone (`zones.ts`); rendered under each zone card's ideas
  (`ZoneCard.tsx`).
- **Parent's handiness / build willingness** — a real gap: the plan had no
  sense of whether a parent actually wants to build things, would rather
  hire it out, or wants none of that. There's now a 4th chat intake
  question (`src/lib/prompts.ts`, key `handiness`) asking exactly that,
  added to `IntakeAnswers` (`types.ts`) and passed into
  `buildPlanUserMessage`. The prompt (`planPrompt.ts`, "How hands-on this
  parent wants to be") treats this as a separate axis from the existing
  capacity/appetite gating above it — a family can have budget and still
  not want to swing a hammer, or the reverse — and tones every idea down
  to ready-made, minimal-assembly elements (potted plants instead of dug
  beds, a hung swing instead of a built structure) when the parent signals
  neither DIY interest nor willingness to hire, versus leaving bigger
  builds in but reframing them as hire-a-handyman work when they'd rather
  pay someone. The mock fallback approximates the same behavior with a
  keyword heuristic (`wantsLowAssembly` in `mockGenerate.ts`) that swaps
  in a curated `easyIdeas` list per zone (`zones.ts`) — necessarily a
  cruder approximation than the real LLM path, same caveat as the
  regional-climate static defaults above.
- **Multiple kids** — the age quick-fact (`src/lib/ages.ts`'s `parseAges`)
  accepts one age or several comma-separated, since the connection zone
  and the mission doc it's grounded in are explicitly about siblings
  with different needs. The plan prompt has an explicit multi-kid
  instruction (build the connection zone around the actual siblings,
  keep other zones working across the given ages, combine multiple
  volunteered names in the title). Not a repeatable "add another kid"
  UI — kept to a text field to avoid adding an intake step.
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
