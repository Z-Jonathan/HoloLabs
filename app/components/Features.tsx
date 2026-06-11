import { GlassCard } from "./GlassCard";
import { Reveal } from "./Reveal";

const features = [
  {
    title: "Real-time response",
    body: "Low-latency translation that keeps pace with a real conversation.",
    icon: BoltIcon,
  },
  {
    title: "An avatar that's actually expressive",
    body: "Facial grammar, classifiers, and rhythm — the things that make signing language, not gesture.",
    icon: FaceIcon,
  },
  {
    title: "Private by design",
    body: "Built to keep your camera and your conversations yours.",
    icon: ShieldIcon,
  },
  {
    title: "Right in your browser",
    body: "No hardware, no install. Open a tab and start signing.",
    icon: BrowserIcon,
  },
  {
    title: "More languages, more signs",
    body: "Starting with one sign language and growing — ASL, BSL, and beyond on the roadmap.",
    icon: GlobeIcon,
  },
  {
    title: "Made with the Deaf community",
    body: "Designed alongside the people it's for, not just about them.",
    icon: HeartIcon,
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-content scroll-mt-24 px-6 py-24 sm:py-32"
    >
      <Reveal className="mx-auto mb-14 max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-violet-glow">
          Why Holo
        </p>
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Built for real, expressive conversation.
        </h2>
      </Reveal>

      <ul className="grid list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title} className="h-full">
              <Reveal delay={(i % 3) * 0.1} className="h-full">
                <GlassCard interactive className="h-full p-7">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-glass border border-glass-border bg-glass text-cyan-glow">
                    <Icon />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-pretty text-ink-soft">
                    {feature.body}
                  </p>
                </GlassCard>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* Decorative line icons — aria-hidden, meaning carried by the heading text. */
const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function BoltIcon() {
  return (
    <svg {...iconProps}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </svg>
  );
}

function FaceIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14a4 4 0 0 0 8 0" />
      <path d="M9 9h.01M15 9h.01" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function BrowserIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 6.5h.01M10 6.5h.01" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20z" />
    </svg>
  );
}
