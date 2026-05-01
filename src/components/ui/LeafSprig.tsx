import { cn } from "@/lib/cn";

/**
 * Botanical ornament family.
 *
 * Every sprig shares the same drawing language — sage 1.1px line strokes,
 * low-opacity leaf fills, gentle organic curves — so the page reads as a
 * single set. The compositions, however, are deliberately distinct: a
 * horizontal undulating branch reads differently from a vertical upward
 * fan or a paired-leaf garland, which keeps the embellishments fresh
 * across the page rather than feeling like the same logo stamped
 * everywhere.
 *
 * Each component takes the same prop shape:
 *
 *   - `className` — control width with Tailwind utilities (`w-32`, etc.)
 *   - `color`     — stroke + fill colour, defaults to sage-dark hex
 *   - `flip`      — mirror horizontally (useful for opposing card corners)
 */

interface SprigProps {
  className?: string;
  color?: string;
  flip?: boolean;
}

const STROKE_WIDTH = 1.1;
const LEAF_FILL_OPACITY = 0.18;
const SPRIG_BASE = "h-auto opacity-90";
const DEFAULT_COLOR = "#6f7f69";

function flipStyle(flip: boolean) {
  return flip ? { transform: "scaleX(-1)" } : undefined;
}

/**
 * 1. Horizontal undulating branch with leaves on both sides and a dot to
 *    one side. Wide and decorative — best for hero-scale moments.
 */
export function WaveSprig({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 36"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <circle cx="6" cy="18" r="1.6" fill={color} />
        <path d="M16 18 C 40 8, 70 6, 92 10 C 110 13, 132 14, 154 18" />
        <path d="M30 14 Q 33 6, 42 8 Q 38 14, 30 14 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M52 10 Q 56 2, 65 5 Q 60 12, 52 10 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M76 9 Q 80 1, 90 4 Q 84 11, 76 9 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M100 12 Q 104 4, 114 7 Q 108 14, 100 12 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M124 14 Q 130 6, 140 10 Q 132 17, 124 14 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M40 22 Q 44 30, 51 27 Q 47 21, 40 22 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M64 22 Q 68 30, 75 27 Q 71 21, 64 22 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M88 22 Q 92 30, 100 27 Q 95 21, 88 22 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M112 23 Q 117 30, 124 27 Q 119 22, 112 23 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
      </g>
    </svg>
  );
}

/**
 * 2. Semicircular arch traced by leaves descending along the curve.
 */
export function ArchSprig({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 140 38"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M10 32 Q 70 0, 130 32" />
        {/* Left flank */}
        <path d="M22 24 Q 14 28, 18 34 Q 26 30, 22 24 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M40 14 Q 30 18, 34 26 Q 44 22, 40 14 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M62 6 Q 52 10, 56 18 Q 66 14, 62 6 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        {/* Right flank */}
        <path d="M78 6 Q 88 10, 84 18 Q 74 14, 78 6 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M100 14 Q 110 18, 106 26 Q 96 22, 100 14 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M118 24 Q 126 28, 122 34 Q 114 30, 118 24 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <circle cx="70" cy="2.5" r="1.4" fill={color} />
      </g>
    </svg>
  );
}

/**
 * 3. Upward fan — five leaves spreading from a single base point. Great
 *    above a tagline.
 */
export function SprayCluster({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 60"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M50 58 L 50 36" />
        {/* Far-left leaf */}
        <path d="M50 36 Q 28 26, 18 6 Q 36 18, 50 36 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        {/* Inner-left leaf */}
        <path d="M50 36 Q 38 22, 36 4 Q 46 18, 50 36 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        {/* Center stalk + leaf */}
        <path d="M50 36 Q 48 18, 50 0 Q 52 18, 50 36 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        {/* Inner-right leaf */}
        <path d="M50 36 Q 62 22, 64 4 Q 54 18, 50 36 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        {/* Far-right leaf */}
        <path d="M50 36 Q 72 26, 82 6 Q 64 18, 50 36 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <circle cx="50" cy="58" r="1.6" fill={color} />
      </g>
    </svg>
  );
}

/**
 * 4. Olive-style horizontal branch with paired narrow ovals along its
 *    length. Reads as a more formal classical garland.
 */
export function OliveBranch({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 32"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 16 Q 80 12, 152 16" fill="none" />
        {/* Paired oval leaves at intervals */}
        <ellipse cx="32" cy="9" rx="7" ry="2.4" transform="rotate(-15 32 9)" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <ellipse cx="32" cy="22" rx="7" ry="2.4" transform="rotate(15 32 22)" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <ellipse cx="60" cy="6" rx="8" ry="2.6" transform="rotate(-12 60 6)" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <ellipse cx="60" cy="25" rx="8" ry="2.6" transform="rotate(12 60 25)" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <ellipse cx="90" cy="5" rx="8" ry="2.6" transform="rotate(-10 90 5)" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <ellipse cx="90" cy="26" rx="8" ry="2.6" transform="rotate(10 90 26)" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <ellipse cx="120" cy="6" rx="8" ry="2.6" transform="rotate(-12 120 6)" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <ellipse cx="120" cy="25" rx="8" ry="2.6" transform="rotate(12 120 25)" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <ellipse cx="146" cy="9" rx="6" ry="2.2" transform="rotate(-15 146 9)" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <ellipse cx="146" cy="22" rx="6" ry="2.2" transform="rotate(15 146 22)" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
      </g>
    </svg>
  );
}

/**
 * 5. Asymmetric stem with leaves only on the upper side and a small
 *    terminal dot.
 */
export function SingleStem({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 130 26"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M6 18 Q 65 14, 124 18" />
        <path d="M22 14 Q 17 4, 28 4 Q 26 12, 22 14 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M44 11 Q 39 1, 52 1 Q 50 9, 44 11 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M68 10 Q 64 0, 76 0 Q 74 8, 68 10 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M92 12 Q 87 2, 100 2 Q 98 10, 92 12 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <circle cx="124" cy="18" r="1.4" fill={color} />
      </g>
    </svg>
  );
}

/**
 * 6. Two narrow tapered leaves crossing at the base. Compact, square
 *    aspect — useful as a centred ornament or a card corner.
 */
export function TwinLeaves({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 60"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M30 52 Q 14 36, 9 8 Q 22 30, 30 52 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M30 52 Q 46 36, 51 8 Q 38 30, 30 52 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <circle cx="30" cy="54" r="1.4" fill={color} />
      </g>
    </svg>
  );
}

/**
 * 7. Curling vine — single asymmetric stroke with hanging teardrop
 *    leaves and a final tendril curl.
 */
export function VineCurl({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 130 36"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M6 12 C 30 6, 60 14, 84 10 S 116 8, 122 22 Q 120 30, 110 28 Q 108 22, 116 22" />
        <path d="M22 10 Q 18 22, 26 22 Q 28 14, 22 10 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M44 14 Q 38 26, 48 26 Q 50 18, 44 14 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M66 12 Q 60 24, 70 24 Q 72 16, 66 12 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M88 10 Q 82 22, 92 22 Q 94 14, 88 10 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
      </g>
    </svg>
  );
}

/**
 * 8. Compact corner spray — three leaves fanning from a corner anchor.
 */
export function CornerSpray({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 50 50"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Anchor at bottom-left, three leaves fanning to upper-right */}
        <path d="M8 42 Q 16 24, 18 6 Q 20 26, 8 42 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M8 42 Q 24 28, 38 18 Q 24 32, 8 42 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M8 42 Q 22 34, 42 32 Q 26 38, 8 42 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <circle cx="8" cy="42" r="1.4" fill={color} />
      </g>
    </svg>
  );
}

/**
 * Backwards-compatible default export so existing call sites that import
 * `LeafSprig` keep working with the wave silhouette they were already
 * rendering.
 *
 * Accepts a `hideDot` prop that maps to the wave variant only.
 */
interface LegacyLeafSprigProps extends SprigProps {
  hideDot?: boolean;
}

export function LeafSprig({
  className,
  color = DEFAULT_COLOR,
  flip = false,
  hideDot = false,
}: LegacyLeafSprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 36"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {!hideDot ? <circle cx="6" cy="18" r="1.6" fill={color} /> : null}
        <path d="M16 18 C 40 8, 70 6, 92 10 C 110 13, 132 14, 154 18" />
        <path d="M30 14 Q 33 6, 42 8 Q 38 14, 30 14 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M52 10 Q 56 2, 65 5 Q 60 12, 52 10 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M76 9 Q 80 1, 90 4 Q 84 11, 76 9 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M100 12 Q 104 4, 114 7 Q 108 14, 100 12 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M124 14 Q 130 6, 140 10 Q 132 17, 124 14 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M40 22 Q 44 30, 51 27 Q 47 21, 40 22 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M64 22 Q 68 30, 75 27 Q 71 21, 64 22 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M88 22 Q 92 30, 100 27 Q 95 21, 88 22 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
        <path d="M112 23 Q 117 30, 124 27 Q 119 22, 112 23 Z" fill={color} fillOpacity={LEAF_FILL_OPACITY} />
      </g>
    </svg>
  );
}

export default LeafSprig;
