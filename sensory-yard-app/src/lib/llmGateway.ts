/**
 * Provider-agnostic chat-completion call via OpenRouter (PRD §8: generation
 * must go through a gateway — OpenRouter/Portkey/LiteLLM — not a direct
 * single-provider API call, specifically so model choice stays config,
 * not code). This is the one function that talks to the gateway; callers
 * never see provider-specific request/response shapes.
 *
 * NOTE: this sandbox has no OPENROUTER_API_KEY and hasn't been tested
 * against a live call — see the app README before wiring a real key.
 */
export interface ChatCompletionResult {
  ok: boolean;
  content?: string;
  model: string;
  latencyMs: number;
  reason?: string;
}

export async function callGateway(
  model: string,
  system: string,
  user: string,
  jsonSchema: object,
  timeoutMs = 12_000
): Promise<ChatCompletionResult> {
  const startedAt = Date.now();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { ok: false, reason: "no-api-key", model, latencyMs: 0 };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_schema", json_schema: jsonSchema },
      }),
      signal: controller.signal,
    });

    const latencyMs = Date.now() - startedAt;
    if (!res.ok) return { ok: false, reason: `http-${res.status}`, model, latencyMs };

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content) {
      return { ok: false, reason: "no-content", model, latencyMs };
    }

    return { ok: true, content, model, latencyMs };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "unknown-error",
      model,
      latencyMs: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
