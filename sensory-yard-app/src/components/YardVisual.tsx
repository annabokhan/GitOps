"use client";

import { useState } from "react";
import YardSketch from "./YardSketch";
import { Report } from "@/lib/types";

/**
 * Picks between the AI-generated image (report.imageUrl, when
 * generation succeeded server-side — lib/imageGen.ts) and the
 * deterministic SVG sketch (YardSketch). Also falls back client-side via
 * onError, in case a returned image URL later 404s or fails to load —
 * the fallback is a first-class behavior, not just a server-side check.
 *
 * Plain <img>, not next/image: the image host (fal.ai's CDN) isn't a
 * fixed, known-in-advance domain to configure in next.config.ts.
 */
export default function YardVisual({ report }: { report: Report }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (report.imageUrl && !imageFailed) {
    return (
      <figure className="overflow-hidden rounded-2xl border border-line bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={report.imageUrl}
          alt="An illustrated bird's-eye view of the suggested yard layout"
          className="block w-full"
          onError={() => setImageFailed(true)}
        />
        <figcaption className="p-3 text-xs text-bark-soft">
          An artist&rsquo;s impression, not to scale — the numbered list below is the exact layout key.
        </figcaption>
      </figure>
    );
  }

  return <YardSketch zones={report.zones} seed={report.id} />;
}
