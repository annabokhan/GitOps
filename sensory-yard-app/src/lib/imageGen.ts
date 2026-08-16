export interface ImageGenResult {
  ok: boolean;
  url?: string;
  reason?: string;
}

/**
 * Cheap-tier AI image generation (Flux Schnell via fal.ai) for the yard
 * visual — tried per the design-doc decision once real per-image cost
 * data showed the cheap open-weight tier (~$0.003-$0.005/image) is close
 * to negligible even at meaningful signup volume (design doc §5.4).
 *
 * Best-effort only, by design: any failure (no key, timeout, non-200,
 * malformed response) returns `{ ok: false }` rather than throwing. The
 * caller (api/generate) always falls back to the deterministic SVG
 * sketch (components/YardSketch.tsx) — a report is never blocked or
 * failed by this call, and it never counts differently against the
 * usage limit either way (design doc §9).
 *
 * NOTE: request/response shape follows fal.ai's documented flux/schnell
 * API (https://fal.ai/models/fal-ai/flux/schnell/api) as of Aug 2026.
 * This repo's sandbox has fal.ai blocked at the network egress proxy, so
 * this path could not be tested against a live key while building it —
 * verify against current fal docs if it doesn't behave as expected once
 * FAL_KEY is set for real (see README).
 */
export async function generateYardImage(prompt: string): Promise<ImageGenResult> {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) return { ok: false, reason: "no-api-key" };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);
  const startedAt = Date.now();

  try {
    const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: "landscape_4_3",
        num_images: 1,
        enable_safety_checker: true,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return { ok: false, reason: `http-${res.status}` };
    }

    const data = await res.json();
    const url = data?.images?.[0]?.url;
    if (typeof url !== "string" || !url) {
      return { ok: false, reason: "no-image-in-response" };
    }

    console.log(`[image-gen] ok in ${Date.now() - startedAt}ms`);
    return { ok: true, url };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown-error";
    console.log(`[image-gen] failed after ${Date.now() - startedAt}ms: ${reason}`);
    return { ok: false, reason };
  } finally {
    clearTimeout(timeoutId);
  }
}
