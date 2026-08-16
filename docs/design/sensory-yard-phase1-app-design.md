# Sensory Yard — Phase 1 App Design Doc
*Design doc for Phase 1 (business plan Months 2–6ish, pre-land-purchase) — companion to `sensoryappPRD.md` v1.0*

Owner: Product/Design
Status: Draft for build
Source of truth for scope: PRD Section 4 (Phased Scope), Section 10 (Explicitly Out of Scope)

---

## 1. What Phase 1 is, in design terms

Per PRD Section 4, Phase 1 is a **free-only pilot**: intake → LLM plan generation (via gateway) → rendered report. No accounts, no payments, no affiliate links, no Design Review booking. The design goal is narrower than it sounds: **prove that a stranger, cold, with no hand-holding, will complete the intake and come back / share it.** Everything below is designed to remove friction from that one loop, not to build out future-phase surface area.

Two things this doc adds on top of the PRD's product requirements:
- A concrete **platform strategy** for "iPhone and Android."
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
/intake               Multi-step intake (Section 5 fields)
/generating            Transient loading state (LLM call in flight)
/report/:id            Rendered sensory plan (shareable link)
/about                 Full origin story + research link + "notify me" signup
/research               Research summary/appendix (linked from About + report)
/privacy                Privacy policy (COPPA-compliant, camp-bridge clause pre-written for Phase 3)
```

No nav bar with app sections in Phase 1 — there are no accounts, no saved plans, nothing to navigate *to*. The header is a lightweight logo + "About" link only. This is deliberate: a multi-item nav implies more app than exists yet and adds decision fatigue right before the intake CTA.

---

## 4. Primary user flow

```
Landing → Intake (5–7 steps) → Generating (5–20s) → Report → {Share, Start over, About}
                                                         │
                                                         └→ "Notify me about the future shared space" (email capture, §2)
```

Single golden path. No login gate anywhere in it — PRD §11 confirms Phase 1 has zero blocking decisions and no accounts. Every screen has exactly one primary action.

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

### 5.2 Intake (`/intake`)

Fields per PRD §5 / source-spec §3.1 (age with no floor, zip code only, no diagnosis, no real name, plain-language behavioral checkboxes like "seeks big movement," "loves textures"). Design pattern: **one question group per screen**, not a single long form — mobile form completion drops sharply past ~1 visible field group per viewport.

```
┌─────────────────────────────┐
│  ← Back        ●●●○○○○ 3/7  │  ← step indicator, always visible
│                              │
│   What's your kid into?      │
│   (pick all that apply)       │
│                              │
│   [ ] Seeks big movement      │
│   [ ] Loves textures          │
│   [ ] Curious about plants    │
│   [ ] Cautious / slow to warm │
│   [ ] Needs quiet corners      │
│   [ ] ...                    │
│                              │
│  ┌─────────────────────┐    │
│  │       Next →         │    │  ← disabled until valid, thumb-reachable
│  └─────────────────────┘    │
└─────────────────────────────┘
```

- Step order: (1) child's age [no floor — PRD §5], (2) zip code, (3–5) plain-language behavioral checkboxes grouped by theme (movement / texture-taste-smell / caution-novelty / social-crowd tolerance), (6) available space (yard size/type — carried from source spec §3.1), (7) review screen before submit.
- Multi-select checkbox groups, large tap targets (min 44×44pt per Apple HIG / 48×48dp per Material — this is the one place both platforms' guidelines already agree, so it sets the floor for the whole app's tap targets).
- Progress dots, not a percentage bar — feels less clinical/form-like, consistent with PRD §3's tone requirement.
- Back button always available; answers persist in local state (not a backend draft — no accounts yet) so back/forward never loses data.
- Zip-code field: numeric keyboard (`inputmode="numeric"`) triggered automatically on both iOS and Android — small detail, real friction if missed.
- Review screen (step 7) shows a plain summary of answers with per-section "Edit" links before the LLM call fires, since generation isn't free (gateway cost) and a wrong tap shouldn't force a full re-generation.

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

- PRD §8 requires gateway fallback-on-error rather than surfacing failure mid-intake — this screen is the one place that resilience becomes visible to the user. If the primary model errors, the fallback model fires transparently and the parent never sees an error state in the common case.
- If total latency exceeds ~8s, rotate 2–3 short reassurance strings (avoids the screen feeling frozen) rather than a raw spinner.
- Hard timeout ceiling (e.g., 30s): if even the fallback fails, show a plain apology + "Try again" — never a raw error code or stack trace, per the same non-clinical, non-technical tone bar as the rest of the app.

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

- Zone cards match source-spec §4.1 taxonomy and §4.2 JSON output structure 1:1 — each JSON zone object renders as one card, so the frontend is a thin, dumb renderer over the schema (no zone-specific frontend logic to maintain).
- Copy on every card is passed through the Section 3 banned-term filter *again* at render time (belt-and-suspenders on top of the backend's programmatic check in PRD §8) — if a banned term ever slipped through generation, it should never reach a rendered screen a parent might screenshot and post.
- **Share is a first-class action**, not an afterthought: PRD §4 names "sharing/referral behavior" as one of the exact signals Phase 1 exists to measure. Use `navigator.share()` where available (iOS Safari and Android Chrome both support it) so sharing goes straight to Messages/WhatsApp/Instagram — the actual channels parents use — rather than a generic "copy link" box.
- Report has a stable, shareable URL (`/report/:id`) so a shared link opens straight to the plan with zero login — critical since Phase 1 has no accounts to gate it behind.
- PDF export: PRD §7 lists PDF export as a **Pro-tier (Phase 3) benefit**, so Phase 1's "Download as PDF" must be a plain client-side print-to-PDF (browser print stylesheet) — free and universal on both platforms — not a backend PDF service. That distinction matters so Phase 1 doesn't accidentally build paid-tier infrastructure early (PRD §10).
- The "notify me about the future shared space" block (PRD §2) sits below the plan itself, not above it — it's a soft ask after value has been delivered, not a gate in front of it, and it must post to a distinct list from any general marketing capture per PRD §2's explicit requirement.
- No affiliate links, no product photos with buy buttons, no "book a call" CTA anywhere on this screen — PRD §10 is explicit that Phase 1 ships zero monetization surface, so the report's only CTAs are share, PDF, and the email capture.

### 5.5 About (`/about`)

Long-form page: PRD §2 full origin story verbatim, "See our research page →" link to `/research`, and the same "notify me about the future shared space" email capture repeated here (PRD §2 says it should be available from Phase 1 onward, not just post-report).

### 5.6 Empty/error states

- **Intake abandoned mid-flow**: no punishment UI — just a normal landing page if they return later. No accounts means no "resume your draft" mechanic in Phase 1; don't build one.
- **Generation failure after fallback exhausted**: plain apology, "Try again" button that re-submits the same answers (already held in local state) without forcing re-entry of the whole intake.
- **Invalid zip / unsupported input**: inline validation, plain language ("that doesn't look like a zip code"), never a red border with no explanation.

---

## 6. Visual design system

Tone target: **calm, natural, unmistakably not clinical.** This is a direct extension of PRD §3's language policy into visual design — a form that *looks* like a medical intake would undercut the copy work even if every banned word is scrubbed.

- **Palette**: warm neutrals (sand, bark, sage) as the base, with one saturated accent (e.g., a leaf green or marigold) reserved for primary CTAs only, so the one button that matters is never competing with itself. Avoid clinical whites/blues and avoid saturated "kids app" primaries (reads as childish edutainment, not a tool for the parent).
- **Typography**: one humanist sans-serif for everything (headings and body), generous line-height, minimum 16px body text on mobile (prevents iOS Safari's auto-zoom-on-focus behavior in form fields, which is a real, easy-to-miss bug class — see §8).
- **Imagery**: photography/illustration of textures, plants, and outdoor play — never stock photos of clinical settings, therapy rooms, or equipment catalogs. Consistent with PRD §3's ban extending beyond copy into visual register.
- **Iconography**: simple line icons per zone type (movement, texture, calm, taste/smell, visual), reused consistently between intake checkboxes and report zone cards, so a parent's selection visually maps to what they get back.
- **Motion**: minimal, soft (ease-out, ~200–300ms), used only on the generating-screen animation and step transitions — never decorative motion that delays the primary CTA from being tappable.

---

## 7. iOS vs. Android implementation notes

The two platforms are one codebase, but a handful of behaviors need explicit handling so "responsive web" doesn't mean "broken on one of the two":

| Concern | iOS Safari | Android Chrome | Design/build requirement |
|---|---|---|---|
| Input zoom | Auto-zooms on focus if input font-size < 16px | No auto-zoom | Set all form inputs to ≥16px |
| Safe areas | Notch/home-indicator insets | Gesture-nav inset (varies by OEM) | Use `env(safe-area-inset-*)` in CSS on the sticky header/CTA bar, not fixed padding |
| Back navigation | Swipe-back gesture / browser back | Hardware/gesture back button always present | Every intake step must respond correctly to the browser back button (step state in URL/history, not only in-memory) so Android back doesn't exit the flow entirely |
| Add to Home Screen | Manual ("Share → Add to Home Screen"), no install prompt | Native install prompt (`beforeinstallprompt`) available | Provide manifest.json + icons for both; don't rely on Android's auto-prompt as the only install path since iOS never gets one |
| Native share | `navigator.share()` supported (iOS 12.2+) | `navigator.share()` supported (Chrome 89+) | Use it on both; fall back to a copy-link button only on unsupported desktop browsers |
| Viewport height | `100vh` includes/excludes browser chrome inconsistently as it hides on scroll | Similar but different chrome behavior | Use `100dvh` (dynamic viewport height) for full-bleed screens like Generating, with a `100vh` fallback |

---

## 8. Component inventory (for build handoff)

`Header` (logo + About link, sticky) · `HeroCTA` · `OriginStorySnippet` · `StepIndicator` · `CheckboxGroup` · `SingleSelectGroup` (age) · `ZipInput` · `ReviewSummary` · `PrimaryButton` (full-width mobile, disabled state) · `GeneratingAnimation` · `ZoneCard` · `ShareButton` (Web Share API + clipboard fallback) · `EmailCapture` (parameterized by list name — "future shared space" vs. general, per PRD §2) · `ErrorState` (plain-language, retry action) · `FooterLinks` (Privacy, Research, About)

All components must render correctly with **no JS-driven layout past first paint** where feasible — this is a lead-gen funnel served largely from ad clicks on mobile data connections, so time-to-interactive on the intake CTA is a conversion-rate variable, not just a performance nice-to-have.

---

## 9. Instrumentation (this is what Phase 1 is actually for)

PRD §4 states Phase 1's entire purpose is validating "signups, completion rate, sharing/referral behavior, repeat visits" before any monetization work starts. The design is worthless for that purpose without these events wired in from day one:

- `landing_view`, `intake_start` (CTA tap)
- `intake_step_complete` (per step, with step number) → lets you find the exact step where drop-off happens
- `intake_abandon` (step + time-on-step, via beacon on tab-close/blur)
- `plan_generated` (latency, model used, fallback triggered y/n — feeds PRD §8's cost/quality logging requirement)
- `report_view`, `report_share` (with share target if the Web Share API exposes it), `report_pdf_download`
- `email_capture_submit` (tagged by list: "future shared space" vs. any general list — kept distinct per PRD §2)
- `repeat_visit` (returning visitor to `/`, best-effort via local storage flag — no accounts to key on yet)

No PII beyond what the intake already collects (zip code, plain-language behavioral tags — no name, no diagnosis, per PRD §5) should ever reach analytics; event payloads carry aggregate/behavioral tags only, never free text.

---

## 10. Explicitly out of scope for this Phase 1 design (mirrors PRD §10)

- Native iOS/Android apps (App Store/Play Store builds) — see §2 above for why.
- Any account system, login, or saved/multiple plans (Phase 3).
- Any affiliate product links, buy buttons, or payment UI (Phase 2+).
- Design Review booking UI (Phase 2).
- Camp data-bridge consent checkbox (Phase 3 — requires an account to attach to).
- Farm-visit or camp-enrollment CTAs anywhere (no property exists yet).
- Backend PDF generation service (Phase 1 uses browser print-to-PDF only).

---

## 11. Open items for build kickoff

- Final palette/type choices need one round of visual design (this doc specifies direction and constraints, not final hex values/typeface).
- Confirm LLM gateway choice (PRD §8 lists OpenRouter/Portkey/LiteLLM as options) before wiring the `/generating` → `/report` contract, since retry/fallback UX timing depends on the gateway's own timeout behavior.
- Confirm PDF print-stylesheet approach vs. a lightweight client-side lib (e.g., browser print vs. `react-to-print`) — both satisfy "no backend PDF service," pick based on report-layout complexity once visual design is final.
