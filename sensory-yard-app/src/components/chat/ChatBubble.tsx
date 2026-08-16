import { ReactNode } from "react";

// Design doc §6: chat bubble styling should read as a warm text thread, not a support widget.
export default function ChatBubble({
  from,
  children,
}: {
  from: "assistant" | "parent";
  children: ReactNode;
}) {
  const isAssistant = from === "assistant";
  return (
    <div className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isAssistant
            ? "rounded-tl-sm bg-cream border border-line text-bark"
            : "rounded-tr-sm bg-sage-soft text-bark"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
