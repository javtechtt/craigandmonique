import { cn } from "@/lib/cn";

interface LeafSprigProps {
  className?: string;
  /** Stroke + leaf-fill colour. Defaults to sage-dark. */
  color?: string;
  /** Drop the dot to render a clean centered branch. */
  hideDot?: boolean;
  /** Mirror horizontally — useful when placing in a card corner. */
  flip?: boolean;
}

/**
 * Botanical sprig — horizontal branch with paired leaves and a small
 * dot accent to one side. Pure SVG so it scales with the surrounding
 * text and inherits no layout cost.
 *
 * Used in the hero, every section heading, the footer, and as a corner
 * embellishment on detail cards. Set `className` to control width via
 * Tailwind utilities (`w-32`, `w-40`, etc.).
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
        {!hideDot ? <circle cx="6" cy="18" r="1.6" fill={color} /> : null}

        {/* Main stem — gentle S-curve. */}
        <path d="M16 18 C 40 8, 70 6, 92 10 C 110 13, 132 14, 154 18" />

        {/* Upper-side leaves */}
        <path d="M30 14 Q 33 6, 42 8 Q 38 14, 30 14 Z" fill={color} fillOpacity="0.18" />
        <path d="M52 10 Q 56 2, 65 5 Q 60 12, 52 10 Z" fill={color} fillOpacity="0.18" />
        <path d="M76 9 Q 80 1, 90 4 Q 84 11, 76 9 Z" fill={color} fillOpacity="0.18" />
        <path d="M100 12 Q 104 4, 114 7 Q 108 14, 100 12 Z" fill={color} fillOpacity="0.18" />
        <path d="M124 14 Q 130 6, 140 10 Q 132 17, 124 14 Z" fill={color} fillOpacity="0.18" />

        {/* Lower-side leaves */}
        <path d="M40 22 Q 44 30, 51 27 Q 47 21, 40 22 Z" fill={color} fillOpacity="0.18" />
        <path d="M64 22 Q 68 30, 75 27 Q 71 21, 64 22 Z" fill={color} fillOpacity="0.18" />
        <path d="M88 22 Q 92 30, 100 27 Q 95 21, 88 22 Z" fill={color} fillOpacity="0.18" />
        <path d="M112 23 Q 117 30, 124 27 Q 119 22, 112 23 Z" fill={color} fillOpacity="0.18" />
      </g>
    </svg>
  );
}

export default LeafSprig;
