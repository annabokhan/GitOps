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

## Config (design doc §9 — usage limits)

| Env var | Default | Meaning |
|---|---|---|
| `USAGE_LIMIT_PER_ANON` | 3 | Free generations per anonymous device |
| `USAGE_LIMIT_WINDOW_DAYS` | 7 | Rolling window for the above |
| `USAGE_LIMIT_PER_IP` | 12 | Coarser per-IP/day abuse backstop |

## Known gaps vs. the design doc

- No PWA manifest/icons yet (design doc §2).
- No bot/abuse protection on intake submit (design doc §9 recommends
  Cloudflare Turnstile or similar).
- Visual design (palette, type) is a first pass, not a final brand pass —
  see design doc §13.
