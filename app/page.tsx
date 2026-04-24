"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { BottomNav } from "@/components/bottom-nav";
import { MoodPills } from "@/components/mood-pills";
import { VoiceRecorder } from "@/components/voice-recorder";
import type { Session as JurnalSession } from "@/lib/types";

function moodColor(score: number) {
  if (score >= 70) return { dot: "bg-teal", badge: "bg-teal/[0.12] border-teal/[0.26]", num: "text-teal" };
  if (score >= 40) return { dot: "bg-violet", badge: "bg-violet/[0.12] border-violet/[0.26]", num: "text-violet-light" };
  return { dot: "bg-pink", badge: "bg-pink/[0.12] border-pink/[0.26]", num: "text-pink-light" };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buona sera";
}

export default function Home() {
  const { data: authSession, status } = useSession();
  const router = useRouter();
  const [todaySession, setTodaySession] = useState<JurnalSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch("/api/sessions").then((r) => r.json()).then((data) => {
        setTodaySession(data.session);
        setLoading(false);
      });
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </main>
    );
  }

  const userName = authSession?.user?.name?.split(" ")[0] ?? "";

  const handleStartSession = async () => {
    if (starting) return;
    setStarting(true);
    try {
      const res = await fetch("/api/sessions", { method: "POST" });
      const data = await res.json();
      if (data.session) { router.push("/session"); } else { setStarting(false); }
    } catch { setStarting(false); }
  };

  const colors = todaySession?.mood_score ? moodColor(todaySession.mood_score) : null;

  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center pb-24 md:pb-6">
      <AuroraBackground />
      <BottomNav />

      <div className="relative z-10 w-full max-w-xl px-5 sm:px-8 text-center">
        <p className="mb-1.5 text-xs font-sans tracking-wide text-teal/70">
          {greeting()}, {userName}
        </p>
        <h1 className="mb-8 font-serif text-3xl sm:text-4xl text-foreground">
          {todaySession?.summary ? "La tua giornata" : "Come ti senti?"}
        </h1>

        {todaySession?.summary && colors && (
          <div className="relative overflow-hidden rounded-[20px] border border-white/[0.11] bg-gradient-to-br from-white/[0.08] via-white/[0.025] to-violet/[0.04] p-5 backdrop-blur-xl shadow-[0_6px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.10)] glass-shimmer mb-8 text-left">
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex items-center gap-2.5 rounded-full border px-3 py-1.5 ${colors.badge}`}>
                <div className={`h-2 w-2 rounded-full ${colors.dot} shadow-[0_0_6px_currentColor]`} />
                <span className={`text-2xl font-light leading-none ${colors.num}`}>
                  {todaySession.mood_score}
                </span>
                <span className={`text-[10px] uppercase tracking-[2px] ${colors.num} opacity-60`}>mood</span>
              </div>
              <MoodPills keywords={todaySession.mood_keywords} />
            </div>
            <p className="font-serif text-sm leading-relaxed text-white/50 italic">
              {todaySession.summary}
            </p>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          {!todaySession?.summary && (
            <p className="font-serif text-base text-white/45 italic">Raccontami della tua giornata</p>
          )}
          {todaySession?.summary && (
            <p className="font-serif text-sm text-white/40 italic">Vuoi aggiungere qualcosa?</p>
          )}
          <VoiceRecorder isRecording={false} isLoading={starting} onStart={handleStartSession} onStop={() => {}} />
        </div>
      </div>
    </main>
  );
}
