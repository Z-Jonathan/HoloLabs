"use client";

export type BadgeTone = "neutral" | "ok" | "busy" | "warn";

const toneStyles: Record<BadgeTone, { dot: string; text: string }> = {
  neutral: { dot: "bg-ink-mute", text: "text-ink-mute" },
  ok: { dot: "bg-teal-glow", text: "text-ink-soft" },
  busy: { dot: "bg-cyan-glow motion-safe:animate-pulse-soft", text: "text-ink-soft" },
  warn: { dot: "bg-amber-300", text: "text-amber-200" },
};

/**
 * Small visual status chip. State is conveyed by text + dot, never color
 * alone; dynamic updates are announced via role="status".
 */
export function StatusBadge({
  label,
  tone,
  announce = false,
}: {
  label: string;
  tone: BadgeTone;
  announce?: boolean;
}) {
  const styles = toneStyles[tone];
  return (
    <span
      role={announce ? "status" : undefined}
      className={`inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs font-medium ${styles.text}`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
}
