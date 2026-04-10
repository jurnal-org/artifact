interface MoodScoreProps {
  score: number;
  size?: "sm" | "lg";
}

export function MoodScore({ score, size = "sm" }: MoodScoreProps) {
  const color =
    score >= 70 ? "text-teal" : score >= 40 ? "text-violet-light" : "text-pink";
  return (
    <span
      className={`font-sans font-light ${color} ${
        size === "lg" ? "text-5xl sm:text-6xl" : "text-2xl"
      }`}
    >
      {score}
    </span>
  );
}
