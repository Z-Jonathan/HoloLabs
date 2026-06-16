"use client";

import { FormEvent, useState } from "react";
import { GlassCard } from "./GlassCard";
import { Reveal } from "./Reveal";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, company }),
      });
      const data: { ok: boolean; message: string } = await res.json();

      if (res.ok && data.ok) {
        setStatus("success");
        setMessage(data.message || "You're on the list. We'll be in touch.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(
          data.message || "Something went wrong — please try again.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong — please try again.");
    }
  }

  const isSuccess = status === "success";

  return (
    <section
      id="waitlist"
      className="relative mx-auto max-w-content scroll-mt-24 px-6 py-24 sm:py-32"
    >
      <Reveal className="mx-auto max-w-2xl">
        <GlassCard className="relative p-8 text-center sm:p-12">
          {/* Soft glow inside the card. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 h-40 w-3/4 -translate-x-1/2 rounded-full bg-violet-glow/20 blur-aurora"
          />

          <div className="relative">
            <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              Be first to sign with Holo.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-lg text-ink-soft">
              Join the waitlist for early access and shape what we build next.
            </p>

            <form
              onSubmit={onSubmit}
              noValidate
              className="mx-auto mt-8 flex max-w-md flex-col gap-3"
            >
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>

              {/* Honeypot — hidden from users, visible to naive bots. */}
              <div aria-hidden="true" className="hidden">
                <label htmlFor="waitlist-company">Company</label>
                <input
                  id="waitlist-company"
                  name="company"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="waitlist-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  disabled={isSuccess}
                  aria-invalid={status === "error"}
                  aria-describedby="waitlist-status"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  className="glass-surface w-full flex-1 rounded-glass px-4 py-3 text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-glow disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === "loading" || isSuccess}
                  className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-glass bg-ink px-6 py-3 text-sm font-medium text-base shadow-glass transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:bg-ink-soft hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-glow disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "loading" ? (
                    <>
                      <Spinner />
                      Joining…
                    </>
                  ) : isSuccess ? (
                    "Joined ✓"
                  ) : (
                    "Join the waitlist"
                  )}
                </button>
              </div>

              {/* Status announced to screen readers. Not color-only:
                  includes an icon glyph + text. */}
              <p
                id="waitlist-status"
                role="status"
                aria-live="polite"
                className={[
                  "min-h-[1.25rem] text-sm",
                  status === "success"
                    ? "text-teal-glow"
                    : status === "error"
                      ? "text-rose-300"
                      : "text-ink-mute",
                ].join(" ")}
              >
                {message ? (
                  <span>
                    <span aria-hidden="true">
                      {status === "success" ? "✓ " : status === "error" ? "⚠ " : ""}
                    </span>
                    {message}
                  </span>
                ) : (
                  "No spam. Just one note when Holo is ready."
                )}
              </p>
            </form>
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin motion-reduce:animate-none"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
