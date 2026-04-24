"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { BottomNav } from "@/components/bottom-nav";
import type { Session } from "@/lib/types";

function moodMeta(score: number | null) {
  if (!score) return { dot: "bg-white/20 border-white/25", badge: "bg-white/[0.06] border-white/[0.12]", num: "text-white/50" };
  if (score >= 70) return { dot: "bg-teal shadow-[0_0_6px_rgba(60,180,160,0.5)]", badge: "bg-teal/[0.14] border-teal/[0.28]", num: "text-teal" };
  if (score >= 40) return { dot: "bg-violet shadow-[0_0_6px_rgba(120,80,220,0.5)]", badge: "bg-violet/[0.14] border-violet/[0.28]", num: "text-violet-light" };
  return { dot: "bg-pink shadow-[0_0_6px_rgba(200,100,150,0.5)]", badge: "bg-pink/[0.14] border-pink/[0.28]", num: "text-pink-light" };
}

function dayLabel(date: string) {
  return new Date(date).toLocaleDateString("it-IT", { weekday: "long" });
}

function shortDate(date: string) {
  const d = new Date(date);
  return { day: d.getDate(), month: d.toLocaleDateString("it-IT", { month: "short" }) };
}

export default function HistoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch("/api/sessions/history").then((r) => r.json()).then((data) => {
        setSessions(data.sessions);
        setLoading(false);
      });
    }
  }, [status, router]);

  return (
    <main className="relative min-h-dvh pb-24 md:pb-10">
      <AuroraBackground />
      <BottomNav />

      <div className="relative z-10 md:pl-[84px] px-5 sm:px-8 md:px-10 pt-10 md:pt-12">
        <h1 className="mb-8 font-serif text-2xl sm:text-3xl text-foreground">Storico</h1>

        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center font-serif text-sm text-white/40 italic">
            Nessuna sessione ancora. Inizia il tuo primo diario!
          </p>
        ) : (
          <div className="relative flex flex-col">
            {/* Vertical timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-white/[0.06] to-white/[0.01]" />

            {sessions.map((s) => {
              const meta = moodMeta(s.mood_score);
              const { day, month } = shortDate(s.date);
              return (
                <button
                  key={s.id}
                  onClick={() => router.push(`/history/${s.id}`)}
                  className="group flex gap-5 pb-3 text-left"
                >
                  {/* Dot + date */}
                  <div className="relative z-10 flex w-10 flex-shrink-0 flex-col items-center gap-1 pt-1.5">
                    <div className={`h-2.5 w-2.5 rounded-full border ${meta.dot}`} />
                    <span className="text-center text-[8px] leading-tight text-white/22">
                      {day}<br />{month}
                    </span>
                  </div>

                  {/* Card */}
                  <div className="relative flex-1 overflow-hidden rounded-[15px] border border-white/[0.11] bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-violet/[0.04] px-4 py-3 backdrop-blur-xl shadow-[0_6px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.10)] transition-all duration-200 group-hover:border-white/[0.18] glass-shimmer">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-sans font-medium tracking-wide text-white/35 capitalize">
                        {dayLabel(s.date)}
                      </span>
                      {s.mood_score && (
                        <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${meta.badge}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          <span className={`text-sm font-medium leading-none ${meta.num}`}>{s.mood_score}</span>
                        </div>
                      )}
                    </div>
                    {s.summary && (
                      <p className="mb-2.5 line-clamp-2 font-serif text-[11px] leading-relaxed text-white/42 italic">
                        {s.summary}
                      </p>
                    )}
                    {s.mood_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {s.mood_keywords.map((kw) => {
                          const isPos = ["sereno","felice","grato","motivato","sollevato","energico","contento","fiducioso"].some(p => kw.toLowerCase().includes(p));
                          const isNeg = ["ansioso","triste","stanco","frustrato","arrabbiato","preoccupato","stressato"].some(n => kw.toLowerCase().includes(n));
                          return (
                            <span key={kw} className={`rounded-full border px-2 py-0.5 text-[9px] ${
                              isPos ? "bg-teal/[0.10] border-teal/[0.20] text-teal/85"
                              : isNeg ? "bg-pink/[0.10] border-pink/[0.20] text-pink-light/85"
                              : "bg-violet/[0.10] border-violet/[0.20] text-violet-light/85"
                            }`}>{kw}</span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
