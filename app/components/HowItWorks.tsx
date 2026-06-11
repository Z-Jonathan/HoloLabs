import { GlassCard } from "./GlassCard";
import { Reveal } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Sign naturally",
    body: "Face your camera and sign the way you always do. Holo reads your hands, face, and movement.",
  },
  {
    n: "02",
    title: "Holo understands",
    body: "Your signing is interpreted on the fly, capturing meaning and nuance — not just word-for-word.",
  },
  {
    n: "03",
    title: "Holo signs back",
    body: "A 3D avatar responds in expressive, fluid sign language, so the conversation flows both ways.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative mx-auto max-w-content scroll-mt-24 px-6 py-24 sm:py-32"
    >
      <Reveal className="mx-auto mb-14 max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-teal-glow">
          How it works
        </p>
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Three steps to a real conversation.
        </h2>
      </Reveal>

      <ol className="grid list-none grid-cols-1 gap-5 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.n} className="h-full">
            <Reveal delay={i * 0.12} className="h-full">
              <GlassCard interactive className="h-full p-7">
                <span className="text-sm font-semibold text-cyan-glow">
                  {step.n}
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-pretty text-ink-soft">{step.body}</p>
              </GlassCard>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
