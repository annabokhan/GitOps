// Design doc §5.5: privacy policy placeholder. PRD §9: camp-bridge consent (Phase 3) documented
// as a distinct, revocable category once it exists — not applicable yet in Phase 1.
export default function PrivacyPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 pb-16 pt-6 text-base leading-relaxed text-bark-soft">
      <h1 className="text-2xl font-bold text-bark">Privacy</h1>
      <p>
        We collect only what&rsquo;s needed to build your plan: your kid&rsquo;s age, your zip
        code, and what you tell us in your own words. No accounts, no names required, no
        diagnosis fields. We don&rsquo;t sell your data.
      </p>
      <p className="text-sm text-bark-soft/80">
        Placeholder page — full policy to be finalized before public launch.
      </p>
    </div>
  );
}
