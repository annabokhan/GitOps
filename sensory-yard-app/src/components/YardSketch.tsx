import { Zone, ZoneId } from "@/lib/types";
import { yardLayout, SKETCH_VIEWBOX, VIEW_W, VIEW_H, HOUSE_H } from "@/lib/layout";
import { ZONE_SWATCH } from "@/lib/zones";
import { blobPath, wobblyRectPoints, smoothClosedPath, Point } from "@/lib/blob";
import { hashSeed, makeRandom } from "@/lib/seededRandom";
import { Tree, Bench, Flower, SproutTick, Pebble, MotionSwoosh, GrassTuft, CloudPuff, TogetherPair } from "./sketch/doodles";

const INK = "#3f362c";

/**
 * Design doc §5.4: the report's lead visual — an illustrated, hand-drawn-
 * style layout sketch, not a bare-bones diagram. Organic garden-bed
 * shapes (not rounded rectangles) via lib/blob.ts, a fenced yard
 * boundary, a house, a path, grass texture, and per-zone doodles that
 * match what that zone actually is. Every shape is seeded from the
 * report id + zone id, not Math.random(), so server and client render
 * identically (no hydration mismatch) while still varying per report.
 *
 * Deliberately schematic, not to-scale — see lib/layout.ts.
 */
export default function YardSketch({ zones, seed: seedInput }: { zones: Zone[]; seed?: string }) {
  const cells = yardLayout(zones.length);
  const baseSeed = hashSeed(seedInput || zones.map((z) => z.id).join("-"));

  const boundaryPoints = wobblyRectPoints(6, HOUSE_H, VIEW_W - 12, VIEW_H - HOUSE_H - 8, baseSeed ^ 0x9e3779b9, 5, 6);
  const boundaryPath = smoothClosedPath(boundaryPoints);

  const grassRand = makeRandom(baseSeed ^ 0x2545f491);
  const grassTufts = Array.from({ length: 18 }, (_, i) => ({
    x: 20 + grassRand() * (VIEW_W - 40),
    y: HOUSE_H + 14 + grassRand() * (VIEW_H - HOUSE_H - 30),
    key: i,
  }));

  const cloudRand = makeRandom(baseSeed ^ 0x27d4eb2f);

  return (
    <figure className="rounded-2xl border border-line bg-cream p-3">
      <svg viewBox={SKETCH_VIEWBOX} className="h-auto w-full" role="img" aria-label="Illustrated sketch of the suggested yard layout">
        <defs>
          <filter id="sketchWobble" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.2" />
          </filter>
        </defs>

        {/* sky clouds, purely atmospheric */}
        <CloudPuff x={40 + cloudRand() * 30} y={16} scale={0.8} />
        <CloudPuff x={330 + cloudRand() * 20} y={20} scale={0.65} />

        {/* grass texture, drawn first so zone shapes sit on top */}
        <g>
          {grassTufts.map((g) => (
            <GrassTuft key={g.key} x={g.x} y={g.y} />
          ))}
        </g>

        {/* fence-line yard boundary */}
        <path d={boundaryPath} fill="none" stroke={INK} strokeWidth={2} opacity={0.55} filter="url(#sketchWobble)" />
        {boundaryPoints
          .filter((_, i) => i % 2 === 0)
          .map(([px, py], i) => (
            <line key={i} x1={px} y1={py - 3.5} x2={px} y2={py + 3.5} stroke={INK} strokeWidth={1} opacity={0.3} />
          ))}

        {/* house: roof + body + door */}
        <g filter="url(#sketchWobble)">
          <path d="M158,26 L200,4 L242,26 Z" fill="#e7ddcd" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
          <rect x={168} y={26} width={64} height={20} fill="#fffdf8" stroke={INK} strokeWidth={1.8} />
          <rect x={194} y={34} width={11} height={12} fill="#c9b98f" stroke={INK} strokeWidth={1.2} />
        </g>

        {/* path from the house into the yard */}
        <path
          d={`M200,46 C196,${HOUSE_H + 15} 206,${HOUSE_H + 30} 200,${HOUSE_H + 46}`}
          stroke="#c9b98f"
          strokeWidth={2.5}
          strokeDasharray="1 5"
          strokeLinecap="round"
          fill="none"
          opacity={0.7}
        />

        {zones.map((zone, i) => {
          const cell = cells[i];
          if (!cell) return null;
          const cx = cell.x + cell.w / 2;
          const cy = cell.y + cell.h / 2;
          const rx = cell.w / 2 - 5;
          const ry = cell.h / 2 - 5;
          const zoneSeed = baseSeed ^ hashSeed(`${zone.id}-${i}`);
          const shapePath = blobPath(cx, cy, rx, ry, zoneSeed, 0.24, 11);
          const decoRand = makeRandom(zoneSeed ^ 0x85ebca6b);

          return (
            <g key={zone.id}>
              <path
                d={shapePath}
                fill={ZONE_SWATCH[zone.id]}
                stroke={INK}
                strokeWidth={1.6}
                filter="url(#sketchWobble)"
              />
              {zoneDecorations(zone.id, decoRand, cx, cy, rx, ry)}
              <text x={cx} y={cy + 8} textAnchor="middle" fontSize={24}>
                {zone.icon}
              </text>
              <circle cx={cell.x + 17} cy={cell.y + 17} r={11} fill="#fffdf8" stroke={INK} strokeWidth={1.4} />
              <text x={cell.x + 17} y={cell.y + 21} textAnchor="middle" fontSize={12} fontWeight={700} fill={INK}>
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-xs text-bark-soft">
        A rough layout, not to scale — shuffle these around to fit your actual yard.
      </figcaption>
    </figure>
  );
}

function within(cx: number, cy: number, rx: number, ry: number, fracX: number, fracY: number): Point {
  return [cx + fracX * rx, cy + fracY * ry];
}

function zoneDecorations(zoneId: ZoneId, rand: () => number, cx: number, cy: number, rx: number, ry: number) {
  switch (zoneId) {
    case "movement": {
      const [sx, sy] = within(cx, cy, rx, ry, -0.55, 0.45);
      const [sx2, sy2] = within(cx, cy, rx, ry, -0.5, 0.65);
      return (
        <>
          <MotionSwoosh x={sx} y={sy} w={rx * 0.65} />
          <MotionSwoosh x={sx2} y={sy2} w={rx * 0.45} />
        </>
      );
    }
    case "texture": {
      return (
        <>
          {Array.from({ length: 7 }, (_, i) => {
            const [dx, dy] = within(cx, cy, rx, ry, (rand() - 0.5) * 1.4, (rand() - 0.5) * 1.4);
            return <Pebble key={i} x={dx} y={dy} r={1.4 + rand() * 1.6} />;
          })}
        </>
      );
    }
    case "calm": {
      const [tx, ty] = within(cx, cy, rx, ry, -0.55, -0.4);
      const [bx, by] = within(cx, cy, rx, ry, 0.15, 0.55);
      return (
        <>
          <Tree x={tx} y={ty} scale={0.9} />
          <Bench x={bx} y={by} />
        </>
      );
    }
    case "taste-smell": {
      return (
        <>
          {Array.from({ length: 4 }, (_, i) => {
            const [sx, sy] = within(cx, cy, rx, ry, -0.6 + i * 0.42, 0.55);
            return <SproutTick key={i} x={sx} y={sy} />;
          })}
        </>
      );
    }
    case "visual": {
      const hues = ["#e79fc3", "#f0b45c", "#c9a6e0"];
      return (
        <>
          {Array.from({ length: 3 }, (_, i) => {
            const [fx, fy] = within(cx, cy, rx, ry, -0.5 + i * 0.5, 0.5 + rand() * 0.12);
            return <Flower key={i} x={fx} y={fy} hue={hues[i % hues.length]} />;
          })}
        </>
      );
    }
    case "connection": {
      const [bx, by] = within(cx, cy, rx, ry, 0, 0.5);
      const [px, py] = within(cx, cy, rx, ry, 0, -0.45);
      return (
        <>
          <Bench x={bx - 9} y={by} w={18} />
          <TogetherPair x={px} y={py} />
        </>
      );
    }
    default:
      return null;
  }
}
