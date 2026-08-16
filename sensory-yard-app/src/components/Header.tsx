import Link from "next/link";

// Design doc §3: no multi-item nav in Phase 1 — logo + About link only.
export default function Header() {
  return (
    <header className="sticky top-0 z-20 bg-sand/90 backdrop-blur border-b border-line">
      <div
        className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <Link href="/" className="flex items-center gap-2 font-semibold text-bark">
          <span aria-hidden>🌿</span>
          <span>Sensory Yard</span>
        </Link>
        <Link href="/about" className="text-sm font-medium text-bark-soft hover:text-bark">
          About
        </Link>
      </div>
    </header>
  );
}
