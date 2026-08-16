// Design doc §5.2: progress dots, not a percentage bar — less clinical/form-like.
export default function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex gap-1.5" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full ${i <= current ? "bg-leaf" : "bg-line"}`}
        />
      ))}
    </div>
  );
}
