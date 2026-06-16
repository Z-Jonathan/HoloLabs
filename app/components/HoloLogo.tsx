/**
 * Holo brand wordmark — rounded vertical bars and hollow rings that
 * spell the mark in a geometric, minimal style. Drawn with `currentColor`
 * so it inherits the surrounding text color (ink) and themes automatically.
 *
 * `collapsed` is accepted for API compatibility with the nav, which used to
 * fold a separate text wordmark; the mark itself is already compact, so it
 * simply renders the full mark.
 */
export function HoloLogo({
  collapsed: _collapsed = false,
  className = "",
}: {
  collapsed?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <svg
        viewBox="0 0 116 44"
        className="h-5 w-auto shrink-0 text-ink"
        role="img"
        aria-label="Holo"
      >
        {/* Two tall bars */}
        <rect x="4" y="3" width="6" height="38" rx="3" fill="currentColor" />
        <rect x="22" y="3" width="6" height="38" rx="3" fill="currentColor" />
        {/* Ring */}
        <circle
          cx="48"
          cy="30"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
        {/* Tall bar */}
        <rect x="71" y="3" width="6" height="38" rx="3" fill="currentColor" />
        {/* Ring */}
        <circle
          cx="99"
          cy="30"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
      </svg>
    </span>
  );
}
