// Small hand-drawn-style SVG "stickers" composed inside YardSketch — these are what make
// each zone read as an illustrated garden bed instead of an icon in a rounded rectangle.

export function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-1.5} y={0} width={3} height={13} fill="#8a7860" />
      <circle cx={-7} cy={1} r={7.5} fill="#9bb48d" stroke="#3f362c" strokeWidth={1.1} />
      <circle cx={7} cy={1} r={7.5} fill="#9bb48d" stroke="#3f362c" strokeWidth={1.1} />
      <circle cx={0} cy={-5} r={9} fill="#a8c199" stroke="#3f362c" strokeWidth={1.1} />
    </g>
  );
}

export function Bench({ x, y, w = 18 }: { x: number; y: number; w?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="#3f362c" strokeWidth={1.2} fill="none" strokeLinecap="round">
      <line x1={0} y1={0} x2={w} y2={0} />
      <line x1={1.5} y1={0} x2={1.5} y2={5} />
      <line x1={w - 1.5} y1={0} x2={w - 1.5} y2={5} />
    </g>
  );
}

export function Flower({ x, y, hue = "#e79fc3" }: { x: number; y: number; hue?: string }) {
  const petalAngles = [0, 72, 144, 216, 288];
  return (
    <g transform={`translate(${x} ${y})`}>
      {petalAngles.map((deg) => (
        <ellipse key={deg} cx={0} cy={-2.6} rx={1.8} ry={2.6} fill={hue} opacity={0.9} transform={`rotate(${deg})`} />
      ))}
      <circle r={1.4} fill="#d99a34" />
      <line x1={0} y1={2} x2={0} y2={6} stroke="#6f8c5f" strokeWidth={1} />
    </g>
  );
}

export function SproutTick({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="#4f7a4a" strokeWidth={1.3} fill="none" strokeLinecap="round">
      <path d="M0,0 Q -2.5,-5 -1,-8.5" />
      <path d="M0,0 Q 2.5,-4.5 1,-7.5" />
    </g>
  );
}

export function Pebble({ x, y, r = 2 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill="#c9b98f" stroke="#8a7451" strokeWidth={0.6} />;
}

export function MotionSwoosh({ x, y, w = 20 }: { x: number; y: number; w?: number }) {
  return (
    <path
      d={`M ${x} ${y} Q ${x + w / 2} ${y - 6} ${x + w} ${y}`}
      stroke="#3f362c"
      strokeWidth={1.2}
      fill="none"
      strokeDasharray="2 3"
      strokeLinecap="round"
      opacity={0.5}
    />
  );
}

export function GrassTuft({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="#8fa370" strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.5}>
      <path d="M0,0 Q -2,-6 -3.5,-8" />
      <path d="M0,0 Q 0,-7 0,-9" />
      <path d="M0,0 Q 2,-6 3.5,-8" />
    </g>
  );
}

/** Two figures close together — the connection zone's shorthand for the mission doc's saucer-swing scene. */
export function TogetherPair({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={-4.5} cy={0} r={4.5} fill="#c98a6b" stroke="#3f362c" strokeWidth={0.8} opacity={0.9} />
      <circle cx={4.5} cy={0} r={4.5} fill="#e0a978" stroke="#3f362c" strokeWidth={0.8} opacity={0.9} />
    </g>
  );
}

export function MiniPond({ x, y, r = 8 }: { x: number; y: number; r?: number }) {
  return <ellipse cx={x} cy={y} rx={r} ry={r * 0.62} fill="#a9c9d6" stroke="#3f362c" strokeWidth={1} opacity={0.85} />;
}

export function PawPrint({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="#8a6a52" opacity={0.75}>
      <circle cx={0} cy={2} r={2.2} />
      <circle cx={-3} cy={-1.5} r={1.2} />
      <circle cx={0} cy={-2.6} r={1.2} />
      <circle cx={3} cy={-1.5} r={1.2} />
    </g>
  );
}

export function CloudPuff({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={0.5}>
      <circle cx={-5} cy={0} r={4.5} fill="#ffffff" stroke="#c9c0ae" strokeWidth={0.8} />
      <circle cx={4} cy={-1} r={5.5} fill="#ffffff" stroke="#c9c0ae" strokeWidth={0.8} />
      <circle cx={0} cy={2} r={4.5} fill="#ffffff" stroke="#c9c0ae" strokeWidth={0.8} />
    </g>
  );
}
