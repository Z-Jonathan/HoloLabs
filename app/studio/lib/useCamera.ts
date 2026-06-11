"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CameraStatus } from "./types";

interface UseCameraResult {
  status: CameraStatus;
  /** Attach to the <video> element that should display the stream. */
  videoRef: (el: HTMLVideoElement | null) => void;
  /** The live video element, once playing — recognition reads frames from it. */
  videoEl: HTMLVideoElement | null;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * Webcam capture with an explicit, screen-reader-friendly state machine:
 * idle → requesting → live | denied | unavailable | error.
 * Video stays local — the stream is only ever painted to a <video> element.
 */
export function useCamera(): UseCameraResult {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const elRef = useRef<HTMLVideoElement | null>(null);

  const videoRef = useCallback((el: HTMLVideoElement | null) => {
    elRef.current = el;
    if (el && streamRef.current) {
      el.srcObject = streamRef.current;
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (elRef.current) elRef.current.srcObject = null;
    setVideoEl(null);
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setStatus("unavailable");
      return;
    }

    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 960 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;

      const el = elRef.current;
      if (!el) {
        // Component unmounted mid-request.
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      el.srcObject = stream;
      await el.play();
      setVideoEl(el);
      setStatus("live");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setStatus("denied");
      } else if (
        name === "NotFoundError" ||
        name === "OverconstrainedError" ||
        name === "NotReadableError"
      ) {
        setStatus("unavailable");
      } else {
        setStatus("error");
      }
    }
  }, []);

  // Release the camera on unmount.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { status, videoRef, videoEl, start, stop };
}
