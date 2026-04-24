"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { BottomNav } from "@/components/bottom-nav";
import { ChatBubble } from "@/components/chat-bubble";
import { VoiceRecorder } from "@/components/voice-recorder";
import { MoodPills } from "@/components/mood-pills";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useSessionChat } from "@/hooks/use-session-chat";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { SessionBriefing } from "@/lib/types";

function moodColor(score: number) {
  if (score >= 70) return { dot: "bg-teal", badge: "bg-teal/[0.12] border-teal/[0.26]", num: "text-teal" };
  if (score >= 40) return { dot: "bg-violet", badge: "bg-violet/[0.12] border-violet/[0.26]", num: "text-violet-light" };
  return { dot: "bg-pink", badge: "bg-pink/[0.12] border-pink/[0.26]", num: "text-pink-light" };
}

export default function SessionPage() {
  const { status } = useSession();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<SessionBriefing | null>(null);
  const [closureResult, setClosureResult] = useState<{
    summary: string; mood_score: number; mood_keywords: string[];
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { isRecording, transcript, startRecording, stopRecording, resetTranscript } = useVoiceRecorder();
  const { messages, isLoading, isComplete, isRestoring, sendMessage, closeSession } = useSessionChat(sessionId, briefing);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/sessions", { method: "POST" }).then((r) => r.json()),
        fetch("/api/briefing").then((r) => r.json()),
      ]).then(([sessionData, briefingData]) => {
        setSessionId(sessionData.session.id);
        setBriefing(briefingData);
      });
    }
  }, [status, router]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, transcript]);

  const handleStopRecording = () => {
    stopRecording();
    if (transcript.trim()) { sendMessage(transcript.trim()); resetTranscript(); }
  };

  useEffect(() => {
    if (isComplete && !closureResult) {
      closeSession().then((result) => { if (result) setClosureResult(result); });
    }
  }, [isComplete, closureResult, closeSession]);

  if (!sessionId || !briefing) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </main>
    );
  }

  // Session complete — summary screen
  if (closureResult) {
    const colors = moodColor(closureResult.mood_score);
    return (
      <main className="relative min-h-dvh pb-6">
        <AuroraBackground />
        <BottomNav />
        <div className="relative z-10 md:pl-[84px] px-5 sm:px-8 md:px-10 pt-12 max-w-3xl">
          <div className="relative overflow-hidden rounded-[20px] border border-white/[0.11] bg-gradient-to-br from-white/[0.08] via-white/[0.025] to-violet/[0.04] p-6 backdrop-blur-xl shadow-[0_6px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.10)] glass-shimmer mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex items-center gap-2.5 rounded-full border px-3 py-1.5 ${colors.badge}`}>
                <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
                <span className={`text-2xl font-light leading-none ${colors.num}`}>{closureResult.mood_score}</span>
                <span className={`text-[10px] uppercase tracking-[2px] ${colors.num} opacity-60`}>mood</span>
              </div>
              <MoodPills keywords={closureResult.mood_keywords} />
            </div>
            <p className="font-serif text-sm leading-relaxed text-white/50 italic">{closureResult.summary}</p>
          </div>
          <Button variant="outline" className="w-full rounded-[14px] border-white/[0.09] bg-white/[0.04] text-white/60 hover:bg-white/[0.07] hover:text-white/80 backdrop-blur-xl"
            onClick={() => router.push("/")}>Torna alla home</Button>
        </div>
      </main>
    );
  }

  // Active session
  return (
    <main className="relative flex min-h-dvh flex-col">
      <AuroraBackground />

      {/* Sidebar nav (desktop only — no bottom pill during session) */}
      <BottomNav />

      {/* Content offset for sidebar on desktop */}
      <div className="relative z-10 flex flex-col flex-1 md:pl-[84px]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 sm:px-8 md:px-10 pt-5 pb-3 flex-shrink-0">
          <AlertDialog>
            <AlertDialogTrigger className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.04] text-white/40 backdrop-blur-xl transition-all hover:bg-white/[0.07] hover:text-white/60">
              <X className="h-4 w-4" />
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-sm rounded-[20px] border border-white/[0.09] bg-[#0f0f18]/90 backdrop-blur-2xl shadow-2xl">
              <AlertDialogHeader className="space-y-2">
                <AlertDialogTitle className="font-serif text-lg text-foreground">Uscire dalla sessione?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed text-white/50">
                  I tuoi messaggi sono salvati. Potrai riprendere quando vuoi.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4 flex gap-3">
                <AlertDialogCancel className="flex-1 rounded-[12px] border border-white/[0.09] bg-white/[0.04] text-foreground hover:bg-white/[0.07]">Continua</AlertDialogCancel>
                <AlertDialogAction className="flex-1 rounded-[12px] bg-pink/[0.12] text-pink border border-pink/[0.20] hover:bg-pink/[0.20]" onClick={() => router.push("/")}>Esci</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-[10px] font-sans font-medium uppercase tracking-[3px] text-white/22">sessione</p>
          <div className="h-9 w-9" />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 sm:px-8 md:px-10 pb-4 max-w-3xl w-full">
          {isRestoring && (
            <div className="mb-4 flex items-center gap-2 text-white/35">
              <div className="h-3 w-3 animate-spin rounded-full border border-violet/50 border-t-transparent" />
              <span className="text-xs font-sans">Ripristino conversazione…</span>
            </div>
          )}
          {messages.map((msg, i) => <ChatBubble key={i} role={msg.role} content={msg.content} />)}
          {isRecording && transcript && (
            <div className="mb-3 flex justify-end">
              <div className="max-w-[80%] rounded-[18px] rounded-br-[4px] border border-teal/[0.15] bg-teal/[0.08] px-4 py-3 text-sm text-white/50 italic opacity-60 backdrop-blur-xl">
                {transcript}
              </div>
            </div>
          )}
          {isLoading && (
            <div className="mb-3 flex flex-col items-start gap-1.5">
              <span className="ml-1 text-[9px] font-sans font-medium uppercase tracking-[2.5px] text-violet/55">Jurnal</span>
              <div className="flex gap-1.5 rounded-[18px] rounded-bl-[4px] border border-violet/[0.14] bg-gradient-to-br from-violet/[0.09] to-violet/[0.03] px-4 py-3 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.20)]">
                {[0, 200, 400].map((delay) => (
                  <div key={delay} className="h-2 w-2 animate-pulse rounded-full bg-violet/50" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mic area — centered, voice-first */}
        <div className="flex-shrink-0 flex justify-center pb-10 pt-4 px-5">
          <VoiceRecorder isRecording={isRecording} onStart={startRecording} onStop={handleStopRecording} />
        </div>
      </div>
    </main>
  );
}
