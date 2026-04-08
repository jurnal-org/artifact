interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < current
              ? "bg-teal-dim"
              : i === current
              ? "bg-violet-dim shadow-[0_0_8px_rgba(120,80,220,0.3)]"
              : "bg-white/[0.08]"
          }`}
        />
      ))}
    </div>
  );
}
