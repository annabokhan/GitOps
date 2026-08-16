# Sensory Yard — Phase 1 App Design Doc
*Design doc for Phase 1 (business plan Months 2–6ish, pre-land-purchase) — companion to `sensoryappPRD.md` v1.0*

Owner: Product/Design
Status: Draft for build
Source of truth for scope: PRD Section 4 (Phased Scope), Section 10 (Explicitly Out of Scope)

**Revision note (this version):** intake redesigned from multi-select checkboxes to a guided, open-ended chat (typed or spoken) per product direction — open answers give the model more to work with than a fixed tag list. This adds real LLM cost per completed intake, so this revision also adds an anonymous, account-free usage-limit system so free-tier cost stays bounded without building Phase 3's account system early.

---

## 1. What Phase 1 is, in design terms

Per PRD Section 4, Phase 1 is a **free-only pilot**: intake → LLM plan generation (via gateway) → rendered report. No accounts, no payments, no affiliate links, no Design Review booking. The design goal is narrower than it sounds: **prove that a stranger, cold, with no hand-holding, will complete the intake and come back / share it.** Everything below is designed to remove friction from that one loop, not to build out future-phase surface area.

Three things this doc adds on top of the PRD's product requirements:
- A concrete **platform strategy** for "iPhone and Android."
- A **conversational, open-ended intake** in place of a fixed checkbox list, so the plan is grounded in what a parent actually says about their kid, not just which boxes they ticked.
- An **anonymous free-tier usage limit**, since every completed intake now costs a real LLM call and Phase 1 has no accounts or billing to gate that cost behind.
- Screen-by-screen UX specs, a visual system, and the instrumentation needed to actually read Phase 1's demand signal (PRD §4: "signups, completion rate, sharing/referral behavior, repeat visits").

---

## 2. Platform strategy: responsive web, not native

**Decision: one mobile-first responsive web app (PWA-installable), not two native apps.**

Reasoning:
- PRD §1 and §8 both explicitly scope this as "an LLM-powered **web app**." Native iOS/Android apps are never mentioned in the PRD and would add app-store review, two extra codebases, and distribution friction that directly fights Phase 1's actual goal (frictionless demand validation from a cold audience via ads/SEO/social).
- "Both iPhone and Android ideally" is satisfied by a responsive site that works correctly in Mobile Safari and Chrome on Android — most Phase 1 traffic will arrive from a Facebook/Instagram ad or a text link, which opens an in-app or mobile browser, not an App Store listing. A native app would actively lose that traffic (install friction = lost lead).
- Making it a **PWA** (web app manifest + service worker for the static shell) gets "feels like an app" behavior — add-to-home-screen, splash screen, offline-safe report re-viewing — without native builds. This is the right amount of "app-ness" for Phase 1.

If Phase 2+ demand data justifies it, native wrapping (Capacitor/Expo over the same web UI) is a Phase 3+ conversation — out of scope here, and not a decision this doc needs to make now.

**Design implication:** every screen in this doc is specified mobile-first (375×812 iPhone SE/12-mini baseline, tested up to 430×932 iPhone Pro Max and common Android widths 360–412px), then progressively enhanced for tablet/desktop, since the intake is what parents will do standing in their actual backyard.

---

## 3. Information architecture

```
/                     Landing (hero + short origin story + intake CTA)
/intake               Conversational intake (chat, typed or spoken)
/generating            Transient loading state (LLM call in flight)
/report/:id            Rendered sensory plan (shareable link)
/about                 Full origin story + research link + "notify me" signup
/research               Research summary/appendix (linked from About + report)
/privacy                Privacy policy (COPPA-compliant, camp-bridge clause pre-written for Phase 3)
```

No nav bar with app sections in Phase 1 — there are no accounts, no saved plans, nothing to navigate *to*. The header is a lightweight logo + "About" link only. This is deliberate: a multi-item nav implies more app than exists yet and adds decision fatigue right before the intake CTA.

`/limit-reached` is not a route — it's a state rendered in place of `/generating`/`/report` when the server-side usage check fails (§9). A dedicated URL isn't needed since it's never something to link to or share.

---

## 4. Primary user flow

```
Landing → Intake (chat, ~5 prompts) → [usage check] → Generating (5–20s) → Report → {Share, Start over, About}
                                            │                                  │
                                            ▼                                  └→ "Notify me about the future shared space"
                                     Limit reached                                (email capture, §2)
                                     → view last report,
                                       come back on {date}
```

Single golden path, with one branch: a server-side usage check runs the instant the parent finishes the chat, before any LLM generation call fires. Everyone still completing the chat under the limit never sees that branch at all. No login gate anywhere in this flow — PRD §11 confirms Phase 1 has zero blocking decisions and no accounts, and the usage limit is designed to preserve that (§9).

---

## 5. Screen-by-screen specs

### 5.1 Landing (`/`)

```
┌─────────────────────────────┐
│  [logo]              About  │  ← sticky, transparent-to-solid on scroll
│                              │
│   A backyard your kid        │  ← H1, plain-language, no jargon
│   can actually settle in.    │
│                              │
│   "Built by a mom who        │  ← hero line, PRD §2
│    needed this too."         │
│                              │
│   [short origin story,       │  ← PRD §2 landing short version
│    3–4 sentences]             │
│   Read our full story →      │  ← links to /about
│                              │
│   ┌─────────────────────┐   │
│   │  Get my free plan → │   │  ← primary CTA, full-width on mobile
│   └─────────────────────┘   │
│                              │
│   [3 short trust bullets:    │
│    free · 5 min · no signup] │
└─────────────────────────────┘
```

- Primary CTA is the only button above the fold on mobile. It scrolls straight into the intake — no marketing scroll-jacking required to convert.
- "No signup" is said explicitly, because PRD Phase 1 has no accounts and parents assume otherwise; naming it removes a real objection.
- Sticky CTA reappears as a bottom-anchored bar once the user scrolls past the hero (common mobile pattern, keeps conversion path always one tap away).

### 5.2 Conversational intake (`/intake`)

**Design change from the prior version of this doc:** the fixed multi-select checklist is replaced with a **guided chat** — a short, scripted sequence of open-ended prompts from "the app," each answered by the parent in their own words, typed or spoken. This is the user-requested change: open answers about a specific kid ("climbs anything he can reach, completely melts down at birthday parties, will not touch grass barefoot") give the generation prompt far more to work with than a handful of matched tags, and read as understanding a specific kid rather than sorting them into buckets.

**Scripted prompts, not a live LLM conversation.** The assistant side of the chat is a fixed sequence of prompts (not dynamically generated per turn by an LLM) — this keeps the intake itself free of per-message model cost and keeps timing predictable. Only one LLM call happens per completed intake: a single structured-output request that reads the parent's raw free text directly and returns the chosen zones with a personalized description and idea list for each, plus a volunteered first name if one was given. An earlier draft of this doc described a separate "extraction pass" ahead of generation — implementation simplified that to one call once it became clear the same structured-output request could do both jobs at once, which is also cheaper and faster than two round-trips. Counts as a single "generation" against the usage limit in §9 either way.

**Zone taxonomy — a correction, not a citation.** Earlier drafts of this doc cited "source-spec §4.1" as the origin of the zone taxonomy (movement, texture, calm, taste-smell, visual). That citation was never actually backed by the source spec's text — this app never had it, only the PRD's references to it — and the taxonomy was really authored during this build. On review against the PRD's actual mission section (§2), it was missing something the founder's own story names directly: a shared spot for two different kids to be at ease together (the saucer-swing scene), which is now its own zone, **connection**; a follow-up review added a seventh, **critters** (a small-animal corner — chickens, a small pond, rabbits — for a family ready to take on the ongoing care), explicitly gated in the prompt behind a genuine signal of interest and willingness to invest, since it's a meaningfully bigger commitment than every other zone and the prompt otherwise defaults to ordinary DIY-budget ideas. Plans choose 3–5 zones from seven now. Two other requests from that same review didn't need a new zone: a mud kitchen was folded into the existing texture zone's idea pool (it's fundamentally a tactile/mess activity), and a tree house became an example of a "bigger-ticket idea" any of movement/calm/connection can offer — gated the same way as critters, via an explicit signal in the parent's own words (also reachable from a suggestion chip on the space prompt in §5.2: "open to a bigger project"), not offered by default. If a real source-spec document exists with a different taxonomy, that should win over this one — this was always a stand-in. A later addition, from a real parent anecdote (an unplanned deck that became a hit as a bike/scooter track): the movement zone's taxonomy line and idea pool now explicitly cover a smooth, hard-surfaced loop for wheeled play, not just climbing/balance equipment, and the "what's already there" instruction (below) now treats a mentioned patio or deck as a ready-made loop to suggest reusing, not just a place for furniture. A purpose-built version (a new deck or paved loop, rather than reusing an existing surface) is gated behind the same capacity signal as a tree house. The movement zone's idea pool also now includes a spinning chair/fabric sensory swing (a hung item, on the same footing as the saucer swing) and, for a kid described as daring or fearless, a climbing-wall panel mounted against a sturdy tree or fence post — gated to that description, not offered by default for a cautious or younger kid.

**Multiple kids.** Until this review, the intake only captured one child's age (a single-number field) and none of the chat prompts invited mentioning a sibling — a real gap, since the mission doc's own founding story and the connection zone it inspired are explicitly about two kids with different needs sharing one yard. Fixed without adding an intake step: the age field (§5.2) now accepts comma-separated ages, its copy invites more than one, and the first open-text prompt explicitly invites describing each kid. The plan-generation prompt has an explicit multi-kid instruction: build the connection zone around the actual siblings described, keep other zones working across the given age range (or split kid-specific needs across zones rather than picking one kid and ignoring the rest), and combine multiple volunteered names naturally in the report title (e.g. "Andy & Evan's Sensory Yard Plan").

**Parent's handiness / build willingness — a fourth open prompt, deliberately added as a step this time.** Unlike the signals above, this one wasn't safely inferable from an existing prompt's free text, so it gets its own chat step: "how hands-on do you want to be — comfortable building things yourself, would rather hire someone for bigger projects, or want to keep it mostly ready-made?" This is a distinct axis from the existing capacity/appetite gating (§5.2 above, "bigger-ticket idea") — a family can have the budget and appetite for a big project but no interest in doing the labor themselves, or the reverse. The plan prompt now tailors every idea's construction complexity to the answer: real DIY builds (assembling from landscaping timbers, mounting a climbing wall, a tree-round path) for a parent who says they like building; the same bigger ideas reframed as "a handyman/contractor can install this" rather than assumed DIY labor for a parent who'd rather hire it out; and, when a parent signals neither, the entire plan tones down to ready-made, minimal-assembly elements only — potted plants instead of dug beds, a store-bought swing hung from an existing branch instead of a built structure, stepping stones simply placed instead of a built path. The mock fallback approximates this with a keyword heuristic and a curated `easyIdeas` list per zone — a cruder approximation than the real LLM path can do, same caveat as the regional-climate defaults in the next section.

**Implemented, not just specified** (PRD §8): the real system prompt lives in `lib/planPrompt.ts` and opens with the founder's mission (regulation, curiosity, connection, rest) before the mechanical requirements — a first pass that skipped straight to taxonomy/schema/safety came out generic, never used the age field, never considered the parent's own experience of the space, and never asked the model to work with what's already in the yard or its size/light. All of that is now explicit prompt instruction, not just implied by the taxonomy. Also includes: output JSON shape, the full §3 banned-term list (`lib/bannedTerms.ts`, shared with the programmatic second-layer check on the model's output), tone guidance, and safety constraints. `lib/llmGateway.ts` is the provider-agnostic OpenRouter call; `lib/generatePlanLLM.ts` is the orchestrator: primary model → fallback model → the original deterministic keyword-matching generator (`lib/mockGenerate.ts`) as a last resort if both the gateway call and app-layer schema/banned-term validation fail. A report is never blocked or failed by this call. Not yet tested against a live key in this build environment — see the app README.

**Three gaps found reviewing an actual sample plan, all fixed.** (1) The zip code was collected at intake but never sent to the model at all — `buildPlanUserMessage` now includes it, with an explicit instruction to reason about regional climate and default to drought-tolerant plants and low-water ground covers for an arid zip code rather than a thirsty lawn, since water cost is a real recurring expense many families weigh (this leans on the model's own geographic knowledge, not a real climate-zone lookup — a known approximation, flagged as an open item in §13). (2) The parent's own experience — the mission doc's "I could finally sit down" line — only ever showed up if the calm zone happened to be selected, and even then as a single generic "add a bench" idea; the prompt now has a standalone requirement that every plan include one specific, considered adult-seating element regardless of which zones get chosen, described with the same specificity as a kid element (material, comfort, sightline), not a throwaway line. (3) The report gave ideas with no sense of where to actually get any of it — added a `whereToShop` field to the zone schema/type (`types.ts`, `planSchema.ts`) with 1–2 sentences of realistic sourcing per zone (real store/chain categories, plus online marketplaces for secondhand), required end-to-end: the prompt asks for it, `generatePlanLLM.ts` validates and banned-term-checks it, the mock fallback's catalog (`zones.ts`) carries a default for every zone, and `ZoneCard.tsx` renders it under each zone's ideas. Also pushed the general idea-count guidance from "3 is fine" to "4–5 where the zone supports it" — the original bare-minimum framing read as thin even when technically complete.

**A full end-to-end prompt review, twice.** First pass: on user direction to "guide, not restrict," several spots in `planPrompt.ts` had drifted from calibrating examples into forced substitutions — "reach for tree rounds *rather than* stepping logs," the same four fruit trees and five herbs as the only regional defaults, a hard cap of exactly one bigger-ticket idea, and a `whereToShop` instruction that cycled the same six stores every time. Added an explicit meta-instruction ("Examples in this prompt are inspiration, not a fixed menu") and reworded each spot to present its specifics as a starting range, not a checklist — verified with two hand-simulated sample plans (different zips, different handiness answers) that came out with genuinely different plants, equipment, and sourcing rather than the same fixed set both times. Same pass widened the texture zone: it had leaned entirely on sand/dirt/mud, missing that plenty of kids (sensory-seeking and not) are just as drawn to wandering through and brushing a hand along varied plant textures — the taxonomy line and mock catalog (`zones.ts`) now name both as equally valid.

Second pass: a direct audit against this doc's own PRD citations, checking for gaps rather than tone. Found two real ones, both fixed: (1) the founder's own story (top of the prompt) names a kid who'd bolt in an open yard and needed real containment, but nothing told the model to act on that when a parent describes a similar situation — the Safety section now does. (2) `kidName`'s instruction to "return it exactly as given" could carry a surname through if a parent typed a full name — now explicitly stripped to first-name-only. The audit also surfaced a tension this doc already names but the prompt never addressed: §5.4 protects the paid Design Review ($1,500–6,000+, PRD §7) from looking like the free report only via the visual being schematic/not-to-scale — nothing protected the *plan text* itself, and "Don't undersell it" pushes toward richness that could drift the other way. Put to the user directly rather than resolved unilaterally, since it cuts against their own prior "make it more generous" feedback; their call was to keep the generosity and add a light guardrail — "ideas and direction, not measured dimensions, installation instructions, or material takeoffs" — rather than leave it unaddressed.

**Banned-term list expanded** (`lib/bannedTerms.ts`) past the PRD §3 core list to cover adjacent terms a parent might volunteer that weren't caught before: therapist, occupational therapist, sensory processing (without "disorder"), Asperger's, special education, neurodivergent/neurodivergence/neurotypical, "on the spectrum," developmental delay, IEP, 504 plan, stimming/stim. Checked against the app's own copy for false-positive collisions before committing.

```
┌─────────────────────────────┐
│  ← Back            ● ○ ○ ○  │  ← progress dots track prompts, not fields
│                              │
│  🌱 Tell us what your kid's   │  ← assistant bubble, scripted prompt
│     into outdoors — what do   │
│     they gravitate toward?    │
│                              │
│  "e.g. climbs everything,     │  ← greyed placeholder/example text,
│   loves digging in the dirt,  │     mitigates the "blank page" problem
│   can't sit still"            │
│                              │
│  ┌─────────────────────────┐│
│  │ (type here, or tap 🎤)   ││  ← free-text box; mic = native OS
│  └─────────────────────────┘│     dictation, not custom speech code
│                              │
│  [seeks movement] [textures]  │  ← optional tap-to-insert suggestion
│  [cautious] [+ more]           │    chips — speed of checkboxes,
│                              │     richness of free text
│  ┌─────────────────────┐    │
│  │       Next →         │    │  ← enabled once a minimum-length
│  └─────────────────────┘    │     answer is present
└─────────────────────────────┘
```

**Prompt sequence** (6 total; each is its own screen, same chat-thread pattern):
1. *Quick facts* — child's age(s) (no floor, PRD §5 — a plain text field accepting one age or several comma-separated, per the multi-kid note below) and zip code. Kept as plain, fast fields, not chat — these are unambiguous facts with no benefit from open-endedness, and the app needs a valid zip/age to function (regional lead-gen, farm age-band routing per PRD §5). Numeric keyboards (`inputmode="numeric"`) on both, though the age field can't be a native `type="number"` input once it needs to hold a comma-separated list.
2. *What they gravitate toward outdoors* — open text/voice.
3. *What's hard for them, or what you find yourselves avoiding* — open text/voice.
4. *Your outdoor space* — size, sun/shade, what's already out there — open text/voice.
5. *How hands-on you want to be* — DIY vs. hire it out vs. ready-made, per the handiness note above — open text/voice.
6. *Review* — the parent's own words played back verbatim under each prompt, with per-answer "Edit," before the usage check + LLM calls fire. Since generation now has a real cost and counts against the limit, a parent should be able to fix a typo without burning a generation.

- Every free-text step carries: a placeholder example (blank-page mitigation), optional tap-to-insert suggestion chips sourced from the same source-spec §3.1 tag vocabulary (fast path for a parent who'd rather tap than type, without forcing everyone back into checkbox mode), and a soft minimum-length nudge ("say a bit more so we can plan well" ) rather than a hard character-count gate.
- **Voice input is native OS dictation**, not a custom speech-to-text integration. Both the standard iOS Safari and Android Chrome on-screen keyboards already expose a microphone key on any text input/textarea with no extra code — reliable on both platforms today. A custom `SpeechRecognition` (Web Speech API) implementation is explicitly **not** used for v1: it is well-supported on Android Chrome but unreliable/unsupported on iOS Safari, which would silently break "speaking" on one of the two required platforms. Revisit only if native dictation proves insufficient after Phase 1 data.
- Copy nudges the parent away from PII without hard-blocking it: prompt copy and placeholders talk about behavior ("what they love," "what's hard"), never ask for or invite a name or diagnosis. See §10 for what happens if one is typed anyway.
- Back button always available; all answers persist in local component state (no backend draft — no accounts yet), so back/forward never loses text already typed.

### 5.3 Generating (`/generating`)

```
┌─────────────────────────────┐
│                              │
│      [gentle animation —     │
│       e.g. growing plant     │
│       or drifting leaves]    │
│                              │
│   Designing {kid}'s spot...  │
│                              │
│   "Every yard is different — │
│    we're matching zones to   │
│    what you told us."        │
│                              │
└─────────────────────────────┘
```

- This screen only ever renders after the usage check in §9 passes — a blocked request goes straight to §5.3b instead, so a parent never watches a loading animation for a request that was going to be refused.
- PRD §8 requires gateway fallback-on-error rather than surfacing failure mid-intake — this screen is the one place that resilience becomes visible to the user. If the primary model errors, the fallback model fires transparently and the parent never sees an error state in the common case.
- If total latency exceeds ~8s, rotate 2–3 short reassurance strings (avoids the screen feeling frozen) rather than a raw spinner.
- Hard timeout ceiling (e.g., 30s): if even the fallback fails, show a plain apology + "Try again" — never a raw error code or stack trace, per the same non-clinical, non-technical tone bar as the rest of the app. A failed generation (both primary and fallback exhausted) does **not** count against the usage limit — see §9.

### 5.3b Limit reached

Rendered in place of §5.3/§5.4 when the server-side usage check (§9) fails. Framed as a capacity message, never as an upsell — Phase 1 has no paid tier to upsell to (PRD §10), so this screen must never read like a paywall.

```
┌─────────────────────────────┐
│                              │
│   You've used your free      │
│   plans for now.              │
│                              │
│   Come back on {reset date}   │
│   for another one. Your last  │
│   plan is always here in the  │
│   meantime.                    │
│                              │
│  ┌─────────────────────┐    │
│  │  View my last plan → │    │  ← only shown if a report exists
│  └─────────────────────┘    │     this window (§9)
│                              │
│  Read our story · About       │
└─────────────────────────────┘
```

- `{reset date}` is computed from the rolling-window logic in §9 and stated in plain terms ("come back on Tuesday"), not as a countdown timer or "X requests remaining" — this isn't a rate-limit dashboard, it's one plain sentence.
- Always offers a path back to the parent's own most recent report if one exists in the current window (via the stable `/report/:id` link, recoverable from local storage) — hitting the limit should never feel like the app forgot what it already gave them.
- Deliberately does **not** carry a "notify me when paid plans launch" pitch in this version — see §11 open decision. Only the existing, already-approved "notify me about the future shared space" surfaces stay (About page), not a new monetization-flavored one bolted onto this screen.

### 5.4 Report (`/report/:id`)

This is the deliverable the parent actually came for, and the thing most likely to get screenshotted/shared, so it's the highest design-effort screen.

```
┌─────────────────────────────┐
│  {kid}'s Sensory Yard Plan   │
│                              │
│  ┌────────────────────────┐ │
│  │ ┌────┐ house ┌────┐    │ │  ← hand-drawn-style sketch:
│  │ │ 🏃 1 │      │ 🤚 2 │    │ │     wobbly zone shapes + numbered
│  │ └────┘       └────┘    │ │     badges inside a dashed yard
│  │      ┌────────┐        │ │     boundary — the lead visual,
│  │      │  🌤️ 3   │        │ │     not the cards below
│  │      └────────┘        │ │
│  │  "rough layout, not     │ │
│  │   to scale"             │ │
│  └────────────────────────┘ │
│                              │
│  ┌────────────────────────┐ │
│  │ ① 🏃 Movement Zone        │ │  ← one card per zone, numbered to
│  │  Balance beam, tunnel... │ │     match its shape in the sketch
│  └────────────────────────┘ │     above (taxonomy in §5.2)
│  ┌────────────────────────┐ │
│  │ ② 🤚 Texture Zone         │ │
│  │  Mint, chives, sand...   │ │
│  └────────────────────────┘ │
│  ┌────────────────────────┐ │
│  │ ③ 🌤️ Calm Corner          │ │
│  │  ...                     │ │
│  └────────────────────────┘ │
│                              │
│  ┌─────────────────────┐    │
│  │   Share this plan     │   │  ← native share sheet (Web Share API)
│  └─────────────────────┘    │
│  Download as PDF              │
│                              │
│  ─────────────────────────   │
│  Want to hear about our      │
│  future shared outdoor       │
│  space for kids like yours?  │
│  [email field] [Notify me]   │  ← PRD §2, distinct opt-in list
└─────────────────────────────┘
```

- **The report leads with an illustrated sketch, not text.** A hand-drawn-style scene, not a diagram of rounded rectangles: a wobbly fence-line yard boundary with posts, a peaked-roof house for orientation, a path leading in, light grass texture, and one organic garden-bed-shaped zone per result, each with small doodles matched to what that zone actually is — a tree and bench for the Calm Corner, scattered pebbles for Texture, flowers for the Watching & Wondering zone, sprout rows for Taste & Smell, motion lines for Movement — numbered to match the detail card below it. This is the primary deliverable now; the cards underneath are the reference detail, not a duplicate of the same information.
- **AI-generated image, cheap tier, with a deterministic SVG fallback.** Revised from an earlier draft of this doc, which rejected image generation outright on cost grounds. Real pricing research changed that: quality-tier image models (e.g. OpenAI's GPT Image) run ~$0.02–$0.25/image and were a fair objection, but the cheap open-weight tier (Flux Schnell, SDXL-class, via aggregators like fal.ai) runs **~$0.003–$0.005/image** — close to negligible even at real pilot volume, and not meaningfully different from accepting the plan-generation call's own cost. The reliability objection (image models are bad at accurate spatial layout and legible labels) still stands, so the design routes around it rather than ignoring it: the prompt explicitly forbids any text/labels in the image, and the numbered zone cards below stay the one accurate legend regardless of what the image shows. Generation is best-effort — implemented in `lib/imageGen.ts`, called from `/api/generate` — with a ~20s timeout; any failure (no API key, timeout, bad response) is silent to the parent and falls back to the original hand-drawn-style SVG sketch (`YardSketch`, unchanged), which a `YardVisual` wrapper also re-triggers client-side via `onError` if a returned image URL fails to load. A missing/failed image never blocks the report and never changes usage-limit accounting (§9) — the parent always gets a complete plan.
- **The image prompt is detailed, not just zone outlines.** Each zone's actual idea list (e.g. "balance beam, crawl tunnel, platform swing, low log pile" for Movement, not just "movement zone") is enumerated in the prompt (`lib/imagePrompt.ts`) along with its rough position in the yard, specifically so the image shows a concrete plan rather than abstract labeled patches — the SVG fallback, by contrast, stays intentionally schematic (§ below).
- **Deliberately schematic, not to-scale — true of both the SVG and the AI image.** Zone layout (SVG grid, or the position phrases fed to the image prompt) is packed/described by zone count alone — Phase 1's free-text intake (§5.2) never collects real yard dimensions, a photo, or an address, so neither path has anything to draw a measured plan from. Both carry a caption saying so ("a rough layout, not to scale" / "an artist's impression, not to scale"). This distinction matters for the business, not just honesty: it keeps the free visual from reading as the same deliverable as the paid custom design package (PRD §7, $1,500–6,000+), which would be based on an actual site visit or measurements. If a future phase adds real dimensions or a yard photo as intake, the layout/prompt logic is what changes — the zone data contract (§4.2) doesn't.
- Zone cards match the taxonomy (§5.2 — seven ids now, not five) and the plan-generation JSON output 1:1 — each JSON zone object renders as one card, so the frontend is a thin, dumb renderer over the schema. Switching intake formats, and later switching from mocked to real generation, never changed this data contract. Each card also renders a "Where to find it" line (the `whereToShop` field) below its ideas — practical sourcing, not just a wishlist.
- Copy on every card is passed through the Section 3 banned-term filter *again* at render time (belt-and-suspenders on top of the backend's programmatic check in PRD §8) — if a banned term ever slipped through generation (now more possible with free-text input feeding the prompt — see §10), it should never reach a rendered screen a parent might screenshot and post.
- **Share is a first-class action**, not an afterthought: PRD §4 names "sharing/referral behavior" as one of the exact signals Phase 1 exists to measure. Use `navigator.share()` where available (iOS Safari and Android Chrome both support it) so sharing goes straight to Messages/WhatsApp/Instagram — the actual channels parents use — rather than a generic "copy link" box.
- Report has a stable, shareable URL (`/report/:id`) so a shared link opens straight to the plan with zero login — critical since Phase 1 has no accounts to gate it behind.
- PDF export: PRD §7 lists PDF export as a **Pro-tier (Phase 3) benefit**, so Phase 1's "Download as PDF" must be a plain client-side print-to-PDF (browser print stylesheet) — free and universal on both platforms — not a backend PDF service. That distinction matters so Phase 1 doesn't accidentally build paid-tier infrastructure early (PRD §10).
- The "notify me about the future shared space" block (PRD §2) sits below the plan itself, not above it — it's a soft ask after value has been delivered, not a gate in front of it, and it must post to a distinct list from any general marketing capture per PRD §2's explicit requirement.
- No affiliate links, no product photos with buy buttons, no "book a call" CTA anywhere on this screen — PRD §10 is explicit that Phase 1 ships zero monetization surface, so the report's only CTAs are share, PDF, and the email capture.
- Title personalization: if a first name was volunteered in the chat, use it in the report title ("Emma's Sensory Yard Plan") — confirmed not to be treated as PII for this product; see §10.

### 5.5 About (`/about`)

Long-form page: PRD §2 full origin story verbatim, "See our research page →" link to `/research`, and the same "notify me about the future shared space" email capture repeated here (PRD §2 says it should be available from Phase 1 onward, not just post-report).

### 5.6 Empty/error states

- **Intake abandoned mid-flow**: no punishment UI — just a normal landing page if they return later. No accounts means no "resume your draft" mechanic in Phase 1; don't build one.
- **Generation failure after fallback exhausted**: plain apology, "Try again" button that re-submits the same chat answers (already held in local state) without forcing re-entry of the whole conversation, and without consuming another slot of the usage limit (§9).
- **Empty/very short chat answer**: soft nudge ("say a bit more so we can plan well"), never a hard block — a one-word answer should still be submittable if a parent insists, since refusing to proceed at all is worse for completion rate than a slightly thinner plan.
- **Invalid zip / unsupported input**: inline validation, plain language ("that doesn't look like a zip code"), never a red border with no explanation.
- **Limit reached**: see §5.3b — not an error state, a plain capacity message.

---

## 6. Visual design system

Tone target: **calm, natural, unmistakably not clinical.** This is a direct extension of PRD §3's language policy into visual design — a form that *looks* like a medical intake would undercut the copy work even if every banned word is scrubbed. This now extends to the chat UI too: bubble styling should read as a warm, simple conversation (closer to a text thread with a friend than a customer-support widget or a clinical intake wizard).

- **Palette**: warm neutrals (sand, bark, sage) as the base, with one saturated accent (e.g., a leaf green or marigold) reserved for primary CTAs only, so the one button that matters is never competing with itself. Avoid clinical whites/blues and avoid saturated "kids app" primaries (reads as childish edutainment, not a tool for the parent).
- **Typography**: one humanist sans-serif for everything (headings and body), generous line-height, minimum 16px body text on mobile (prevents iOS Safari's auto-zoom-on-focus behavior in form fields, which is a real, easy-to-miss bug class — see §7).
- **Imagery**: photography/illustration of textures, plants, and outdoor play — never stock photos of clinical settings, therapy rooms, or equipment catalogs. Consistent with PRD §3's ban extending beyond copy into visual register.
- **Iconography**: simple line icons per zone type (movement, texture, calm, taste/smell, visual), reused consistently between the intake's suggestion chips and the report's zone cards, so a parent's answers visually map to what they get back.
- **Motion**: minimal, soft (ease-out, ~200–300ms), used only on the generating-screen animation, chat-bubble entrance, and step transitions — never decorative motion that delays the primary CTA from being tappable.

---

## 7. iOS vs. Android implementation notes

The two platforms are one codebase, but a handful of behaviors need explicit handling so "responsive web" doesn't mean "broken on one of the two":

| Concern | iOS Safari | Android Chrome | Design/build requirement |
|---|---|---|---|
| Input zoom | Auto-zooms on focus if input font-size < 16px | No auto-zoom | Set all form/chat inputs to ≥16px |
| Voice input | Mic key on system keyboard (dictation); `SpeechRecognition` API unreliable/unsupported | Mic key on system keyboard; `SpeechRecognition` API well supported | Rely on the system-keyboard mic on both — see §5.2 — don't build a custom speech API integration that only works on one platform |
| Safe areas | Notch/home-indicator insets | Gesture-nav inset (varies by OEM) | Use `env(safe-area-inset-*)` in CSS on the sticky header/chat-input bar, not fixed padding |
| Back navigation | Swipe-back gesture / browser back | Hardware/gesture back button always present | Every chat step must respond correctly to the browser back button (step state in URL/history, not only in-memory) so Android back doesn't exit the flow entirely |
| Add to Home Screen | Manual ("Share → Add to Home Screen"), no install prompt | Native install prompt (`beforeinstallprompt`) available | Provide manifest.json + icons for both; don't rely on Android's auto-prompt as the only install path since iOS never gets one |
| Native share | `navigator.share()` supported (iOS 12.2+) | `navigator.share()` supported (Chrome 89+) | Use it on both; fall back to a copy-link button only on unsupported desktop browsers |
| Viewport height | `100vh` includes/excludes browser chrome inconsistently as it hides on scroll | Similar but different chrome behavior | Use `100dvh` (dynamic viewport height) for full-bleed screens like Generating and the chat thread, with a `100vh` fallback |
| Anon usage identity | ITP can clear localStorage more aggressively than a first-party cookie | localStorage generally persistent | Store the anon ID (§9) in both localStorage and a long-lived cookie so one platform's storage quirks don't reset a parent's usage window for free |

---

## 8. Component inventory (for build handoff)

`Header` (logo + About link, sticky) · `HeroCTA` · `OriginStorySnippet` · `ChatThread` · `ChatBubble` (assistant/parent variants) · `ChatTextInput` (with native-dictation affordance, no custom speech code) · `SuggestionChips` (tap-to-insert, sourced from source-spec §3.1 tags) · `QuickFactField` (age, zip — plain inputs, not chat) · `ReviewSummary` (verbatim playback of chat answers, per-answer Edit) · `PrimaryButton` (full-width mobile, disabled state) · `GeneratingAnimation` · `LimitReachedState` (§5.3b) · `YardVisual` (§5.4 — picks AI image vs. `YardSketch` SVG fallback, with client-side `onError` re-fallback) · `YardSketch` (hand-drawn-style SVG layout, the fallback path) · `ZoneCard` (numbered to match its shape in the sketch/image) · `ShareButton` (Web Share API + clipboard fallback) · `EmailCapture` (parameterized by list name — "future shared space" vs. general, per PRD §2) · `ErrorState` (plain-language, retry action, never consumes a usage slot) · `FooterLinks` (Privacy, Research, About)

All components must render correctly with **no JS-driven layout past first paint** where feasible — this is a lead-gen funnel served largely from ad clicks on mobile data connections, so time-to-interactive on the intake CTA is a conversion-rate variable, not just a performance nice-to-have.

---

## 9. Free-tier usage limits (cost control)

Open-ended chat intake means every completed conversation drives at least one extraction call and one generation call through the LLM gateway (PRD §8) — real, variable cost per completed intake, unlike a static checkbox form. Phase 1 has no accounts and no payment infrastructure (PRD §10), so this can't be a paid-tier gate — it has to be a lightweight, anonymous, cost-control guardrail that works without knowing who anyone is.

**Identity without accounts.** On first visit, the client generates a random anonymous ID (`anon_id`, e.g. a UUIDv4) and stores it in both localStorage and a long-lived first-party cookie (redundant across the two, per the iOS ITP note in §7). It's sent with the intake submission. This is **not** an account — it identifies a browser/device, not a person, is never tied to an email unless the parent separately submits one via the existing email-capture components, and disappears if the parent clears storage — that's an accepted, low-stakes gap for Phase 1 (see below).

**Enforcement is server-side, never client-trusted.** The client's `anon_id` is only a lookup key. The server keeps the actual usage count (e.g., a small Redis or Postgres table keyed by `anon_id` and timestamp) and is the sole source of truth on whether a request is allowed. A client that fabricates or omits an `anon_id` should be treated as its own anonymous bucket, not waved through.

**Two-tier limit:**
- **Per-`anon_id` limit** — the primary, user-facing limit. Suggested starting point: **3 completed generations per rolling 7 days** — a placeholder number, explicitly flagged in §11 as needing a real figure from whoever owns the LLM budget once Phase 0/1 per-generation cost is known.
- **Per-IP backstop** — a coarser, higher secondary cap (e.g., 10–15/day) so clearing browser storage isn't a trivial way to get unlimited generations. Set loose enough that it practically never fires for a genuine multi-device household, but catches scripted abuse.
- Both limit count and window length are **config, not code** (mirrors PRD §8's "model selection as configuration" requirement) — tunable without a deploy once real pilot cost data comes in.
- **Rolling window, not a fixed calendar reset** — fairer to individual users, and avoids every user's limit resetting at the same moment (which would otherwise create a synchronized cost spike right at the reset boundary).

**What counts against the limit:**
- A generation only counts once it **succeeds** and a report is produced. A failed generation (primary and fallback both exhausted, §5.3) does not count — don't charge a parent's limit for the app's own reliability problem.
- Editing chat answers before submitting (§5.2 review step) is free — no LLM call has happened yet.
- The plan-generation call counts as **one** unit against the limit, whether it succeeds on the primary model, the fallback model, or falls all the way back to the deterministic generator (§5.2) — the parent only experiences "I made one plan," and a rough fallback plan still counts the same as a personalized one (it's still a complete, usable report).

**Enforcement point:** the usage check runs the instant the chat is submitted from the review screen, before the extraction/generation calls fire and before `/generating` renders (§5.3) — cheap check, avoids showing a loading animation for a request about to be refused.

**Messaging:** plain and friendly, never framed as an upgrade prompt (§5.3b) — there is no paid tier in Phase 1 to point to, so "you've reached your limit" must never imply "pay to skip it." State the reset date in plain language, always offer the parent's own last report as a fallback.

**Bot/abuse protection:** an invisible, non-interactive bot-check (e.g., Cloudflare Turnstile) on the chat-submit action is recommended, since a free-text intake with a usage cap is still a plausible target for scripted abuse aimed at exhausting the LLM budget faster than genuine traffic would. This is a build-time tool choice, not a design constraint — flagged in §11.

**Accepted limitation for Phase 1:** a parent can reset their own limit by clearing browser storage or switching devices/browsers. This is a known, deliberately accepted gap — closing it properly requires an identity layer (accounts, Phase 3, or phone/email verification), which is exactly the infrastructure Phase 1 is designed to avoid building early (PRD §10). The IP backstop keeps this from being *free* to abuse at scale; it doesn't need to be airtight for a free pilot.

---

## 10. Privacy implications of open-ended input

Free text is fundamentally less controllable than checkboxes: a parent can type anything, including things the intake was never designed to collect. Two concrete risks this design has to account for, both stemming directly from PRD §5's existing rules ("no diagnosis field," "no child's real name") and §3's language policy:

- **Volunteered diagnoses.** A parent may type "he's autistic" or similar into an open prompt even though nothing asks for it. The app must not reject or flag this to the parent (that would be worse than the problem — it would make the tool feel clinical/judgmental, exactly what PRD §3 is designed to avoid), but the **plan-generation prompt** (`lib/planPrompt.ts`, §5.2) is explicitly instructed to translate any such volunteered clinical language into the existing behavioral vocabulary (e.g., a mention of a diagnosis alongside "meltdowns in crowds" becomes a crowd-tolerance description, not a repeated diagnostic label) and never let a diagnostic term pass through into its output — enforced twice: once as a prompt instruction, once as the programmatic banned-term check (`lib/bannedTerms.ts`) that discards and retries on any model output containing one, per PRD §8's "second layer" requirement.
- **Volunteered real names.** A parent may type their kid's name into a free-text answer ("Emma loves..."). Recommend anything persisted or logged beyond the report itself (e.g., the Phase 0–1 plan-quality review tooling PRD §8 calls for) strip likely proper names — the implemented logging (`generatePlanLLM.ts`) only logs model/latency/success, never response content, so this is satisfied by omission rather than an active strip step. The report's own use of a volunteered name is a separate, decided question — see below.

**Decided:** the rendered report may use a first name if one was volunteered in the chat (e.g., "Emma's Sensory Yard Plan") — confirmed a first name alone is not treated as PII for this product. Still handled as ephemeral, display-only personalization: rendered on that one report, never written to a structured profile field, analytics event, or marketing list, and never required — a plan with no name volunteered just uses "your kid's plan." PRD §5's "no child's real name" rule is about the app not *soliciting* a name as an intake field, which this preserves; it doesn't forbid using one a parent offers unprompted.

---

## 11. Instrumentation (this is what Phase 1 is actually for)

PRD §4 states Phase 1's entire purpose is validating "signups, completion rate, sharing/referral behavior, repeat visits" before any monetization work starts. The design is worthless for that purpose without these events wired in from day one:

- `landing_view`, `intake_start` (CTA tap)
- `chat_prompt_shown`, `chat_prompt_answered` (per prompt, with answer length not content) → lets you find the exact prompt where drop-off or fatigue happens, now that intake is chat rather than fixed steps
- `intake_abandon` (prompt index + time-on-prompt, via beacon on tab-close/blur)
- `usage_limit_check` (allowed / blocked, and which limit tier — anon_id vs. IP — if blocked)
- `plan_generated` (latency, model used for both extraction and generation calls, fallback triggered y/n — feeds PRD §8's cost/quality logging requirement)
- `report_view`, `report_share` (with share target if the Web Share API exposes it), `report_pdf_download`
- `email_capture_submit` (tagged by list: "future shared space" vs. any general list — kept distinct per PRD §2)
- `repeat_visit` (returning visitor to `/`, keyed off `anon_id` now that one already exists for usage limiting — a nice side benefit of §9's infrastructure)

No PII beyond what the intake already collects for its stated purpose (zip code, plain-language behavioral tags derived from chat — no name, no diagnosis, per PRD §5 and the extraction-pass rules in §10) should ever reach analytics; event payloads carry aggregate/behavioral tags and metadata only, **never** raw free-text chat content.

---

## 12. Explicitly out of scope for this Phase 1 design (mirrors PRD §10)

- Native iOS/Android apps (App Store/Play Store builds) — see §2 above for why.
- A live, dynamically-generated LLM conversation for intake (i.e., an assistant that improvises follow-up questions per turn) — §5.2 uses a fixed prompt script specifically to keep intake cost predictable; a fully dynamic chat is a possible future enhancement, not Phase 1.
- Any account system, login, or saved/multiple plans (Phase 3) — the usage-limit system in §9 is deliberately anonymous/device-based specifically so it doesn't require pulling account infrastructure forward.
- Any affiliate product links, buy buttons, or payment UI (Phase 2+), including inside the limit-reached screen (§5.3b).
- Design Review booking UI (Phase 2).
- Camp data-bridge consent checkbox (Phase 3 — requires an account to attach to).
- Farm-visit or camp-enrollment CTAs anywhere (no property exists yet).
- Backend PDF generation service (Phase 1 uses browser print-to-PDF only).

---

## 13. Open items for build kickoff

- **Real usage-limit numbers.** §9's "3 per 7 days" (anon_id) and "10–15 per day" (IP) are placeholders — need sign-off from whoever owns the LLM budget once Phase 0 per-generation cost (plan-generation call + image call, blended across providers) is actually known.
- **Plan-generation gateway key/models, untested live.** The app is wired to OpenRouter (`OPENROUTER_API_KEY`) with `google/gemini-2.5-flash-lite` as the primary model and `anthropic/claude-haiku-4.5` as fallback (both env-configurable, `lib/generatePlanLLM.ts`) — concrete choices, not just a spec. Never run against a live key in this build environment; confirm the `response_format: json_schema` request actually round-trips as expected on both models before relying on it, and revisit the model choices against current OpenRouter pricing/availability (they shift).
- **Bot-protection tool choice** (§9) — e.g., Cloudflare Turnstile vs. an alternative; a build-time decision, not blocking design.
- **Image-gen provider/key** (§5.4) — the app is wired to fal.ai's Flux Schnell (`FAL_KEY` env var) as the concrete cheap-tier choice; untested against a live key while building this (see app README). Confirm that's the provider to actually launch with, and load-test the ~20s timeout assumption once real latency data exists — Flux Schnell should be fast, but that's from published benchmarks, not this app's own measurements.
- **Combined worst-case wait.** The plan call and the image call are sequential, not parallel (the image prompt needs the chosen zones) — each with its own primary/fallback/timeout, so a genuinely bad-luck request (both plan models *and* the image call all timing out) could approach a much longer wait than the `GeneratingAnimation`'s reassurance-message pattern (§5.3) was designed around. Rare in practice (real success latency for these models/tiers is typically 1–4s), but worth a real load test rather than assuming it away — consider tightening timeouts further or parallelizing once real latency data exists.
- **Zip-code climate inference is an approximation outside the primary region, not a lookup.** Revised after a further review: since this product's real audience is regional (PRD §10 rules out national scaling — this is a Tri-Valley/East Bay lead-gen tool, not a nationwide product), the prompt no longer just infers climate generically everywhere. For a Bay Area zip code specifically, it now names concrete, reliable plants outright — pomegranate, fig, persimmon, kumquat/Meyer lemon for fruit; rosemary, thyme, lavender, sage for sunny-spot herbs, with mint/chives called out as better suited to shade — rather than hoping the model infers something reasonable. Everywhere else still falls back to general climate inference from the model's own geographic knowledge, which remains an approximation, not a lookup. The mock fallback's static catalog (`zones.ts`) was updated to match these same regional defaults, since it can't do per-request reasoning at all. If plant/water suggestions outside the primary region turn out unreliable in practice, the fix is a real zip→climate-zone or zip→USDA-hardiness-zone lookup feeding an explicit value into the prompt instead of relying on inference.
- Final palette/type choices need one round of visual design (this doc specifies direction and constraints, not final hex values/typeface).
- Confirm PDF print-stylesheet approach vs. a lightweight client-side lib (e.g., browser print vs. `react-to-print`) — both satisfy "no backend PDF service," pick based on report-layout complexity once visual design is final.
