"use client";

import { useEffect, useRef, useState } from "react";
import { GlassCard } from "../../components/GlassCard";
import { StatusBadge, BadgeTone } from "./StatusBadge";
import { AvatarStatus } from "../lib/types";
import type { AvatarScene } from "../lib/avatar/scene";
import type { SignProgress } from "../lib/avatar/animator";

const statusBadge: Record<AvatarStatus, { label: string; tone: BadgeTone }> = {
  loading: { label: "Loading avatar…", tone: "busy" },
  idle: { label: "Ready", tone: "ok" },
  signing: { label: "Signing", tone: "busy" },
  error: { label: "Avatar unavailable", tone: "warn" },
};

/**
 * Right panel: Holo's 3D signing avatar. The latest reply is signed
 * (known words as sign clips, the rest fingerspelled) with synchronized
 * captions — captions are first-class, never an afterthought.
 */
export function AvatarPanel({
  replyId,
  replyText,
}: {
  /** Changes when a new reply should be signed. */
  replyId: string | null;
  replyText: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<AvatarScene | null>(null);
  const [status, setStatus] = useState<AvatarStatus>("loading");
  const [progress, setProgress] = useState<SignProgress | null>(null);

  // Create the three.js scene once, lazily (heavy libs are dynamic imports).
  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    void (async () => {
      try {
        const { createAvatarScene } = await import("../lib/avatar/scene");
        const scene = await createAvatarScene(canvas);
        if (cancelled) {
          scene.dispose();
          return;
        }
        sceneRef.current = scene;
        setStatus("idle");
      } catch (err) {
        console.error("[avatar] failed to initialize:", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Sign each new reply.
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !replyId || replyText.trim() === "") return;
    setStatus("signing");
    setProgress(null);
    scene.signText(replyText, {
      onProgress: setProgress,
      onDone: () => {
        setStatus("idle");
        setProgress(null);
      },
    });
    return () => scene.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyId]);

  const badge = statusBadge[status];

  return (
    <GlassCard className="flex h-full flex-col p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold tracking-tight text-ink">Holo</h2>
        <StatusBadge label={badge.label} tone={badge.tone} announce />
      </div>

      <div className="relative flex-1 overflow-hidden rounded-glass border border-glass-border bg-base-900/70">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_35%,rgba(124,92,255,0.16),transparent_70%)]"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-label="Holo's 3D avatar signing the reply shown in the caption below"
        />

        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-ink-soft">Loading Holo&rsquo;s avatar…</p>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <p className="max-w-xs text-sm text-ink-soft">
              The 3D avatar couldn&rsquo;t load here — replies still appear as
              text in the caption bar and transcript.
            </p>
          </div>
        )}

        {/* Caption bar: always-on text channel for the signed reply. */}
        {replyText && status !== "loading" && (
          <div className="absolute inset-x-3 bottom-3 rounded-glass border border-glass-border bg-base-900/80 px-4 py-2.5 backdrop-blur-glass">
            <p className="text-sm leading-snug text-ink" aria-live="off">
              {renderCaption(replyText, progress)}
            </p>
            {progress?.letter && (
              <p className="mt-1 text-xs text-cyan-glow">
                fingerspelling: {progress.word.toUpperCase()} —{" "}
                <span className="font-semibold">{progress.letter}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

/** Highlights the word currently being signed. */
function renderCaption(text: string, progress: SignProgress | null) {
  if (!progress) return text;
  const words = text.split(/\s+/);
  let signableIndex = -1;
  return words.map((word, i) => {
    const isSignable = /[a-zA-Z]/.test(word);
    if (isSignable) signableIndex += 1;
    const active = isSignable && signableIndex === progress.wordIndex;
    return (
      <span key={i} className={active ? "font-semibold text-cyan-glow" : undefined}>
        {word}
        {i < words.length - 1 ? " " : ""}
      </span>
    );
  });
}
