interface MoodPillsProps {
  keywords: string[];
}

const sentimentColor = (keyword: string): string => {
  const positive = [
    "sereno",
    "felice",
    "grato",
    "motivato",
    "sollevato",
    "energico",
    "contento",
    "fiducioso",
  ];
  const negative = [
    "ansioso",
    "triste",
    "stanco",
    "frustrato",
    "arrabbiato",
    "preoccupato",
    "stressato",
  ];
  const lower = keyword.toLowerCase();
  if (positive.some((p) => lower.includes(p)))
    return "bg-teal/10 text-teal-light border-teal/15";
  if (negative.some((n) => lower.includes(n)))
    return "bg-pink/10 text-pink-light border-pink/15";
  return "bg-violet/10 text-violet-light border-violet/15";
};

export function MoodPills({ keywords }: MoodPillsProps) {
  return (
    <div className="flex flex-wrap gap-1 sm:gap-1.5">
      {keywords.map((kw) => (
        <span
          key={kw}
          className={`rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs ${sentimentColor(kw)}`}
        >
          {kw}
        </span>
      ))}
    </div>
  );
}
