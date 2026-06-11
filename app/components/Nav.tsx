"use client";

import { useEffect, useState } from "react";
import { CTAButton } from "./CTAButton";

const links = [
  { href: "#concept", label: "Concept" },
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
];

/**
 * Sticky translucent nav. Its blur, background opacity, and border
 * intensify once the user scrolls away from the top.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
        <a
          href="#top"
          className="rounded-md text-lg font-semibold tracking-tight text-ink"
        >
          <span className="text-gradient">Holo</span>
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
