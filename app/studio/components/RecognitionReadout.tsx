"use client";

import { FingerspellingState } from "../lib/recognition/useFingerspelling";

/**
 * Live fingerspelling readout: the letter currently held, a visible
 * hold-progress ring, and confidence as text. Everything is conveyed in
 * text + shape, never color alone.
 */
export function RecognitionReadout({
  state,
}: {
  state: FingerspellingState;
}) {
  const { candidate, confidence, holdProgress } = state;
  const r = 16;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-3 rounded-glass border border-glass-border bg-base-900/60 px-3 py-2">
      <div className="relative h-11 w-11 shrink-0">
        <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle
            cx="20" cy="20" r={r}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="3"
          />
          <circle
            cx="20" cy="20" r={r}
            fill="none"
            stroke="#56e1ff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - holdProgress)}
          />
        </svg>
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-ink"
        >
          {candidate ?? "·"}
        </span>
      </div>

      <div className="min-w-0 text-xs leading-snug">
        {candidate ? (
          <>
            <p className="font-medium text-ink">
              Reading&nbsp;
              <span className="text-cyan-glow">{candidate}</span>
              {holdProgress > 0 ? " — hold it…" : ""}
            </p>
            <p className="text-ink-mute">
              {Math.round(confidence * 100)}% confident · hold steady to add
              the letter
            </p>
          </>
        ) : (
          <>
            <p className="font-medium text-ink-soft">
              Fingerspell, one letter at a time
            </p>
            <p className="text-ink-mute">
              Static ASL alphabet (J and Z need motion — type those). Pause
              out of frame for a space.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
