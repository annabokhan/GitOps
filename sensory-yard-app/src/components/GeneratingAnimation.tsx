"use client";

import { useEffect, useState } from "react";

// Design doc §5.3: rotate reassurance strings past ~8s rather than a raw spinner.
const MESSAGES = [
  "Every yard is different — we're matching zones to what you told us.",
  "Thinking through movement, texture, and calm spots that fit your space...",
  "Almost there — putting the plan together.",
];

export default function GeneratingAnimation({ kidLabel }: { kidLabel?: string }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMessageIndex((i) => (i + 1) % MESSAGES.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ minHeight: "60dvh" }}
    >
      <div className="text-6xl animate-bounce" aria-hidden>
        🌱
      </div>
      <h1 className="text-xl font-semibold text-bark">
        Designing {kidLabel ? `${kidLabel}'s` : "your kid's"} spot...
      </h1>
      <p className="max-w-xs text-sm text-bark-soft">{MESSAGES[messageIndex]}</p>
    </div>
  );
}
