import { cn } from "@/lib/cn";

/**
 * Botanical ornament family.
 *
 * Every variant is hand-drawn with the same brush — sage 1px line strokes,
 * pointed almond-shaped leaves, optional thin inner veins, no fills — so
 * the page reads like a coordinated botanical study rather than a single
 * shape stamped everywhere.
 *
 * Each variant takes the same prop shape:
 *   className — width via Tailwind utilities (`w-32`, etc.)
 *   color     — stroke colour, defaults to sage-dark
 *   flip      — mirror horizontally (useful for opposing card corners)
 */

interface SprigProps {
  className?: string;
  color?: string;
  flip?: boolean;
}

const STROKE = 1;
const VEIN_STROKE = 0.55;
const VEIN_OPACITY = 0.55;
const DEFAULT_COLOR = "#6f7f69";
const SPRIG_BASE = "h-auto opacity-90";

function flipStyle(flip: boolean) {
  return flip ? { transform: "scaleX(-1)" } : undefined;
}

/**
 * 1. VerticalSprig — single upright stem with paired pointed leaves
 *    climbing in alternating directions. Reads like a young branch
 *    growing toward the light.
 */
export function VerticalSprig({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 130"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M30 124 Q 32 80, 30 40 Q 28 18, 30 6" />

        {/* Bottom-left leaf (largest) */}
        <path d="M30 108 Q 18 105, 6 96 Q 18 102, 30 108 Z" />
        <path
          d="M30 108 L 12 100"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        {/* Bottom-right leaf */}
        <path d="M30 96 Q 42 92, 54 80 Q 42 90, 30 96 Z" />
        <path
          d="M30 96 L 48 86"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        {/* Mid-left leaf */}
        <path d="M30 78 Q 18 73, 8 60 Q 18 70, 30 78 Z" />
        <path
          d="M30 78 L 14 66"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        {/* Mid-right leaf */}
        <path d="M30 62 Q 40 58, 50 46 Q 40 56, 30 62 Z" />
        <path
          d="M30 62 L 46 50"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        {/* Upper-left small */}
        <path d="M30 44 Q 22 40, 14 30 Q 22 38, 30 44 Z" />
        <path
          d="M30 44 L 18 34"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        {/* Top-right tiny */}
        <path d="M30 28 Q 36 24, 44 18 Q 36 24, 30 28 Z" />
      </g>
    </svg>
  );
}

/**
 * 2. PointedFan — five long pointed leaves fanning upward from a base
 *    point. Best above a tagline or heading.
 */
export function PointedFan({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 110 80"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Five leaves fanning from base at (55, 75) */}
        {/* Far-left leaf, ~45° to the left */}
        <path d="M55 75 Q 30 50, 12 22 Q 26 48, 55 75 Z" />
        <path
          d="M55 75 L 18 30"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        {/* Inner-left leaf, ~25° to the left */}
        <path d="M55 75 Q 40 45, 32 12 Q 46 44, 55 75 Z" />
        <path
          d="M55 75 L 36 22"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        {/* Center leaf, vertical */}
        <path d="M55 75 Q 51 40, 55 4 Q 59 40, 55 75 Z" />
        <path
          d="M55 75 L 55 10"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        {/* Inner-right leaf */}
        <path d="M55 75 Q 70 45, 78 12 Q 64 44, 55 75 Z" />
        <path
          d="M55 75 L 74 22"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        {/* Far-right leaf */}
        <path d="M55 75 Q 80 50, 98 22 Q 84 48, 55 75 Z" />
        <path
          d="M55 75 L 92 30"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />
      </g>
    </svg>
  );
}

/**
 * 3. HorizontalGarland — long horizontal stem with pointed leaves
 *    alternating above and below at irregular intervals.
 */
export function HorizontalGarland({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 180 40"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Wavy stem */}
        <path d="M6 20 C 50 15, 90 25, 130 18 S 168 22, 174 20" />

        {/* Top leaves */}
        <path d="M28 18 Q 20 8, 12 4 Q 20 10, 28 18 Z" />
        <path d="M62 17 Q 56 6, 50 2 Q 58 8, 62 17 Z" />
        <path d="M100 21 Q 94 9, 90 4 Q 98 11, 100 21 Z" />
        <path d="M138 17 Q 134 6, 130 2 Q 138 8, 138 17 Z" />

        {/* Bottom leaves */}
        <path d="M44 21 Q 50 32, 58 36 Q 50 30, 44 21 Z" />
        <path d="M82 22 Q 86 34, 94 38 Q 86 30, 82 22 Z" />
        <path d="M120 19 Q 124 32, 132 36 Q 124 28, 120 19 Z" />
        <path d="M158 21 Q 162 30, 168 34 Q 162 28, 158 21 Z" />

        {/* Optional dot at the right tip */}
        <circle cx="174" cy="20" r="1.3" fill={color} />
      </g>
    </svg>
  );
}

/**
 * 4. CrescentArc — gentle concave arc with leaves perpendicular to the
 *    curve. Distinct silhouette from the horizontal garland.
 */
export function CrescentArc({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 150 60"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Arc */}
        <path d="M10 50 Q 75 -2, 140 50" />

        {/* Leaves along the arc, fanning outward (perpendicular to curve) */}
        <path d="M22 38 Q 12 32, 4 22 Q 14 30, 22 38 Z" />
        <path d="M42 22 Q 32 14, 26 4 Q 36 14, 42 22 Z" />
        <path d="M64 12 Q 56 0, 56 -8 Q 62 4, 64 12 Z" />

        <path d="M86 12 Q 94 0, 94 -8 Q 88 4, 86 12 Z" />
        <path d="M108 22 Q 118 14, 124 4 Q 114 14, 108 22 Z" />
        <path d="M128 38 Q 138 32, 146 22 Q 136 30, 128 38 Z" />

        {/* Inner-curve leaves (smaller) */}
        <path
          d="M52 30 Q 50 38, 56 42 Q 56 36, 52 30 Z"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY + 0.15}
        />
        <path
          d="M98 30 Q 100 38, 94 42 Q 94 36, 98 30 Z"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY + 0.15}
        />

        {/* Crown dot */}
        <circle cx="75" cy="6" r="1.4" fill={color} />
      </g>
    </svg>
  );
}

/**
 * 5. DiagonalSpray — single curving stem rising diagonally with leaves
 *    branching off the upper edge.
 */
export function DiagonalSpray({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 140 80"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Diagonal curving stem from bottom-left to upper-right */}
        <path d="M8 72 Q 50 60, 80 38 Q 110 22, 132 8" />

        {/* Hanging teardrop leaves along the stem */}
        <path d="M28 66 Q 22 78, 32 78 Q 34 70, 28 66 Z" />
        <path
          d="M28 66 L 28 76"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        <path d="M50 60 Q 44 74, 54 74 Q 56 66, 50 60 Z" />
        <path
          d="M50 60 L 50 72"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        <path d="M72 48 Q 66 62, 76 62 Q 78 54, 72 48 Z" />
        <path
          d="M72 48 L 72 60"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        <path d="M96 30 Q 90 44, 100 44 Q 102 36, 96 30 Z" />

        {/* Small terminal flourish */}
        <circle cx="132" cy="8" r="1.4" fill={color} />
      </g>
    </svg>
  );
}

/**
 * 6. CrossLeaves — two long pointed leaves crossing at the base in an
 *    "X" silhouette. Pure leaves, no stem.
 */
export function CrossLeaves({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 90"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Left leaf — long, sweeping up-left */}
        <path d="M40 80 Q 14 56, 4 14 Q 22 48, 40 80 Z" />
        <path
          d="M40 80 L 10 22"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        {/* Right leaf — long, sweeping up-right */}
        <path d="M40 80 Q 66 56, 76 14 Q 58 48, 40 80 Z" />
        <path
          d="M40 80 L 70 22"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        {/* Tiny dot at base */}
        <circle cx="40" cy="84" r="1.4" fill={color} />
      </g>
    </svg>
  );
}

/**
 * 7. CurlVine — a single curling stroke with hanging teardrop leaves and
 *    a tendril spiral at one end.
 */
export function CurlVine({
  className,
  color = DEFAULT_COLOR,
  flip = false,
}: SprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 150 60"
      preserveAspectRatio="xMidYMid meet"
      className={cn(SPRIG_BASE, className)}
      style={flipStyle(flip)}
    >
      <g
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Vine — curving across with tendril curl at right */}
        <path d="M6 20 C 30 12, 60 28, 90 20 S 124 14, 132 32 Q 134 44, 124 44 Q 118 38, 126 36" />

        {/* Hanging leaves */}
        <path d="M22 18 Q 14 30, 24 32 Q 30 24, 22 18 Z" />
        <path
          d="M22 18 L 24 30"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        <path d="M46 24 Q 38 36, 48 38 Q 54 30, 46 24 Z" />
        <path
          d="M46 24 L 48 36"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        <path d="M70 22 Q 62 34, 72 36 Q 78 28, 70 22 Z" />
        <path
          d="M70 22 L 72 34"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        <path d="M94 20 Q 86 32, 96 34 Q 102 26, 94 20 Z" />
      </g>
    </svg>
  );
}

/**
 * 8. CornerCurl — small accent for a card corner: a curl with two tiny
 *    pointed leaves.
 */
export function CornerCurl({
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
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Curling stem from bottom-left toward upper-right with a small spiral end */}
        <path d="M6 44 Q 18 30, 26 18 Q 34 8, 42 8 Q 46 12, 42 14 Q 38 12, 42 8" />

        {/* Two leaves — one mid-stem, one near end */}
        <path d="M16 32 Q 22 26, 28 26 Q 22 32, 16 32 Z" />
        <path
          d="M16 32 L 26 28"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />

        <path d="M28 18 Q 26 10, 32 6 Q 30 14, 28 18 Z" />
        <path
          d="M28 18 L 30 8"
          strokeWidth={VEIN_STROKE}
          strokeOpacity={VEIN_OPACITY}
        />
      </g>
    </svg>
  );
}

/* ----------------------------------------------------------------- */
/* Backwards-compatible aliases for the old names. Existing callers   */
/* keep working with the new naturalistic illustration set.           */
/* ----------------------------------------------------------------- */

// Each alias points to a unique new variant — no two placements on the
// page render the same illustration.
export const WaveSprig = HorizontalGarland; // Hero
export const ArchSprig = CrescentArc; // Countdown
export const SprayCluster = PointedFan; // Wedding Details heading
export const OliveBranch = DiagonalSpray; // Gallery heading
export const SingleStem = VerticalSprig; // Footer
export const TwinLeaves = CrossLeaves; // RSVP heading
export const VineCurl = CurlVine; // Registry heading
export const CornerSpray = CornerCurl; // Event card corners

export const LeafSprig = HorizontalGarland;
export default HorizontalGarland;
