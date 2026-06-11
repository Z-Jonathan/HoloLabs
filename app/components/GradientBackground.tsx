"use client";

import { useScroll, useTransform, motion } from "motion/react";
import { usePrefersReducedMotion } from "../lib/useReducedMotion";

/**
 * Slowly drifting aurora mesh of blurred blobs on a near-black canvas.
 * Parallaxes gently on scroll; falls back to a static mesh under
 * reduced-motion. Purely decorative.
 */
export function GradientBackground() {
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();

  // Gentle parallax drift tied to scroll progress.
  const yViolet = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const yCyan = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const yTeal = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-base"
    >
      {/* Radial vignette to anchor the dark canvas. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,rgba(124,92,255,0.10),transparent_55%)]" />

      <motion.div
        style={reduced ? undefined : { y: yViolet }}
        className="absolute -left-[10%] top-[2%] h-[46vw] w-[46vw] rounded-full bg-violet-glow/30 blur-aurora animate-drift-a"
      />
      <motion.div
        style={reduced ? undefined : { y: yCyan }}
        className="absolute right-[-8%] top-[24%] h-[42vw] w-[42vw] rounded-full bg-cyan-glow/25 blur-aurora animate-drift-b"
      />
      <motion.div
        style={reduced ? undefined : { y: yTeal }}
        className="absolute bottom-[-6%] left-[20%] h-[48vw] w-[48vw] rounded-full bg-teal-glow/20 blur-aurora animate-drift-c"
      />

      {/* Fade to deep base at the bottom for legibility. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(5,6,10,0.6)_100%)]" />
    </div>
  );
}
