"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { BottomNav } from "@/components/bottom-nav";
import { MoodChart } from "@/components/mood-chart";

interface DashboardData {
  moodData: { date: string; mood_score: number; mood_keywords: string[] }[];
  keywords: { keyword: string; count: number }[];
  trend: string | null;
}

const PERIODS = [
  { label: "7g", value: 7 },
  { label: "30g", value: 30 },
  { label: "90g", value: 90 },
];

function KeywordCloud({ keywords }: { keywords: { keyword: string; count: number }[] }) {
  if (!keywords.length) return null;
  const max = keywords[0].count;
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {keywords.map(({ keyword, count }) => {
        const ratio = count / max;
        const isPos = ["sereno","felice","grato","motivato","sollevato","energico","contento","fiducioso"].some(p => keyword.toLowerCase().includes(p));
        const isNeg = ["ansioso","triste","stanco","frustrato","arrabbiato","preoccupato","stressato"].some(n => keyword.toLowerCase().includes(n));
        const size = ratio > 0.7 ? "text-sm" : ratio > 0.4 ? "text-xs" : "text-[10px]";
        const py = ratio > 0.7 ? "py-1.5" : "py-1";
        const style = isPos
          ? "bg-teal/[0.10] border-teal/[0.20] text-teal/85"
          : isNeg
          ? "bg-pink/[0.10] border-pink/[0.20] text-pink-light/85"
          : "bg-violet/[0.10] border-violet/[0.20] text-violet-light/85";
        return (
          <span key={keyword} className={`rounded-full border px-3 ${py} ${size} ${style}`}>
            {keyword}
          </span>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      setData(null);
      fetch(`/api/dashboard?days=${days}`).then((r) => r.json()).then(setData);
    }
  }, [status, router, days]);

  const avgMood = data?.moodData.length
    ? Math.round(data.moodData.reduce((s, d) => s + d.mood_score, 0) / data.moodData.length)
    : null;

  const avgColor = avgMood
    ? avgMood >= 70 ? "text-teal" : avgMood >= 40 ? "text-violet-light" : "text-pink-light"
    : "text-white/40";

  return (
    <main className="relative min-h-dvh pb-24 md:pb-10">
      <AuroraBackground />
      <BottomNav />

      <div className="relative z-10 md:pl-[84px] px-5 sm:px-8 md:px-10 pt-10 md:pt-12 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-serif text-2xl sm:text-3xl text-foreground">Trend</h1>
          <div className="flex gap-1.5">
            {PERIODS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setDays(value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-sans transition-all duration-200 ${
                  days === value
                    ? "bg-gradient-to-br from-violet/[0.22] to-teal/[0.12] border border-violet/[0.35] text-violet-light shadow-[0_2px_10px_rgba(120,80,220,0.12)]"
                    : "border border-white/[0.09] bg-white/[0.04] text-white/35 hover:text-white/55"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {!data ? (
          <div className="flex justify-center pt-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
          </div>
        ) : data.moodData.length === 0 ? (
          <p className="text-center font-serif text-sm text-white/40 italic">
            Non ci sono ancora dati. Inizia a scrivere il tuo diario!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: avgMood?.toString() ?? "—", label: "Media mood", color: avgColor },
                { val: data.moodData.length.toString(), label: "Sessioni", color: "text-violet-light" },
                { val: `${data.moodData.length > 0 ? "↑" : "—"}`, label: "vs periodo prec.", color: "text-teal" },
              ].map(({ val, label, color }) => (
                <div key={label} className="relative overflow-hidden rounded-[14px] border border-white/[0.09] bg-white/[0.05] px-3 py-3 text-center backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.22)]">
                  <div className={`text-2xl font-light leading-none mb-1 ${color}`}>{val}</div>
                  <div className="text-[9px] font-sans uppercase tracking-[1.5px] text-white/25">{label}</div>
                </div>
              ))}
            </div>

            {/* Insight */}
            {data.trend && (
              <div className="relative overflow-hidden rounded-[18px] border border-white/[0.11] bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-violet/[0.04] px-5 py-4 backdrop-blur-xl shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.10)] glass-shimmer">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-br from-violet to-teal shadow-[0_0_8px_rgba(120,80,220,0.5)]" />
                  <p className="font-serif text-sm leading-relaxed text-white/55 italic">{data.trend}</p>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="relative overflow-hidden rounded-[18px] border border-white/[0.11] bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-violet/[0.04] px-5 py-4 backdrop-blur-xl shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.10)] glass-shimmer">
              <p className="mb-3 text-[9px] font-sans uppercase tracking-[2px] text-white/25">
                Mood negli ultimi {days} giorni
              </p>
              <MoodChart data={data.moodData} />
            </div>

            {/* Keywords */}
            {data.keywords.length > 0 && (
              <div className="relative overflow-hidden rounded-[18px] border border-white/[0.11] bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-violet/[0.04] px-5 py-4 backdrop-blur-xl shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.10)] glass-shimmer">
                <p className="mb-3 text-[9px] font-sans uppercase tracking-[2px] text-white/25">Emozioni ricorrenti</p>
                <KeywordCloud keywords={data.keywords} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
