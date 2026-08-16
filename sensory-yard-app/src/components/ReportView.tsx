"use client";

import { useState } from "react";
import Link from "next/link";
import ZoneCard from "./ZoneCard";
import YardSketch from "./YardSketch";
import EmailCapture from "./EmailCapture";
import { Report } from "@/lib/types";

// Design doc §5.4: highest design-effort screen — the shareable deliverable.
export default function ReportView({ report }: { report: Report }) {
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const title = report.kidName ? `${report.kidName}'s Sensory Yard Plan` : "Your Kid's Sensory Yard Plan";

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setShareState("copied");
    setTimeout(() => setShareState("idle"), 2000);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-16 pt-6">
      <h1 className="text-2xl font-bold text-bark">{title}</h1>

      <div className="mt-5">
        <YardSketch zones={report.zones} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {report.zones.map((zone, i) => (
          <ZoneCard key={zone.id} zone={zone} index={i + 1} />
        ))}
      </div>

      <div className="no-print mt-6 flex flex-col gap-3">
        <button
          onClick={share}
          className="min-h-12 rounded-full bg-leaf px-6 py-3 font-semibold text-cream hover:bg-leaf-dark"
        >
          {shareState === "copied" ? "Link copied!" : "Share this plan"}
        </button>
        <button
          onClick={() => window.print()}
          className="min-h-12 rounded-full border border-line px-6 py-3 font-semibold text-bark hover:bg-cream"
        >
          Download as PDF
        </button>
      </div>

      <div className="no-print mt-10 border-t border-line pt-6">
        <EmailCapture
          list="future-shared-space"
          label="Want to hear about our future shared outdoor space for kids like yours?"
        />
      </div>

      <Link href="/intake" className="no-print mt-8 text-sm font-semibold text-leaf-dark underline underline-offset-4">
        Start a new plan →
      </Link>
    </div>
  );
}
