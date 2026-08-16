import { Zone } from "@/lib/types";

// Design doc §5.4: one card per zone, matching source-spec §4.1 taxonomy 1:1.
// `index` matches the number badge on YardSketch so the sketch and the
// detail list below it read as one connected artifact, not two outputs.
export default function ZoneCard({ zone, index }: { zone: Zone; index: number }) {
  return (
    <div className="rounded-2xl border border-line bg-cream p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-bark text-xs font-bold text-bark">
          {index}
        </span>
        <span className="text-2xl" aria-hidden>
          {zone.icon}
        </span>
        <h2 className="text-lg font-semibold text-bark">{zone.title}</h2>
      </div>
      <p className="mt-2 text-sm text-bark-soft">{zone.description}</p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {zone.ideas.map((idea) => (
          <li key={idea} className="flex gap-2 text-sm text-bark">
            <span className="text-sage" aria-hidden>
              •
            </span>
            {idea}
          </li>
        ))}
      </ul>
    </div>
  );
}
