import Link from "next/link";
import { PrimaryLinkButton } from "./PrimaryButton";

// Design doc §5.3b: plain capacity message, never an upsell — no paid tier exists in Phase 1.
export default function LimitReached({
  resetAt,
  lastReportId,
}: {
  resetAt: number | null;
  lastReportId: string | null;
}) {
  const resetDate = resetAt
    ? new Date(resetAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
    : null;

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ minHeight: "60dvh" }}
    >
      <div className="text-5xl" aria-hidden>
        🌾
      </div>
      <h1 className="text-xl font-semibold text-bark">You&rsquo;ve used your free plans for now.</h1>
      <p className="max-w-xs text-sm text-bark-soft">
        {resetDate ? `Come back on ${resetDate} for another one.` : "Come back soon for another one."}{" "}
        Your last plan is always here in the meantime.
      </p>

      {lastReportId && (
        <PrimaryLinkButton href={`/report/${lastReportId}`}>View my last plan →</PrimaryLinkButton>
      )}

      <Link href="/about" className="text-sm font-semibold text-leaf-dark underline underline-offset-4">
        Read our story · About
      </Link>
    </div>
  );
}
