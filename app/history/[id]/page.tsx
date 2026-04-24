"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { BottomNav } from "@/components/bottom-nav";
import { ChatBubble } from "@/components/chat-bubble";
import { ArrowLeft } from "lucide-react";
import type { Session, Message } from "@/lib/types";

function moodMeta(score: number) {
  if (score >= 70) return { dot: "bg-teal shadow-[0_0_8px_rgba(60,180,160,0.5)]", badge: "bg-teal/[0.12] border-teal/[0.24]", num: "text-teal", label: "text-teal/55" };
  if (score >= 40) return { dot: "bg-violet shadow-[0_0_8px_rgba(120,80,220,0.5)]", badge: "bg-violet/[0.12] border-violet/[0.24]", num: "text-violet-light", label: "text-violet/55" };
  return { dot: "bg-pink shadow-[0_0_8px_rgba(200,100,150,0.5)]", badge: "bg-pink/[0.12] border-pink/[0.24]", num: "text-pink-light", label: "text-pink/55" };
}

export default function SessionDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && params.id) {
      fetch(`/api/sessions/${params.id}`).then((r) => r.json()).then((data) => {
        setSession(data.session);
        setMessages(data.messages);
      });
    }
  }, [status, router, params.id]);

  if (!session) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </main>
    );
  }

  const formattedDate = new Date(session.date).toLocaleDateString("it-IT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const meta = session.mood_score ? moodMeta(session.mood_score) : null;

  return (
    <main className="relative min-h-dvh pb-24 md:pb-10">
      <AuroraBackground />
      <BottomNav />

      <div className="relative z-10 md:pl-[84px] px-5 sm:px-8 md:px-10 pt-8 md:pt-10">
        {/* Back */}
        <button
          onClick={() => router.push("/history")}
          className="mb-6 flex items-center gap-1.5 text-[11px] font-sans text-white/30 transition-colors hover:text-white/55"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Storico
        </button>

        {/* Header */}
        <p className="mb-1 text-xs font-sans text-white/32 capitalize">{formattedDate}</p>
        <h1 className="mb-5 font-serif text-2xl sm:text-3xl text-foreground">La tua giornata</h1>

        {/* Score + pills */}
        {meta && session.mood_score && (
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2.5 rounded-[14px] border px-3.5 py-2 ${meta.badge}`}>
              <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />
              <div>
                <div className={`text-3xl font-light leading-none ${meta.num}`}>{session.mood_score}</div>
                <div className={`text-[9px] font-sans uppercase tracking-[2px] mt-0.5 ${meta.label}`}>mood score</div>
              </div>
            </div>
            {session.mood_keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {session.mood_keywords.map((kw) => {
                  const isPos = ["sereno","felice","grato","motivato","sollevato","energico","contento","fiducioso"].some(p => kw.toLowerCase().includes(p));
                  const isNeg = ["ansioso","triste","stanco","frustrato","arrabbiato","preoccupato","stressato"].some(n => kw.toLowerCase().includes(n));
                  return (
                    <span key={kw} className={`rounded-full border px-2.5 py-1 text-xs ${
                      isPos ? "bg-teal/[0.10] border-teal/[0.20] text-teal/85"
                      : isNeg ? "bg-pink/[0.10] border-pink/[0.20] text-pink-light/85"
                      : "bg-violet/[0.10] border-violet/[0.20] text-violet-light/85"
                    }`}>{kw}</span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {session.summary && (
          <div className="relative overflow-hidden rounded-[18px] border border-white/[0.11] bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-violet/[0.04] px-5 py-4 backdrop-blur-xl shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.10)] glass-shimmer mb-6">
            <p className="text-[9px] font-sans uppercase tracking-[2px] text-white/25 mb-3">Riassunto</p>
            <p className="font-serif text-sm leading-relaxed text-white/55 italic">{session.summary}</p>
          </div>
        )}

        {/* Transcript */}
        {messages.length > 0 && (
          <div className="relative overflow-hidden rounded-[18px] border border-white/[0.11] bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-violet/[0.04] px-5 py-4 backdrop-blur-xl shadow-[0_6px_24px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.10)] glass-shimmer">
            <p className="text-[9px] font-sans uppercase tracking-[2px] text-white/25 mb-4">Conversazione</p>
            <div className="flex flex-col">
              {messages.map((msg) => (
                <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
