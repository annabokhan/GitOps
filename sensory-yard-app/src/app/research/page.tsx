// Design doc §5.5 / PRD §2: research summary/appendix, kept non-diagnostic per PRD §3.
export default function ResearchPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 pb-16 pt-6 text-base leading-relaxed text-bark-soft">
      <h1 className="text-2xl font-bold text-bark">Research & evidence</h1>
      <p>
        Time outdoors is consistently linked to calmer nervous systems and better emotional
        regulation in kids broadly — not tied to any specific diagnosis. Hands-on exposure to
        plants and growing food has also been shown to increase kids&rsquo; willingness to try new
        things.
      </p>
      <p className="text-sm text-bark-soft/80">
        Placeholder page — full citations to be added once the research appendix is finalized.
      </p>
    </div>
  );
}
