import { MoodScore } from "./mood-score";
import { MoodPills } from "./mood-pills";

interface SessionCardProps {
  date: string;
  summary: string | null;
  moodScore: number | null;
  moodKeywords: string[];
  onClick?: () => void;
}

export function SessionCard({
  date,
  summary,
  moodScore,
  moodKeywords,
  onClick,
}: SessionCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-card-border bg-card p-3 sm:p-4 text-left transition-colors hover:bg-white/[0.04]"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-teal-dim">
          {formattedDate}
        </span>
        {moodScore && <MoodScore score={moodScore} />}
      </div>
      {summary && (
        <p className="mb-3 line-clamp-2 font-serif text-sm leading-relaxed text-muted">
          {summary}
        </p>
      )}
      {moodKeywords.length > 0 && <MoodPills keywords={moodKeywords} />}
    </button>
  );
}
