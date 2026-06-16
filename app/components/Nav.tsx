"use client";

import { useEffect, useState } from "react";
import { CTAButton } from "./CTAButton";
import { HoloLogo } from "./HoloLogo";

const links = [
  { href: "#concept", label: "Concept" },
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
];

/**
 * Sticky translucent nav. Its blur, background opacity, and border
 * intensify once the user scrolls away from the top. The HoloLabs logo
 * collapses to its two bars while scrolling down and expands again on
 * any upward scroll (or near the top).
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);

      // Near the top the full wordmark always shows.
      if (y < 96) {
        setCollapsed(false);
        lastY = y;
        return;
      }

      // Small jitters (momentum scrolling) shouldn't flip the state.
      const delta = y - lastY;
      if (Math.abs(delta) < 6) return;
      setCollapsed(delta > 0);
      lastY = y;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
      <nav
        aria-label="Primary"
        className={[
          "flex w-full max-w-content items-center justify-between rounded-glass px-4 py-2.5 transition-all duration-500 ease-out sm:px-6",
          scrolled
            ? "border border-glass-border bg-base-800/60 shadow-glass backdrop-blur-glass-lg"
            : "border border-transparent bg-transparent backdrop-blur-0",
        ].join(" ")}
      >
        <a href="#top" className="rounded-md" aria-label="HoloLabs — home">
          <HoloLogo collapsed={collapsed} />
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-glass px-3 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <CTAButton href="#waitlist" className="px-4 py-2 text-sm">
          Join waitlist
        </CTAButton>
      </nav>
    </header>
  );
}
