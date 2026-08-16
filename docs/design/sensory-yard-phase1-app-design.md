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

**Scripted prompts, not a live LLM conversation.** The assistant side of the chat is a fixed sequence of prompts (not dynamically generated per turn by an LLM) — this keeps the intake itself free of per-message model cost and keeps timing predictable. Only two LLM calls happen per completed intake: one cheap extraction pass (turns the free text into the same plain-language tag schema source-spec §3.1 already defines, so the taxonomy/safety-constraint machinery in PRD §8 doesn't have to change) and the one generation call. Both count as a single "generation" against the usage limit in §9 — a parent is never charged twice against their limit for one plan.

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

**Prompt sequence** (5 total; each is its own screen, same chat-thread pattern):
1. *Quick facts* — child's age (no floor, PRD §5) and zip code. Kept as plain, fast fields, not chat — these are single unambiguous facts with no benefit from open-endedness, and the app needs a valid zip/age to function (regional lead-gen, farm age-band routing per PRD §5). Numeric keyboards (`inputmode="numeric"`) on both.
2. *What they gravitate toward outdoors* — open text/voice.
3. *What's hard for them, or what you find yourselves avoiding* — open text/voice.
4. *Your outdoor space* — size, sun/shade, what's already out there — open text/voice.
5. *Review* — the parent's own words played back verbatim under each prompt, with per-answer "Edit," before the usage check + LLM calls fire. Since generation now has a real cost and counts against the limit, a parent should be able to fix a typo without burning a generation.

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
│  │  🌿 Movement Zone        │ │  ← one card per zone
│  │  Balance beam, tunnel... │ │     (source spec §4.1 taxonomy)
│  └────────────────────────┘ │
│  ┌────────────────────────┐ │
│  │  🖐️ Texture Zone         │ │
│  │  Mint, chives, sand...   │ │
│  └────────────────────────┘ │
│  ┌────────────────────────┐ │
│  │  🌤️ Calm Corner          │ │
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

- Zone cards match source-spec §4.1 taxonomy and §4.2 JSON output structure 1:1 — each JSON zone object renders as one card, so the frontend is a thin, dumb renderer over the schema. The extraction pass in §5.2 feeds this same schema, so switching intake formats didn't change the report's data contract.
- Copy on every card is passed through the Section 3 banned-term filter *again* at render time (belt-and-suspenders on top of the backend's programmatic check in PRD §8) — if a banned term ever slipped through generation (now more possible with free-text input feeding the prompt — see §10), it should never reach a rendered screen a parent might screenshot and post.
- **Share is a first-class action**, not an afterthought: PRD §4 names "sharing/referral behavior" as one of the exact signals Phase 1 exists to measure. Use `navigator.share()` where available (iOS Safari and Android Chrome both support it) so sharing goes straight to Messages/WhatsApp/Instagram — the actual channels parents use — rather than a generic "copy link" box.
- Report has a stable, shareable URL (`/report/:id`) so a shared link opens straight to the plan with zero login — critical since Phase 1 has no accounts to gate it behind.
- PDF export: PRD §7 lists PDF export as a **Pro-tier (Phase 3) benefit**, so Phase 1's "Download as PDF" must be a plain client-side print-to-PDF (browser print stylesheet) — free and universal on both platforms — not a backend PDF service. That distinction matters so Phase 1 doesn't accidentally build paid-tier infrastructure early (PRD §10).
- The "notify me about the future shared space" block (PRD §2) sits below the plan itself, not above it — it's a soft ask after value has been delivered, not a gate in front of it, and it must post to a distinct list from any general marketing capture per PRD §2's explicit requirement.
- No affiliate links, no product photos with buy buttons, no "book a call" CTA anywhere on this screen — PRD §10 is explicit that Phase 1 ships zero monetization surface, so the report's only CTAs are share, PDF, and the email capture.
- Title personalization (using a first name if one was volunteered in the chat) is an **open decision, not a default** — see §10.

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

`Header` (logo + About link, sticky) · `HeroCTA` · `OriginStorySnippet` · `ChatThread` · `ChatBubble` (assistant/parent variants) · `ChatTextInput` (with native-dictation affordance, no custom speech code) · `SuggestionChips` (tap-to-insert, sourced from source-spec §3.1 tags) · `QuickFactField` (age, zip — plain inputs, not chat) · `ReviewSummary` (verbatim playback of chat answers, per-answer Edit) · `PrimaryButton` (full-width mobile, disabled state) · `GeneratingAnimation` · `LimitReachedState` (§5.3b) · `ZoneCard` · `ShareButton` (Web Share API + clipboard fallback) · `EmailCapture` (parameterized by list name — "future shared space" vs. general, per PRD §2) · `ErrorState` (plain-language, retry action, never consumes a usage slot) · `FooterLinks` (Privacy, Research, About)

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
- The extraction pass and the generation call together count as **one** unit against the limit, even though they're two gateway calls — the parent only experiences "I made one plan."

**Enforcement point:** the usage check runs the instant the chat is submitted from the review screen, before the extraction/generation calls fire and before `/generating` renders (§5.3) — cheap check, avoids showing a loading animation for a request about to be refused.

**Messaging:** plain and friendly, never framed as an upgrade prompt (§5.3b) — there is no paid tier in Phase 1 to point to, so "you've reached your limit" must never imply "pay to skip it." State the reset date in plain language, always offer the parent's own last report as a fallback.

**Bot/abuse protection:** an invisible, non-interactive bot-check (e.g., Cloudflare Turnstile) on the chat-submit action is recommended, since a free-text intake with a usage cap is still a plausible target for scripted abuse aimed at exhausting the LLM budget faster than genuine traffic would. This is a build-time tool choice, not a design constraint — flagged in §11.

**Accepted limitation for Phase 1:** a parent can reset their own limit by clearing browser storage or switching devices/browsers. This is a known, deliberately accepted gap — closing it properly requires an identity layer (accounts, Phase 3, or phone/email verification), which is exactly the infrastructure Phase 1 is designed to avoid building early (PRD §10). The IP backstop keeps this from being *free* to abuse at scale; it doesn't need to be airtight for a free pilot.

---

## 10. Privacy implications of open-ended input

Free text is fundamentally less controllable than checkboxes: a parent can type anything, including things the intake was never designed to collect. Two concrete risks this design has to account for, both stemming directly from PRD §5's existing rules ("no diagnosis field," "no child's real name") and §3's language policy:

- **Volunteered diagnoses.** A parent may type "he's autistic" or similar into an open prompt even though nothing asks for it. The app must not reject or flag this to the parent (that would be worse than the problem — it would make the tool feel clinical/judgmental, exactly what PRD §3 is designed to avoid), but the **extraction pass** (§5.2) that turns free text into the plain-language tag schema should be instructed to translate any such volunteered clinical language into the existing behavioral vocabulary (e.g., a mention of a diagnosis alongside "meltdowns in crowds" extracts as the existing crowd-tolerance tag, not as a stored diagnostic label) and must never let a diagnostic term pass through into the generation prompt or the rendered report, reusing the same banned-term check already required by PRD §8.
- **Volunteered real names.** A parent may type their kid's name into a free-text answer ("Emma loves..."). Recommend the extraction pass strip likely proper names from anything that gets persisted or logged (e.g., in the Phase 0–1 plan-quality review tooling PRD §8 calls for), consistent with source-spec's "no child's real name" intent for stored data.

**Open decision, not a default (flagged again in §11):** whether the *rendered report itself* is allowed to use a first name if one was volunteered (e.g., "Emma's Sensory Yard Plan" reads warmer and is more shareable than "Your Kid's Sensory Yard Plan"). This is a genuine product/privacy tradeoff — PRD §5 says the app doesn't collect a real name as a field, but doesn't anticipate one arriving inside free text. Recommendation if forced to pick a default: allow ephemeral, display-only use (rendered on that one report, never written to any structured field, analytics event, or list) and treat it as ordinary UI personalization rather than data collection — but this should get explicit product sign-off before build, since it sits close to a rule the PRD was deliberate about.

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

- **Real usage-limit numbers.** §9's "3 per 7 days" (anon_id) and "10–15 per day" (IP) are placeholders — need sign-off from whoever owns the LLM budget once Phase 0 per-generation cost (extraction + generation, blended across providers) is actually known.
- **Report personalization with a volunteered name** (§10) — needs explicit product sign-off before build; default recommendation is ephemeral display-only use, never stored.
- **Extraction-pass model choice** — should be a small/cheap model on the same gateway (PRD §8), separate config value from the main generation model; needs to be picked alongside the primary/fallback generation models.
- **Bot-protection tool choice** (§9) — e.g., Cloudflare Turnstile vs. an alternative; a build-time decision, not blocking design.
- Final palette/type choices need one round of visual design (this doc specifies direction and constraints, not final hex values/typeface).
- Confirm LLM gateway choice (PRD §8 lists OpenRouter/Portkey/LiteLLM as options) before wiring the `/generating` → `/report` contract, since retry/fallback UX timing depends on the gateway's own timeout behavior.
- Confirm PDF print-stylesheet approach vs. a lightweight client-side lib (e.g., browser print vs. `react-to-print`) — both satisfy "no backend PDF service," pick based on report-layout complexity once visual design is final.
