"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GeneratingAnimation from "@/components/GeneratingAnimation";
import LimitReached from "@/components/LimitReached";
import { getAnonId, getLastReportId, setLastReportId } from "@/lib/anon";
import { IntakeAnswers } from "@/lib/types";

type Status = "loading" | "blocked" | "error";

export default function GeneratingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [resetAt, setResetAt] = useState<number | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("sy_intake_answers");
    if (!raw) {
      router.replace("/intake");
      return;
    }
    const answers = JSON.parse(raw) as IntakeAnswers;

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-anon-id": getAnonId() },
      body: JSON.stringify(answers),
    })
      .then((r) => r.json())
      .then((data: { blocked: boolean; resetAt?: number; id?: string }) => {
        if (data.blocked) {
          setResetAt(data.resetAt ?? null);
          setStatus("blocked");
          return;
        }
        sessionStorage.removeItem("sy_intake_answers");
        setLastReportId(data.id!);
        router.replace(`/report/${data.id}`);
      })
      .catch(() => setStatus("error"));
  }, [router]);

  if (status === "blocked") {
    return <LimitReached resetAt={resetAt} lastReportId={getLastReportId()} />;
  }

  if (status === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center" style={{ minHeight: "60dvh" }}>
        <h1 className="text-xl font-semibold text-bark">Something didn&rsquo;t work.</h1>
        <p className="max-w-xs text-sm text-bark-soft">
          Sorry about that — your answers are still saved. Try again in a moment.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="min-h-12 rounded-full bg-leaf px-6 py-3 font-semibold text-cream"
        >
          Try again
        </button>
      </div>
    );
  }

  return <GeneratingAnimation />;
}
