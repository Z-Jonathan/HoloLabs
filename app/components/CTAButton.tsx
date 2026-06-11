import { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "secondary";

type CTAButtonProps = {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  className?: string;
} & ComponentPropsWithoutRef<"button">;

const base =
  "group relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-glass px-6 py-3 text-sm font-medium tracking-tight transition-[transform,box-shadow,filter] duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-none active:translate-y-0";

const variants: Record<Variant, string> = {
  primary:
    "text-white shadow-glass [background:linear-gradient(120deg,theme(colors.violet.DEFAULT),theme(colors.cyan.DEFAULT))] hover:brightness-110 hover:shadow-glow",
  secondary:
    "glass-surface glass-specular text-ink hover:bg-glass-strong",
};

/**
 * Liquid-glass CTA. Renders an anchor when `href` is set, otherwise a button.
 * Both variants lift and brighten on hover; the specular sweep is decorative.
 */
export function CTAButton({
  children,
  variant = "primary",
  href,
  className = "",
  ...rest
}: CTAButtonProps) {
  const classes = [base, variants[variant], className].join(" ");

  const inner = (
    <>
      {/* Decorative specular sweep on hover. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full rounded-[inherit] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.25),transparent)] transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    );
  }

  return (
    <button className={classes} {...rest}>
      {inner}
    </button>
  );
}
