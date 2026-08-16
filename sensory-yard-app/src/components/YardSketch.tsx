import { Zone } from "@/lib/types";
import { yardLayout, SKETCH_VIEWBOX, HOUSE_MARKER } from "@/lib/layout";
import { ZONE_SWATCH } from "@/lib/zones";

/**
 * Design doc §5.4: the report's lead visual — a rough, hand-drawn-style
 * layout sketch, not just text cards. The feTurbulence/feDisplacementMap
 * filter gives straight SVG rects a wobbly, sketched-by-hand line quality
 * without needing an external drawing library.
 *
 * Deliberately schematic, not to-scale (see lib/layout.ts) — this stays
 * honestly different from a measured site plan, which is what the paid
 * custom design package (PRD §7) would produce.
 */
export default function YardSketch({ zones }: { zones: Zone[] }) {
  const cells = yardLayout(zones.length);

  return (
    <figure className="rounded-2xl border border-line bg-cream p-3">
      <svg viewBox={SKETCH_VIEWBOX} className="h-auto w-full" role="img" aria-label="Rough sketch of the suggested yard layout">
        <defs>
          <filter id="sketchWobble" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
          </filter>
        </defs>

        {/* yard boundary */}
        <rect
          x={4}
          y={4}
          width={392}
          height={292}
          rx={4}
          fill="none"
          stroke="#3f362c"
          strokeWidth={2}
          strokeDasharray="7 6"
          opacity={0.55}
          filter="url(#sketchWobble)"
        />

        {/* house marker */}
        <g filter="url(#sketchWobble)">
          <rect
            x={HOUSE_MARKER.x}
            y={HOUSE_MARKER.y}
            width={HOUSE_MARKER.w}
            height={HOUSE_MARKER.h}
            fill="#fffdf8"
            stroke="#3f362c"
            strokeWidth={2}
          />
        </g>
        <text x={200} y={17} textAnchor="middle" fontSize={11} fill="#6b6055">
          house
        </text>

        {zones.map((zone, i) => {
          const cell = cells[i];
          if (!cell) return null;
          const cx = cell.x + cell.w / 2;
          const cy = cell.y + cell.h / 2;
          return (
            <g key={zone.id}>
              <rect
                x={cell.x}
                y={cell.y}
                width={cell.w}
                height={cell.h}
                rx={18}
                fill={ZONE_SWATCH[zone.id]}
                stroke="#3f362c"
                strokeWidth={1.75}
                filter="url(#sketchWobble)"
              />
              <text x={cx} y={cy + 10} textAnchor="middle" fontSize={30}>
                {zone.icon}
              </text>
              <circle cx={cell.x + 20} cy={cell.y + 20} r={12} fill="#fffdf8" stroke="#3f362c" strokeWidth={1.5} />
              <text x={cell.x + 20} y={cell.y + 24} textAnchor="middle" fontSize={13} fontWeight={700} fill="#3f362c">
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
