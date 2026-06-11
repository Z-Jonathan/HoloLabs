"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import type { HandFrame } from "./useHandTracking";
import { classifyHand } from "./classify";

export interface FingerspellingState {
  /** Letter currently being held, if any. */
  candidate: string | null;
  /** Confidence of the current candidate, 0..1. */
  confidence: number;
  /** Progress toward committing the held letter, 0..1. */
  holdProgress: number;
}

const TICK_MS = 66; // ~15 Hz classification
const HOLD_MS = 700; // hold a letter this long to commit it
const REARM_MS = 350; // release this long before repeating the same letter
const SPACE_MS = 1400; // no hand this long → word break
const WINDOW = 8; // smoothing window in ticks
const STABLE_RATIO = 0.6;

/**
 * Temporal layer over the per-frame classifier: smooths jitter, requires a
 * deliberate hold before committing a letter, and inserts word breaks when
 * the hand leaves the frame. Commits flow upward as callbacks so the
 * composer stays the single source of truth for the message.
 */
export function useFingerspelling(
  frameRef: RefObject<HandFrame | null>,
  active: boolean,
  onLetter: (letter: string) => void,
  onSpace: () => void,
): FingerspellingState {
  const [state, setState] = useState<FingerspellingState>({
    candidate: null,
    confidence: 0,
    holdProgress: 0,
  });

  // Callbacks live in refs so the interval never needs re-arming.
  const onLetterRef = useRef(onLetter);
  const onSpaceRef = useRef(onSpace);
  onLetterRef.current = onLetter;
  onSpaceRef.current = onSpace;

  useEffect(() => {
    if (!active) {
      setState({ candidate: null, confidence: 0, holdProgress: 0 });
      return;
    }

    const window: Array<{ letter: string; confidence: number } | null> = [];
    let holdLetter: string | null = null;
    let holdStart = 0;
    let lastCommitted: string | null = null;
    let releaseStart = 0;
    let noHandStart = 0;
    let committedSinceSpace = false;
    let spaceInserted = true; // don't lead with a space

    const id = setInterval(() => {
      const frame = frameRef.current;
      const now = performance.now();
      const stale = !frame || now - frame.timestampMs > 500;
      const hand = stale ? undefined : frame.result.landmarks[0];

      // --- no hand in frame ---------------------------------------------
      if (!hand) {
        window.length = 0;
        holdLetter = null;
        if (noHandStart === 0) noHandStart = now;
        if (lastCommitted !== null && releaseStart === 0) releaseStart = now;
        if (
          committedSinceSpace &&
          !spaceInserted &&
          now - noHandStart >= SPACE_MS
        ) {
          onSpaceRef.current();
          spaceInserted = true;
          committedSinceSpace = false;
        }
        setState((prev) =>
          prev.candidate === null && prev.holdProgress === 0
            ? prev
            : { candidate: null, confidence: 0, holdProgress: 0 },
        );
        return;
      }
      noHandStart = 0;

      // --- classify + smooth --------------------------------------------
      const result = classifyHand(hand);
      window.push(result ? { letter: result.letter, confidence: result.confidence } : null);
      if (window.length > WINDOW) window.shift();

      const counts = new Map<string, { n: number; conf: number }>();
      for (const entry of window) {
        if (!entry) continue;
        const c = counts.get(entry.letter) ?? { n: 0, conf: 0 };
        c.n += 1;
        c.conf += entry.confidence;
        counts.set(entry.letter, c);
      }
      let stable: { letter: string; confidence: number } | null = null;
      for (const [letter, { n, conf }] of counts) {
        if (n / WINDOW >= STABLE_RATIO) {
          stable = { letter, confidence: conf / n };
          break;
        }
      }

      // Re-arm repeat commits once the pose has clearly changed.
      if (lastCommitted !== null && stable?.letter !== lastCommitted) {
        if (releaseStart === 0) releaseStart = now;
        if (now - releaseStart >= REARM_MS) {
          lastCommitted = null;
          releaseStart = 0;
        }
      } else if (stable?.letter === lastCommitted) {
        releaseStart = 0;
      }

      if (!stable) {
        holdLetter = null;
        setState({ candidate: null, confidence: 0, holdProgress: 0 });
        return;
      }

      if (stable.letter !== holdLetter) {
        holdLetter = stable.letter;
        holdStart = now;
      }

      const blocked = stable.letter === lastCommitted;
      const progress = blocked
        ? 0
        : Math.min(1, (now - holdStart) / HOLD_MS);

      if (progress >= 1) {
        onLetterRef.current(stable.letter);
        lastCommitted = stable.letter;
        committedSinceSpace = true;
        spaceInserted = false;
        holdLetter = null;
      }

      setState({
        candidate: stable.letter,
        confidence: stable.confidence,
        holdProgress: progress,
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, [active, frameRef]);

  return state;
}
