import { cn } from "@/lib/cn";

interface LeafSprigProps {
  className?: string;
  /** Stroke + vein colour. Defaults to sage-dark. */
  color?: string;
  /** Leaf body fill. Defaults to a softer mid-sage. */
  leafColor?: string;
  /** Mirror horizontally. */
  flip?: boolean;
}

/**
 * Botanical sprig — flowing olive / eucalyptus-style branch with five
 * pairs of tapered oval leaves cascading down a soft S-curving stem.
 * Reads as a romantic wedding ornament: classic silhouette, gentle
 * organic curves, paired leaves at varied lengths, subtle midline
 * veins. Two alternating leaf opacities give a watercolour-style
 * sense of depth without resorting to filters or rasters.
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
      viewBox="0 0 240 80"
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-auto opacity-95", className)}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* Main stem — gentle S-curve, dipping then rising to the tip */}
      <path
        d="M 12 32 C 48 22, 96 40, 132 44 S 198 56, 228 50"
        stroke={color}
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />

      {/* Pair 1 — leftmost, smaller leaves */}
      <Leaf cx={34} cy={28} angle={-32} length={11} width={3.6} fill={leafColor} stroke={color} alt />
      <Leaf cx={34} cy={28} angle={42} length={9} width={3.2} fill={leafColor} stroke={color} />

      {/* Pair 2 */}
      <Leaf cx={72} cy={32} angle={-46} length={14} width={4.4} fill={leafColor} stroke={color} />
      <Leaf cx={72} cy={32} angle={36} length={12} width={3.8} fill={leafColor} stroke={color} alt />

      {/* Pair 3 — center, the showpiece pair */}
      <Leaf cx={120} cy={43} angle={-52} length={16} width={5} fill={leafColor} stroke={color} alt />
      <Leaf cx={120} cy={43} angle={42} length={14} width={4.5} fill={leafColor} stroke={color} />

      {/* Pair 4 */}
      <Leaf cx={170} cy={50} angle={-44} length={13} width={4.2} fill={leafColor} stroke={color} />
      <Leaf cx={170} cy={50} angle={48} length={11} width={3.6} fill={leafColor} stroke={color} alt />

      {/* Pair 5 — rightmost, smaller toward the tip */}
      <Leaf cx={208} cy={51} angle={-38} length={10} width={3.4} fill={leafColor} stroke={color} alt />
      <Leaf cx={208} cy={51} angle={46} length={8} width={3} fill={leafColor} stroke={color} />

      {/* Tiny terminal accent — a bud at the very tip of the stem */}
      <circle cx="228" cy="50" r="1.7" fill={color} />
    </svg>
  );
}

interface LeafProps {
  cx: number;
  cy: number;
  /** Rotation in degrees from horizontal. Negative = upward, positive = downward. */
  angle: number;
  length: number;
  width: number;
  fill: string;
  stroke: string;
  /** Render with the alternate (lighter) opacity. */
  alt?: boolean;
}

/**
 * One tapered oval leaf, rotated to sit on the stem at the supplied
 * angle. Drawn as a pair of quadratic curves so the silhouette tapers
 * to a point at both ends. Inner midline vein adds the hand-drawn
 * botanical feel.
 */
function Leaf({
  cx,
  cy,
  angle,
  length,
  width,
  fill,
  stroke,
  alt = false,
}: LeafProps) {
  // Leaf path is drawn in local coordinates around (0, 0) pointing
  // along positive x; the wrapping <g> rotates and translates it
  // into place. Base sits at x=0, tip at x=length.
  const w = width;
  const path = `M 0 0 Q ${length * 0.4} -${w} ${length} 0 Q ${length * 0.4} ${w} 0 0 Z`;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <path
        d={path}
        fill={fill}
        fillOpacity={alt ? 0.5 : 0.7}
        stroke={stroke}
        strokeWidth="0.55"
        strokeOpacity="0.6"
        strokeLinejoin="round"
      />
      {/* Midline vein from base to ~85% of length */}
      <line
        x1={1}
        y1={0}
        x2={length * 0.85}
        y2={0}
        stroke={stroke}
        strokeWidth="0.45"
        strokeOpacity="0.55"
      />
    </g>
  );
}

export default LeafSprig;
