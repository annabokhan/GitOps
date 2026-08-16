"use client";

import { useState } from "react";
import PrimaryButton from "./PrimaryButton";

/**
 * Design doc §2: distinct email list per surface (e.g. "future shared
 * space") kept separate from any general marketing capture.
 */
export default function EmailCapture({ list, label }: { list: string; label: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, list }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return <p className="text-sm font-medium text-leaf-dark">You&rsquo;re on the list — thank you!</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <p className="text-sm text-bark-soft">{label}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="min-h-12 flex-1 rounded-xl border border-line bg-white px-4 text-base text-bark"
        />
        <PrimaryButton type="submit" disabled={state === "submitting"}>
          Notify me
        </PrimaryButton>
      </div>
      {state === "error" && <p className="text-sm text-marigold">That didn&rsquo;t go through — try again?</p>}
    </form>
  );
}
