"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { BottomNav } from "@/components/bottom-nav";
import { MoodScore } from "@/components/mood-score";
import { MoodPills } from "@/components/mood-pills";
import { VoiceRecorder } from "@/components/voice-recorder";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Session as JurnalSession } from "@/lib/types";

export default function Home() {
  const { data: authSession, status } = useSession();
  const router = useRouter();
  const [todaySession, setTodaySession] = useState<JurnalSession | null>(null);
  const [loading, setLoading] = useState(true);

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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buongiorno";
    if (hour < 18) return "Buon pomeriggio";
    return "Buonasera";
  };

  const userName = authSession?.user?.name?.split(" ")[0] ?? "";

  const handleStartSession = async () => {
    const res = await fetch("/api/sessions", { method: "POST" });
    const data = await res.json();
    if (data.session) router.push("/session");
  };

  // Session already completed today
  if (todaySession?.summary) {
    return (
      <main className="relative min-h-dvh pb-20">
        <AuroraBackground />
        <div className="relative z-10 mx-auto max-w-md sm:max-w-lg md:max-w-xl px-4 sm:px-6 pt-10 sm:pt-12">
          <p className="mb-1 text-sm text-teal-dim">{greeting()}, {userName}</p>
          <h1 className="mb-6 sm:mb-8 font-serif text-2xl sm:text-3xl text-foreground">La tua giornata</h1>
          <div className="mb-6 text-center">
            <MoodScore score={todaySession.mood_score!} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">mood di oggi</p>
            <div className="mt-3 flex justify-center">
              <MoodPills keywords={todaySession.mood_keywords} />
            </div>
          </div>
          <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-5">
            <p className="font-serif text-sm leading-relaxed text-muted">{todaySession.summary}</p>
          </div>
          <Button
            variant="outline"
            className="mt-6 w-full border-card-border bg-card text-foreground hover:bg-white/5"
            onClick={handleStartSession}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuova sessione
          </Button>
        </div>
        <BottomNav />
      </main>
    );
  }

  // No session yet
  return (
    <main className="relative min-h-dvh pb-20">
      <AuroraBackground />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md sm:max-w-lg md:max-w-xl flex-col items-center justify-center px-4 sm:px-6">
        <p className="mb-1 text-sm text-teal-dim">{greeting()}, {userName}</p>
        <h1 className="mb-10 sm:mb-12 font-serif text-2xl sm:text-3xl text-foreground">Come ti senti stasera?</h1>
        <VoiceRecorder isRecording={false} onStart={handleStartSession} onStop={() => {}} />
      </div>
      <BottomNav />
    </main>
  );
}
