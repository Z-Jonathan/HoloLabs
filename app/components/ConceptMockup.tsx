"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { GlassCard } from "./GlassCard";
import { Reveal } from "./Reveal";
import { usePrefersReducedMotion } from "../lib/useReducedMotion";

/**
 * The signature visual: a stylized two-panel interface inside one glass frame.
 * LEFT = abstract "webcam" viewport (animated silhouette — NOT a real camera).
 * RIGHT = the Holo avatar, an abstract glassy orb-figure (NOT a real 3D signer).
 * A faint "translation" stream connects the two panels.
 * Everything here is decorative; it communicates the concept only.
 */
export function ConceptMockup() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const rotate = useTransform(scrollYProgress, [0, 1], [1.5, -1.5]);

  return (
    <section
      id="concept"
      ref={ref}
      className="relative mx-auto max-w-content scroll-mt-24 px-6 py-24 sm:py-32"
    >
      <Reveal className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-cyan-glow">
          Two-way, in real time
        </p>
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          You sign. Holo signs back.
        </h2>
        <p className="mt-5 text-pretty text-lg text-ink-soft">
          One panel sees you. The other is Holo — an expressive 3D signer who
          responds in fluent sign, not captions. No typing, no waiting, no
          interpreter in the middle.
        </p>
      </Reveal>

      <motion.div style={reduced ? undefined : { y, rotate }}>
        <GlassCard className="mx-auto max-w-5xl p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            <WebcamPanel reduced={reduced} />
            <AvatarPanel reduced={reduced} />
          </div>

          {/* Translation connection between panels (decorative). */}
          <div
            aria-hidden="true"
            className="relative mt-3 hidden h-px items-center md:flex"
          >
            <div className="h-px w-full bg-gradient-to-r from-cyan-glow/0 via-cyan-glow/50 to-violet-glow/0" />
            <span className="absolute left-0 top-1/2 h-1.5 w-24 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-glow to-violet-glow blur-[2px] motion-safe:animate-flow-x" />
          </div>

          <div className="flex items-center justify-between px-2 py-3 text-xs text-ink-mute">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-glow motion-safe:animate-pulse-soft" />
              Live preview — illustrative mockup
            </span>
            <span>ASL · real time</span>
          </div>
        </GlassCard>
      </motion.div>
    </section>
  );
}

function PanelShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-glass border border-glass-border bg-base-900/60 sm:aspect-square">
      <span className="absolute left-3 top-3 z-10 rounded-full bg-base-900/60 px-2.5 py-1 text-[11px] font-medium text-ink-soft backdrop-blur-glass">
        {label}
      </span>
      {children}
    </div>
  );
}

/** Abstract animated silhouette standing in for a camera feed. */
function WebcamPanel({ reduced }: { reduced: boolean }) {
  return (
    <PanelShell label="You">
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_30%,rgba(62,200,255,0.18),transparent_70%)]" />
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Abstract silhouette of a person signing into a camera"
      >
        <defs>
          <linearGradient id="figureGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#56e1ff" />
            <stop offset="100%" stopColor="#7c5cff" />
          </linearGradient>
        </defs>
        {/* Head + torso silhouette */}
        <g fill="url(#figureGrad)" opacity="0.85">
          <circle cx="100" cy="74" r="26" />
          <path d="M58 200c0-30 19-54 42-54s42 24 42 54z" />
        </g>
        {/* Signing hands — gently animated to suggest motion */}
        <motion.circle
          cx="74"
          cy="128"
          r="10"
          fill="#9ff0ff"
          animate={reduced ? undefined : { cy: [128, 116, 128], cx: [74, 80, 74] }}
          transition={
            reduced
              ? undefined
              : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.circle
          cx="126"
          cy="120"
          r="10"
          fill="#c4b3ff"
          animate={reduced ? undefined : { cy: [120, 132, 120], cx: [126, 120, 126] }}
          transition={
            reduced
              ? undefined
              : {
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }
          }
        />
      </svg>
      {/* Scanline shimmer */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(86,225,255,0.06)_50%,transparent)] bg-[length:100%_8px]" />
    </PanelShell>
  );
}

/** Abstract glassy orb-figure standing in for the Holo 3D avatar. */
function AvatarPanel({ reduced }: { reduced: boolean }) {
  return (
    <PanelShell label="Holo">
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_35%,rgba(124,92,255,0.22),transparent_70%)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative h-32 w-32"
          animate={reduced ? undefined : { y: [0, -8, 0] }}
          transition={
            reduced
              ? undefined
              : { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }
        >
          {/* Core orb */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_140deg,theme(colors.violet.glow),theme(colors.cyan.glow),theme(colors.teal.glow),theme(colors.violet.glow))] opacity-80 blur-[2px]" />
          <div className="absolute inset-2 rounded-full bg-base-900/70 backdrop-blur-glass" />
          <div className="absolute inset-0 rounded-full shadow-[0_0_60px_-10px_rgba(124,92,255,0.6)]" />
          {/* Inner specular highlight */}
          <div className="absolute left-6 top-5 h-8 w-8 rounded-full bg-white/40 blur-md" />
          {/* Orbiting "hands" suggesting the avatar signing */}
          {!reduced && (
            <>
              <motion.span
                className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-cyan-glow"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                style={{ originX: "-40px", originY: "0px" }}
              />
              <motion.span
                className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-violet-glow"
                animate={{ rotate: -360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                style={{ originX: "44px", originY: "10px" }}
              />
            </>
          )}
        </motion.div>
      </div>
    </PanelShell>
  );
}
