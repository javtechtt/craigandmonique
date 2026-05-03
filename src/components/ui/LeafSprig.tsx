import { cn } from "@/lib/cn";

interface LeafSprigProps {
  className?: string;
  /** Stroke colour for stems and vein lines. Defaults to sage-dark. */
  color?: string;
  /** Leaf body fill. Defaults to a softer mid-sage. */
  leafColor?: string;
  /** Mirror horizontally. */
  flip?: boolean;
}

/**
 * Botanical sprig — flowing organic branch inspired by a watercolour
 * leaf study. A curving main stem, three sub-stems branching off, and
 * eleven leaves of varied shape and angle clustered along the branch.
 *
 * Pure SVG — no filters or rasters — so it scales cleanly. Different
 * fill opacities across the leaves create a subtle watercolour-style
 * variation in tone, and each leaf carries a thin midline vein for
 * the delicate hand-drawn feel.
 */
export function LeafSprig({
  className,
  color = "#6f7f69",
  leafColor = "#a7b5a0",
  flip = false,
}: LeafSprigProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 220 80"
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-auto opacity-90", className)}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <g
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Main branch — gentle S-curve from lower-left to upper-right */}
        <path
          d="M 12 62 Q 55 42, 100 46 Q 145 50, 200 28"
          stroke={color}
          strokeWidth="1.1"
          fill="none"
        />

        {/* Sub-stem 1 — left cluster, rising slightly */}
        <path
          d="M 38 56 Q 33 48, 30 38"
          stroke={color}
          strokeWidth="0.9"
          fill="none"
        />
        {/* Sub-stem 2 — central tall cluster, rising up to the main highlight */}
        <path
          d="M 88 47 Q 84 30, 86 14"
          stroke={color}
          strokeWidth="0.9"
          fill="none"
        />
        {/* Sub-stem 3 — right cluster, rising and arching outward */}
        <path
          d="M 155 47 Q 162 36, 168 22"
          stroke={color}
          strokeWidth="0.9"
          fill="none"
        />

        {/* === LEFT CLUSTER (around 30, 38) === */}
        {/* Leaf reaching up-left */}
        <path
          d="M 30 38 Q 22 32, 14 24 Q 22 30, 30 38 Z"
          fill={leafColor}
          fillOpacity="0.6"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.5"
        />
        <path d="M 30 38 L 17 27" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />

        {/* Leaf reaching up-right (the showpiece of this cluster) */}
        <path
          d="M 30 38 Q 36 26, 42 16 Q 35 28, 30 38 Z"
          fill={leafColor}
          fillOpacity="0.7"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.55"
        />
        <path d="M 30 38 L 38 21" stroke={color} strokeWidth="0.5" strokeOpacity="0.55" />

        {/* Leaf curling back down toward the main stem */}
        <path
          d="M 30 38 Q 24 46, 22 56 Q 28 48, 30 38 Z"
          fill={leafColor}
          fillOpacity="0.5"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.45"
        />
        <path d="M 30 38 L 25 49" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />

        {/* === CENTRAL CLUSTER (around 86, 14) === */}
        {/* Long leaf reaching up-left */}
        <path
          d="M 86 14 Q 76 8, 64 4 Q 76 8, 86 14 Z"
          fill={leafColor}
          fillOpacity="0.65"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.55"
        />
        <path d="M 86 14 L 70 8" stroke={color} strokeWidth="0.5" strokeOpacity="0.55" />

        {/* Tall leaf, near vertical, the highest point of the sprig */}
        <path
          d="M 86 14 Q 88 6, 92 -2 Q 90 6, 86 14 Z"
          fill={leafColor}
          fillOpacity="0.7"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.55"
        />
        <path d="M 86 14 L 90 4" stroke={color} strokeWidth="0.5" strokeOpacity="0.55" />

        {/* Leaf reaching up-right */}
        <path
          d="M 86 14 Q 96 8, 108 4 Q 96 12, 86 14 Z"
          fill={leafColor}
          fillOpacity="0.6"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.5"
        />
        <path d="M 86 14 L 100 8" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />

        {/* Lower-right leaf curving away from cluster */}
        <path
          d="M 86 14 Q 98 22, 110 28 Q 98 22, 86 14 Z"
          fill={leafColor}
          fillOpacity="0.55"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.5"
        />
        <path d="M 86 14 L 102 22" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />

        {/* === RIGHT CLUSTER (around 168, 22) === */}
        {/* Leaf reaching up-left */}
        <path
          d="M 168 22 Q 158 14, 148 8 Q 158 16, 168 22 Z"
          fill={leafColor}
          fillOpacity="0.6"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.55"
        />
        <path d="M 168 22 L 154 12" stroke={color} strokeWidth="0.5" strokeOpacity="0.55" />

        {/* Tall leaf reaching up-right */}
        <path
          d="M 168 22 Q 174 12, 180 0 Q 174 12, 168 22 Z"
          fill={leafColor}
          fillOpacity="0.65"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.55"
        />
        <path d="M 168 22 L 175 8" stroke={color} strokeWidth="0.5" strokeOpacity="0.55" />

        {/* Leaf reaching to the right tip */}
        <path
          d="M 168 22 Q 184 18, 198 12 Q 184 22, 168 22 Z"
          fill={leafColor}
          fillOpacity="0.55"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.5"
        />
        <path d="M 168 22 L 188 16" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" />

        {/* === SOLO LEAF AT THE BRANCH TIP (around 200, 28) === */}
        <path
          d="M 200 28 Q 210 22, 218 14 Q 210 22, 200 28 Z"
          fill={leafColor}
          fillOpacity="0.5"
          stroke={color}
          strokeWidth="0.6"
          strokeOpacity="0.45"
        />
        <path d="M 200 28 L 212 18" stroke={color} strokeWidth="0.5" strokeOpacity="0.45" />
      </g>
    </svg>
  );
}

export default LeafSprig;
