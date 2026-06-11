import { ElementType, ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Adds a hover lift + brighter specular highlight. */
  interactive?: boolean;
};

/**
 * Frosted, refractive glass surface with a faint top specular highlight.
 * Layered shadows and a 1px light border give it polished depth.
 */
export function GlassCard({
  children,
  as: Tag = "div",
  className = "",
  interactive = false,
}: GlassCardProps) {
  return (
    <Tag
      className={[
        "glass-surface glass-specular relative overflow-hidden rounded-glass-lg",
        interactive
          ? "transition-[transform,box-shadow,background-color] duration-300 ease-out hover:-translate-y-1 hover:bg-glass-strong hover:shadow-glass-lg"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}
