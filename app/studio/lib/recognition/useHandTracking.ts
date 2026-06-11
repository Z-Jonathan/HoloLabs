"use client";

import { useEffect, useRef, useState } from "react";
import { RecognitionStatus } from "../types";
import type { HandLandmarkerResult } from "./handLandmarker";

export interface HandFrame {
  result: HandLandmarkerResult;
  timestampMs: number;
  videoWidth: number;
  videoHeight: number;
}

/**
 * Runs the hand landmarker against a live <video> element in a rAF loop.
 * Latest frame is exposed via a ref (for per-frame consumers like the
 * overlay and classifier) plus a coarse status + fps for the UI.
 */
export function useHandTracking(videoEl: HTMLVideoElement | null): {
  status: RecognitionStatus;
  fps: number;
  frameRef: React.RefObject<HandFrame | null>;
} {
  const [status, setStatus] = useState<RecognitionStatus>("off");
  const [fps, setFps] = useState(0);
  const frameRef = useRef<HandFrame | null>(null);

  useEffect(() => {
    if (!videoEl) {
      setStatus("off");
      frameRef.current = null;
      return;
    }

    let cancelled = false;
    let rafId = 0;
    let lastVideoTime = -1;
    let frames = 0;
    let windowStart = performance.now();
    let hadHand = false;

    setStatus("loading");

    void (async () => {
      let landmarker;
      try {
        const { loadHandLandmarker } = await import("./handLandmarker");
        landmarker = await loadHandLandmarker();
      } catch {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (cancelled) return;
      setStatus("ready");

      const loop = () => {
        if (cancelled) return;
        const now = performance.now();

        if (
          videoEl.readyState >= 2 &&
          videoEl.currentTime !== lastVideoTime &&
          videoEl.videoWidth > 0
        ) {
          lastVideoTime = videoEl.currentTime;
          try {
            const result = landmarker.detectForVideo(videoEl, now);
            frameRef.current = {
              result,
              timestampMs: now,
              videoWidth: videoEl.videoWidth,
              videoHeight: videoEl.videoHeight,
            };

            const hasHand = result.landmarks.length > 0;
            if (hasHand !== hadHand) {
              hadHand = hasHand;
              setStatus(hasHand ? "tracking" : "ready");
            }

            frames += 1;
            if (now - windowStart >= 1000) {
              setFps(Math.round((frames * 1000) / (now - windowStart)));
              frames = 0;
              windowStart = now;
            }
          } catch {
            setStatus("error");
            return;
          }
        }
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      frameRef.current = null;
    };
  }, [videoEl]);

  return { status, fps, frameRef };
}
