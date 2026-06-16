"use client";

import { useScroll, useTransform, motion } from "motion/react";
import { usePrefersReducedMotion } from "../lib/useReducedMotion";

/**
 * Slowly drifting aurora mesh of softly blurred pastel blobs on the warm
 * ivory canvas. Parallaxes gently on scroll; falls back to a static mesh
 * under reduced-motion. Purely decorative and kept very subtle.
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
      {/* Soft warm wash at the top to gently lift the canvas. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,rgba(108,92,224,0.06),transparent_55%)]" />

      <motion.div
        style={reduced ? undefined : { y: yViolet }}
        className="absolute -left-[10%] top-[2%] h-[46vw] w-[46vw] rounded-full bg-violet-glow/10 blur-aurora animate-drift-a"
      />
      <motion.div
        style={reduced ? undefined : { y: yCyan }}
        className="absolute right-[-8%] top-[24%] h-[42vw] w-[42vw] rounded-full bg-cyan-glow/10 blur-aurora animate-drift-b"
      />
      <motion.div
        style={reduced ? undefined : { y: yTeal }}
        className="absolute bottom-[-6%] left-[20%] h-[48vw] w-[48vw] rounded-full bg-teal-glow/[0.08] blur-aurora animate-drift-c"
      />

      {/* Fade to the ivory canvas at the bottom for a clean finish. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(247,245,239,0.8)_100%)]" />
    </div>
  );
}
