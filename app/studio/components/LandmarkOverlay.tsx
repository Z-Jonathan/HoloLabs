"use client";

import { RefObject, useEffect, useRef } from "react";
import type { HandFrame } from "../lib/recognition/useHandTracking";

/** Standard MediaPipe 21-landmark hand skeleton. */
const CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], // thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // index
  [5, 9], [9, 10], [10, 11], [11, 12], // middle
  [9, 13], [13, 14], [14, 15], [15, 16], // ring
  [13, 17], [17, 18], [18, 19], [19, 20], // pinky
  [0, 17],
];

/**
 * Decorative landmark skeleton drawn over the mirrored video so users can
 * see that Holo "sees" their hands. Meaning is never conveyed only here —
 * recognition state is also announced as text in the panel.
 */
export function LandmarkOverlay({
  frameRef,
}: {
  frameRef: RefObject<HandFrame | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    const loop = () => {
      const frame = frameRef.current;
      const box = canvas.getBoundingClientRect();
      if (canvas.width !== box.width || canvas.height !== box.height) {
        canvas.width = box.width;
        canvas.height = box.height;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (frame && frame.result.landmarks.length > 0) {
        // Replicate CSS object-cover so points sit on the visible pixels,
        // then mirror x to match the mirrored video.
        const scale = Math.max(
          canvas.width / frame.videoWidth,
          canvas.height / frame.videoHeight,
        );
        const drawW = frame.videoWidth * scale;
        const drawH = frame.videoHeight * scale;
        const offX = (canvas.width - drawW) / 2;
        const offY = (canvas.height - drawH) / 2;

        const px = (x: number) => canvas.width - (offX + x * drawW);
        const py = (y: number) => offY + y * drawH;

        for (const hand of frame.result.landmarks) {
          ctx.strokeStyle = "rgba(86, 225, 255, 0.55)";
          ctx.lineWidth = 2;
          for (const [a, b] of CONNECTIONS) {
            const la = hand[a];
            const lb = hand[b];
            if (!la || !lb) continue;
            ctx.beginPath();
            ctx.moveTo(px(la.x), py(la.y));
            ctx.lineTo(px(lb.x), py(lb.y));
            ctx.stroke();
          }
          ctx.fillStyle = "rgba(139, 108, 255, 0.9)";
          for (const lm of hand) {
            ctx.beginPath();
            ctx.arc(px(lm.x), py(lm.y), 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [frameRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
