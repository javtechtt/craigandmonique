import { cn } from "@/lib/cn";

interface LeafSprigProps {
  className?: string;
  /** Stroke + leaf-fill colour. Defaults to sage-dark. */
  color?: string;
  /** Drop the centre dot for a clean leaves-only branch. */
  hideDot?: boolean;
  /** Mirror horizontally (cosmetic — the sprig is already symmetric). */
  flip?: boolean;
}

/**
 * Botanical sprig — a straight stem with four mirrored leaf pairs and
 * a small centre dot. Symmetric across both vertical and horizontal
 * axes, drawn with thin sage strokes and a gentle leaf fill plus a
 * delicate midline vein per leaf for the editorial feel of a hand-
 * drawn laurel.
 */
export function LeafSprig({
  className,
  color = "#6f7f69",
  hideDot = false,
  flip = false,
}: LeafSprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 36"
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-auto opacity-90", className)}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <g
        stroke={color}
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Straight horizontal stem */}
        <path d="M14 18 H 146" />

        {!hideDot ? <circle cx="80" cy="18" r="1.6" fill={color} /> : null}

        {/* === LEFT HALF — 4 leaves pointing up- and down-left === */}
        {/* Outer-left, upper */}
        <path
          d="M30 18 Q 23 10, 18 6 Q 25 13, 30 18 Z"
          fill={color}
          fillOpacity="0.18"
        />
        <path
          d="M30 18 L 21 8"
          strokeWidth="0.55"
          strokeOpacity="0.55"
        />
        {/* Outer-left, lower */}
        <path
          d="M30 18 Q 23 26, 18 30 Q 25 23, 30 18 Z"
          fill={color}
          fillOpacity="0.18"
        />
        <path
          d="M30 18 L 21 28"
          strokeWidth="0.55"
          strokeOpacity="0.55"
        />
        {/* Inner-left, upper */}
        <path
          d="M55 18 Q 48 11, 42 7 Q 50 14, 55 18 Z"
          fill={color}
          fillOpacity="0.18"
        />
        <path
          d="M55 18 L 45 9"
          strokeWidth="0.55"
          strokeOpacity="0.55"
        />
        {/* Inner-left, lower */}
        <path
          d="M55 18 Q 48 25, 42 29 Q 50 22, 55 18 Z"
          fill={color}
          fillOpacity="0.18"
        />
        <path
          d="M55 18 L 45 27"
          strokeWidth="0.55"
          strokeOpacity="0.55"
        />

        {/* === RIGHT HALF — mirrored === */}
        {/* Inner-right, upper */}
        <path
          d="M105 18 Q 112 11, 118 7 Q 110 14, 105 18 Z"
          fill={color}
          fillOpacity="0.18"
        />
        <path
          d="M105 18 L 115 9"
          strokeWidth="0.55"
          strokeOpacity="0.55"
        />
        {/* Inner-right, lower */}
        <path
          d="M105 18 Q 112 25, 118 29 Q 110 22, 105 18 Z"
          fill={color}
          fillOpacity="0.18"
        />
        <path
          d="M105 18 L 115 27"
          strokeWidth="0.55"
          strokeOpacity="0.55"
        />
        {/* Outer-right, upper */}
        <path
          d="M130 18 Q 137 10, 142 6 Q 135 13, 130 18 Z"
          fill={color}
          fillOpacity="0.18"
        />
        <path
          d="M130 18 L 139 8"
          strokeWidth="0.55"
          strokeOpacity="0.55"
        />
        {/* Outer-right, lower */}
        <path
          d="M130 18 Q 137 26, 142 30 Q 135 23, 130 18 Z"
          fill={color}
          fillOpacity="0.18"
        />
        <path
          d="M130 18 L 139 28"
          strokeWidth="0.55"
          strokeOpacity="0.55"
        />
      </g>
    </svg>
  );
}

export default LeafSprig;
