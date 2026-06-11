"use client";

import { FormEvent, useState } from "react";

/**
 * Message composer: recognized signing lands here as editable text, and
 * typing is an equal-class input path. Submit sends to Holo.
 */
export function ComposerBar({
  value,
  onChange,
  onSend,
  disabled,
  busy,
}: {
  value: string;
  onChange: (next: string) => void;
  onSend: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  const [touched, setTouched] = useState(false);
  const empty = value.trim() === "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (disabled || busy || empty) return;
    onSend();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-surface glass-specular relative flex items-center gap-3 overflow-hidden rounded-glass-lg p-3"
    >
      <label htmlFor="studio-composer" className="sr-only">
        Message to Holo — recognized signing appears here, or type instead
      </label>
      <input
        id="studio-composer"
        type="text"
        autoComplete="off"
        placeholder="Sign to compose, or type here…"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full flex-1 rounded-glass border border-glass-border bg-base-900/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-glow disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || busy || (touched && empty)}
        className="inline-flex shrink-0 items-center gap-2 rounded-glass px-5 py-2.5 text-sm font-medium text-white shadow-glass transition-[transform,filter] duration-300 [background:linear-gradient(120deg,theme(colors.violet.DEFAULT),theme(colors.cyan.DEFAULT))] hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-glow disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
