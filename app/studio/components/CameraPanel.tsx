"use client";

import { ReactNode } from "react";
import { GlassCard } from "../../components/GlassCard";
import { StatusBadge, BadgeTone } from "./StatusBadge";
import { CameraStatus } from "../lib/types";

const statusBadge: Record<CameraStatus, { label: string; tone: BadgeTone }> = {
  idle: { label: "Camera off", tone: "neutral" },
  requesting: { label: "Waiting for permission…", tone: "busy" },
  live: { label: "Camera live", tone: "ok" },
  denied: { label: "Permission denied", tone: "warn" },
  unavailable: { label: "Camera unavailable", tone: "warn" },
  error: { label: "Camera error", tone: "warn" },
};

/**
 * Left panel: the user's webcam viewport. Mirrored like a mirror —
 * the natural way to watch yourself sign. Video never leaves the device.
 */
export function CameraPanel({
  status,
  videoRef,
  onStart,
  onStop,
  overlay,
  footer,
}: {
  status: CameraStatus;
  videoRef: (el: HTMLVideoElement | null) => void;
  onStart: () => void;
  onStop: () => void;
  /** Optional layer above the video (e.g. landmark overlay). */
  overlay?: ReactNode;
  /** Optional bar below the viewport (e.g. recognition readout). */
  footer?: ReactNode;
}) {
  const badge = statusBadge[status];
  const live = status === "live";

  return (
    <GlassCard className="flex h-full flex-col p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold tracking-tight text-ink">You</h2>
        <div className="flex items-center gap-2">
          <StatusBadge label={badge.label} tone={badge.tone} announce />
          {live && (
            <button
              type="button"
              onClick={onStop}
              className="rounded-full border border-glass-border bg-glass px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-glow"
            >
              Stop camera
            </button>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-glass border border-glass-border bg-base-900/70">
        {/* The video element stays mounted so the ref is available the
            moment permission resolves. Mirrored for natural signing. */}
        <video
          ref={videoRef}
          muted
          playsInline
          aria-label="Your camera preview, mirrored"
          className={[
            "absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity duration-500",
            live ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        {live && overlay}

        {!live && (
          <div className="relative flex flex-col items-center gap-4 px-6 py-10 text-center">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-glass-border bg-glass text-ink-mute"
            >
              <CameraIcon />
            </span>
            <StateMessage status={status} />
            {status !== "requesting" && (
              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center gap-2 rounded-glass px-5 py-2.5 text-sm font-medium text-white shadow-glass transition-[transform,filter] duration-300 [background:linear-gradient(120deg,theme(colors.violet.DEFAULT),theme(colors.cyan.DEFAULT))] hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-glow"
              >
                {status === "idle" ? "Start camera" : "Try again"}
              </button>
            )}
            {status === "requesting" && (
              <p className="text-xs text-ink-mute">
                Check your browser&rsquo;s permission prompt.
              </p>
            )}
          </div>
        )}
      </div>

      {footer}
    </GlassCard>
  );
}

function StateMessage({ status }: { status: CameraStatus }) {
  const messages: Record<CameraStatus, ReactNode> = {
    idle: (
      <p className="max-w-xs text-sm text-ink-soft">
        Start your camera to sign with Holo. Video is processed entirely on
        your device and never uploaded.
      </p>
    ),
    requesting: (
      <p className="max-w-xs text-sm text-ink-soft">
        Asking your browser for camera access…
      </p>
    ),
    live: null,
    denied: (
      <p className="max-w-xs text-sm text-ink-soft">
        Camera access was blocked. Allow camera access for this site in your
        browser&rsquo;s address-bar permissions, then try again.
      </p>
    ),
    unavailable: (
      <p className="max-w-xs text-sm text-ink-soft">
        No usable camera was found. Connect a webcam, make sure no other app
        is using it, and reload — also note Holo needs a secure (https or
        localhost) connection.
      </p>
    ),
    error: (
      <p className="max-w-xs text-sm text-ink-soft">
        Something went wrong starting the camera. Please try again.
      </p>
    ),
  };
  return messages[status];
}

function CameraIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 10l5-3v10l-5-3" />
      <rect x="3" y="6" width="12" height="12" rx="2.5" />
    </svg>
  );
}
