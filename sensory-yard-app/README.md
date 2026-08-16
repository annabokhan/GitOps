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
- **Plan generation** (`src/lib/mockGenerate.ts`) — a deterministic
  keyword-matching function standing in for the real LLM gateway call
  (design doc §5.2 / PRD §8). Swap its internals for the actual gateway
  call once a provider is chosen; the API route (`src/app/api/generate`)
  doesn't need to change.
- **Name extraction** (`extractName` in the same file) — a conservative
  regex heuristic standing in for the LLM extraction pass described in
  design doc §10. Try typing "...named Emma..." into any chat answer to
  see it personalize the report title.
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
