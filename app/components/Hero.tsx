"use client";

import { motion } from "motion/react";
import { CTAButton } from "./CTAButton";
import { usePrefersReducedMotion } from "../lib/useReducedMotion";

export function Hero() {
  const reduced = usePrefersReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduced ? 0.04 : 0.12 },
    },
  };

  const item = reduced
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.3 } },
      }
    : {
        hidden: { opacity: 0, y: 28 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
        },
      };

  return (
    <section
      id="top"
      className="relative mx-auto flex min-h-[92vh] max-w-content flex-col items-center justify-center px-6 pb-24 pt-40 text-center"
    >
      {/* Soft glow behind the headline. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -z-[1] h-[40vh] w-[80vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-glow/20 blur-aurora motion-safe:animate-pulse-soft"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center"
      >
        <motion.p
          variants={item}
          className="glass-surface mb-8 rounded-full px-4 py-1.5 text-sm text-ink-soft"
        >
          Real-time sign language translation
        </motion.p>

        <motion.h1
          variants={item}
          className="max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          Conversations <span className="text-gradient">without barriers.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-8 max-w-2xl text-pretty text-lg text-ink-soft sm:text-xl"
        >
          Holo translates sign language in real time. Sign into your camera, and
          a lifelike 3D avatar signs right back — a natural, two-way
          conversation in your own language.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <CTAButton href="#waitlist">Join the waitlist</CTAButton>
          <CTAButton href="#how" variant="secondary">
            See how it works
          </CTAButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
