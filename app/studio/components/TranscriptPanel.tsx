"use client";

import { ChatMessage } from "../lib/types";

/**
 * Running conversation transcript. Captions are a first-class channel:
 * every signed exchange also appears here as text.
 */
export function TranscriptPanel({ messages }: { messages: ChatMessage[] }) {
  return (
    <section
      aria-label="Conversation transcript"
      className="glass-surface glass-specular relative overflow-hidden rounded-glass-lg p-4"
    >
      <h2 className="mb-3 text-sm font-semibold tracking-tight text-ink">
        Transcript
      </h2>

      {messages.length === 0 ? (
        <p className="text-sm text-ink-mute">
          Your conversation will appear here — every signed message and reply,
          always in text too.
        </p>
      ) : (
        <ol
          aria-live="polite"
          className="flex max-h-48 list-none flex-col gap-2 overflow-y-auto pr-1"
        >
          {messages.map((message) => (
            <li
              key={message.id}
              className={[
                "max-w-[85%] rounded-glass px-3 py-2 text-sm",
                message.role === "user"
                  ? "self-end border border-glass-border bg-glass text-ink"
                  : "self-start bg-[linear-gradient(120deg,rgba(124,92,255,0.25),rgba(62,200,255,0.18))] text-ink",
              ].join(" ")}
            >
              <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-wide text-ink-mute">
                {message.role === "user" ? "You" : "Holo"}
                {message.source === "sign" ? " · signed" : ""}
              </span>
              {message.text}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
