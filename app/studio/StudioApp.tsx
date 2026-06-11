"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { CameraPanel } from "./components/CameraPanel";
import { AvatarPanel } from "./components/AvatarPanel";
import { TranscriptPanel } from "./components/TranscriptPanel";
import { ComposerBar } from "./components/ComposerBar";
import { ChatMessage, RecognitionStatus } from "./lib/types";
import { useCamera } from "./lib/useCamera";
import { useHandTracking } from "./lib/recognition/useHandTracking";
import { useFingerspelling } from "./lib/recognition/useFingerspelling";
import { LandmarkOverlay } from "./components/LandmarkOverlay";
import { RecognitionReadout } from "./components/RecognitionReadout";
import { StatusBadge, BadgeTone } from "./components/StatusBadge";

const recognitionBadge: Record<
  RecognitionStatus,
  { label: string; tone: BadgeTone }
> = {
  off: { label: "Recognition off", tone: "neutral" },
  loading: { label: "Loading hand tracking…", tone: "busy" },
  ready: { label: "Show your hands to begin", tone: "ok" },
  tracking: { label: "Hands detected", tone: "busy" },
  unsupported: { label: "Hand tracking unsupported here", tone: "warn" },
  error: { label: "Hand tracking error", tone: "warn" },
};

/**
 * Holo Studio — the two-panel conversation app.
 * Camera capture is live; recognition, responses, and the 3D avatar
 * arrive in later milestones.
 */
export function StudioApp() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const camera = useCamera();
  const tracking = useHandTracking(camera.videoEl);
  const trackBadge = recognitionBadge[tracking.status];

  const appendLetter = useCallback((letter: string) => {
    setDraft((prev) => prev + letter.toLowerCase());
  }, []);
  const appendSpace = useCallback(() => {
    setDraft((prev) => (prev === "" || prev.endsWith(" ") ? prev : prev + " "));
  }, []);

  const lastReply = [...messages].reverse().find((m) => m.role === "holo");

  const spelling = useFingerspelling(
    tracking.frameRef,
    tracking.status === "tracking" || tracking.status === "ready",
    appendLetter,
    appendSpace,
  );

  async function sendMessage() {
    const text = draft.trim();
    if (text === "" || sending) return;

    const source = camera.status === "live" ? "sign" : "text";
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      source,
      createdAt: Date.now(),
    };
    const history = [...messages, userMessage];
    setMessages(history);
    setDraft("");
    setSending(true);

    try {
      const res = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data: { ok: boolean; reply: string; source: string } =
        await res.json();

      const replyText =
        res.ok && data.ok && data.reply
          ? data.reply
          : "Sorry, I could not respond. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "holo",
          text: replyText,
          source: data.source === "demo" ? "demo" : "text",
          createdAt: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "holo",
          text: "Sorry, something went wrong. Please try again.",
          source: "demo",
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-content flex-col px-4 pb-6 pt-6 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-md text-lg font-semibold tracking-tight"
            aria-label="Back to the Holo home page"
          >
            <span className="text-gradient">Holo</span>
          </Link>
          <span className="rounded-full border border-glass-border bg-glass px-2.5 py-0.5 text-xs font-medium text-ink-soft">
            Studio
          </span>
        </div>
        <p className="hidden text-xs text-ink-mute sm:block">
          Prototype — fingerspelling + a starter sign vocabulary
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-4">
        <h1 className="sr-only">Holo Studio — sign language conversation</h1>

        <div className="grid min-h-[420px] flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
          <CameraPanel
            status={camera.status}
            videoRef={camera.videoRef}
            onStart={() => void camera.start()}
            onStop={camera.stop}
            overlay={<LandmarkOverlay frameRef={tracking.frameRef} />}
            footer={
              camera.status === "live" ? (
                <div className="flex flex-col gap-3 pt-3">
                  <div className="flex items-center justify-between px-1">
                    <StatusBadge
                      label={trackBadge.label}
                      tone={trackBadge.tone}
                      announce
                    />
                    {tracking.fps > 0 && (
                      <span className="text-xs tabular-nums text-ink-mute">
                        {tracking.fps} fps
                      </span>
                    )}
                  </div>
                  <RecognitionReadout state={spelling} />
                </div>
              ) : null
            }
          />
          <AvatarPanel
            replyId={lastReply?.id ?? null}
            replyText={lastReply?.text ?? ""}
          />
        </div>

        <ComposerBar
          value={draft}
          onChange={setDraft}
          onSend={() => void sendMessage()}
          busy={sending}
        />

        <TranscriptPanel messages={messages} />
      </main>
    </div>
  );
}
