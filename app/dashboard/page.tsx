"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { BottomNav } from "@/components/bottom-nav";
import { MoodChart } from "@/components/mood-chart";
import { KeywordCloud } from "@/components/keyword-cloud";

interface DashboardData {
  moodData: { date: string; mood_score: number; mood_keywords: string[] }[];
  keywords: { keyword: string; count: number }[];
  trend: string | null;
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch(`/api/dashboard?days=${days}`).then((r) => r.json()).then(setData);
    }
  }, [status, router, days]);

  return (
    <main className="relative min-h-dvh pb-20">
      <AuroraBackground />
      <div className="relative z-10 mx-auto max-w-md px-6 pt-12">
        <h1 className="mb-8 font-serif text-2xl text-foreground">Trend</h1>
        <div className="mb-6 flex gap-2">
          {[{ label: "7g", value: 7 }, { label: "30g", value: 30 }, { label: "90g", value: 90 }].map((period) => (
            <button key={period.value} onClick={() => setDays(period.value)}
              className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                days === period.value ? "bg-violet/20 text-violet-light border border-violet/20"
                  : "bg-card text-muted-foreground border border-card-border"
              }`}>{period.label}</button>
          ))}
        </div>
        {!data ? (
          <div className="flex justify-center pt-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
          </div>
        ) : data.moodData.length === 0 ? (
          <p className="text-center text-muted">Non ci sono ancora dati. Inizia a scrivere il tuo diario!</p>
        ) : (
          <>
            {data.trend && (
              <div className="mb-6 rounded-2xl border border-card-border bg-card p-4">
                <p className="text-sm text-muted">{data.trend}</p>
              </div>
            )}
            <div className="mb-8 rounded-2xl border border-card-border bg-card p-4">
              <h2 className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Mood nel tempo</h2>
              <MoodChart data={data.moodData} />
            </div>
            {data.keywords.length > 0 && (
              <div className="rounded-2xl border border-card-border bg-card p-4">
                <h2 className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Emozioni ricorrenti</h2>
                <KeywordCloud keywords={data.keywords} />
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
