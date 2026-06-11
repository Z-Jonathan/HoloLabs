"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "../lib/useReducedMotion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds. */
  delay?: number;
  /** Distance the element rises from, in px. */
  y?: number;
};

/**
 * Scroll-reveal wrapper: fades + rises + subtly scales into view once.
 * Under reduced-motion it renders a short, motion-free fade instead.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
}: RevealProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.3, delay: Math.min(delay, 0.1) }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
