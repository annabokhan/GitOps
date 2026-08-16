"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBubble from "@/components/chat/ChatBubble";
import SuggestionChips from "@/components/chat/SuggestionChips";
import ProgressDots from "@/components/chat/ProgressDots";
import PrimaryButton from "@/components/PrimaryButton";
import { CHAT_PROMPTS } from "@/lib/prompts";
import { IntakeAnswers } from "@/lib/types";
import { parseAges } from "@/lib/ages";

const TOTAL_STEPS = 1 + CHAT_PROMPTS.length; // quick facts + open prompts (review isn't counted in dots)

const EMPTY_ANSWERS: IntakeAnswers = { age: "", zip: "", gravitates: "", challenges: "", space: "", handiness: "" };

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = quick facts, 1..3 = prompts, 4 = review
  const [answers, setAnswers] = useState<IntakeAnswers>(EMPTY_ANSWERS);
  const [zipError, setZipError] = useState<string | null>(null);

  const isReview = step === TOTAL_STEPS;
  const prompt = step >= 1 && step <= CHAT_PROMPTS.length ? CHAT_PROMPTS[step - 1] : null;

  const canAdvanceFacts = useMemo(
    () => parseAges(answers.age) !== null && /^\d{5}$/.test(answers.zip.trim()),
    [answers.age, answers.zip]
  );

  function goNext() {
    if (step === 0) {
      if (!/^\d{5}$/.test(answers.zip.trim())) {
        setZipError("That doesn't look like a zip code.");
        return;
      }
      setZipError(null);
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    if (step === 0) {
      router.push("/");
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  }

  function updateAnswer(key: keyof IntakeAnswers, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  function submit() {
    sessionStorage.setItem("sy_intake_answers", JSON.stringify(answers));
    router.push("/generating");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-28 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={goBack}
          className="min-h-11 px-2 text-sm font-medium text-bark-soft hover:text-bark"
        >
          ← Back
        </button>
        {!isReview && <ProgressDots total={TOTAL_STEPS} current={step} />}
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-5">
          <ChatBubble from="assistant">
            First, a couple of quick facts — how old is your kid (or kids), and what&rsquo;s your zip code?
          </ChatBubble>

          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-bark">Kid&rsquo;s age(s)</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g. 6, or 6 and 9 if more than one"
                value={answers.age}
                onChange={(e) => updateAnswer("age", e.target.value)}
                className="min-h-12 rounded-xl border border-line bg-white px-4 text-base text-bark"
              />
              <span className="text-xs text-bark-soft">Planning for more than one kid? Separate ages with a comma.</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-bark">Zip code</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="94550"
                value={answers.zip}
                onChange={(e) => updateAnswer("zip", e.target.value.replace(/\D/g, ""))}
                className="min-h-12 rounded-xl border border-line bg-white px-4 text-base text-bark"
              />
              {zipError && <span className="text-sm text-marigold">{zipError}</span>}
            </label>
          </div>
        </div>
      )}

      {prompt && (
        <div className="flex flex-col gap-5">
          <ChatBubble from="assistant">{prompt.assistant}</ChatBubble>

          {answers[prompt.key].trim() !== "" && (
            <ChatBubble from="parent">{answers[prompt.key]}</ChatBubble>
          )}

          <div className="flex flex-col gap-3">
            <textarea
              value={answers[prompt.key]}
              onChange={(e) => updateAnswer(prompt.key, e.target.value)}
              placeholder={prompt.placeholder}
              rows={4}
              className="min-h-28 rounded-2xl border border-line bg-cream px-4 py-3 text-base text-bark placeholder:text-bark-soft/70"
            />
            {answers[prompt.key].trim().length > 0 && answers[prompt.key].trim().length < 10 && (
              <p className="text-sm text-bark-soft">Say a bit more so we can plan well — or just hit next.</p>
            )}
            <SuggestionChips
              chips={prompt.chips}
              onPick={(chip) =>
                updateAnswer(
                  prompt.key,
                  answers[prompt.key].trim() ? `${answers[prompt.key].trim()}, ${chip}` : chip
                )
              }
            />
          </div>
        </div>
      )}

      {isReview && (
        <div className="flex flex-col gap-5">
          <ChatBubble from="assistant">
            Here&rsquo;s what we&rsquo;ve got. Anything you&rsquo;d like to change?
          </ChatBubble>

          <ReviewRow label="Kid's age(s)" value={answers.age || "—"} onEdit={() => setStep(0)} />
          <ReviewRow label="Zip code" value={answers.zip || "—"} onEdit={() => setStep(0)} />
          {CHAT_PROMPTS.map((p, i) => (
            <ReviewRow
              key={p.key}
              label={p.assistant}
              value={answers[p.key] || "—"}
              onEdit={() => setStep(i + 1)}
            />
          ))}
        </div>
      )}

      <div
        className="fixed inset-x-0 bottom-0 border-t border-line bg-sand/95 px-5 py-4 backdrop-blur"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto max-w-2xl">
          {isReview ? (
            <PrimaryButton fullWidth onClick={submit}>
              Get my plan →
            </PrimaryButton>
          ) : (
            <PrimaryButton
              fullWidth
              onClick={goNext}
              disabled={step === 0 ? !canAdvanceFacts : answers[prompt!.key].trim() === ""}
            >
              Next →
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-bark-soft">{label}</p>
        <button onClick={onEdit} className="min-h-8 text-sm font-semibold text-leaf-dark">
          Edit
        </button>
      </div>
      <p className="mt-1 text-base text-bark">{value}</p>
    </div>
  );
}
