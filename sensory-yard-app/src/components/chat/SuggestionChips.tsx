// Design doc §5.2: tap-to-insert chips — speed of checkboxes, richness of free text.
export default function SuggestionChips({
  chips,
  onPick,
}: {
  chips: string[];
  onPick: (chip: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          onClick={() => onPick(chip)}
          className="min-h-11 rounded-full border border-line bg-cream px-4 py-2 text-sm font-medium text-bark-soft hover:border-sage hover:text-bark"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
