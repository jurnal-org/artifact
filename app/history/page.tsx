"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { BottomNav } from "@/components/bottom-nav";
import { SessionCard } from "@/components/session-card";
import type { Session } from "@/lib/types";

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
    <main className="relative min-h-dvh pb-20">
      <AuroraBackground />
      <div className="relative z-10 mx-auto max-w-md px-6 pt-12">
        <h1 className="mb-8 font-serif text-2xl text-foreground">Storico</h1>
        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-muted">Nessuna sessione ancora. Inizia il tuo primo diario!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => (
              <SessionCard key={s.id} date={s.date} summary={s.summary} moodScore={s.mood_score}
                moodKeywords={s.mood_keywords} onClick={() => router.push(`/history/${s.id}`)} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
