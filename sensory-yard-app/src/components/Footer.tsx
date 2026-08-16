import Link from "next/link";

export default function Footer() {
  return (
    <footer className="no-print border-t border-line px-5 py-6 text-sm text-bark-soft">
      <div className="mx-auto flex max-w-2xl gap-4">
        <Link href="/privacy" className="hover:text-bark">
          Privacy
        </Link>
        <Link href="/research" className="hover:text-bark">
          Research
        </Link>
        <Link href="/about" className="hover:text-bark">
          About
        </Link>
      </div>
    </footer>
  );
}
