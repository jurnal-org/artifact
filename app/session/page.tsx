"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { ChatBubble } from "@/components/chat-bubble";
import { VoiceRecorder } from "@/components/voice-recorder";
import { MoodScore } from "@/components/mood-score";
import { MoodPills } from "@/components/mood-pills";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useSessionChat } from "@/hooks/use-session-chat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { SessionBriefing } from "@/lib/types";

export default function SessionPage() {
  const { status } = useSession();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<SessionBriefing | null>(null);
  const [textInput, setTextInput] = useState("");
  const [closureResult, setClosureResult] = useState<{
    summary: string; mood_score: number; mood_keywords: string[];
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { isRecording, transcript, startRecording, stopRecording, resetTranscript } = useVoiceRecorder();
  const { messages, isLoading, isComplete, sendMessage, closeSession } = useSessionChat(sessionId, briefing);

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

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) { sendMessage(textInput.trim()); setTextInput(""); }
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

  // Session complete — show summary
  if (closureResult) {
    return (
      <main className="relative min-h-dvh">
        <AuroraBackground />
        <div className="relative z-10 mx-auto max-w-md sm:max-w-lg md:max-w-xl px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
          <div className="mb-8 text-center">
            <MoodScore score={closureResult.mood_score} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">mood di oggi</p>
            <div className="mt-3 flex justify-center">
              <MoodPills keywords={closureResult.mood_keywords} />
            </div>
          </div>
          <div className="rounded-2xl border border-card-border bg-card p-5">
            <p className="font-serif text-sm leading-relaxed text-muted">{closureResult.summary}</p>
          </div>
          <Button variant="outline" className="mt-6 w-full border-card-border bg-card text-foreground hover:bg-white/5"
            onClick={() => router.push("/")}>Torna alla home</Button>
        </div>
      </main>
    );
  }

  // Active session
  return (
    <main className="relative flex min-h-dvh flex-col">
      <AuroraBackground />
      <div className="relative z-10 mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <AlertDialog>
          <AlertDialogTrigger
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-sm border border-white/[0.06] bg-[#111111]/90 backdrop-blur-2xl shadow-2xl shadow-black/40 rounded-2xl">
            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="font-serif text-lg text-foreground">Abbandonare la sessione?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground/70">
                Se esci ora perderai tutto quello che hai detto in questa sessione. Vuoi davvero uscire?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4 flex gap-3 border-t-0 bg-transparent">
              <AlertDialogCancel className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] text-foreground hover:bg-white/[0.06] transition-colors">Resta</AlertDialogCancel>
              <AlertDialogAction className="flex-1 rounded-xl bg-pink/10 text-pink border border-pink/15 hover:bg-pink/20 transition-colors" onClick={() => router.push("/")}>Esci</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/40">sessione</p>
      </div>
      <div ref={scrollRef} className="relative z-10 mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl flex-1 overflow-y-auto px-4 sm:px-6 pb-4">
        {messages.map((msg, i) => <ChatBubble key={i} role={msg.role} content={msg.content} />)}
        {isRecording && transcript && (
          <div className="ml-6 sm:ml-10 mb-4 rounded-2xl rounded-br-sm border border-teal/10 bg-teal/[0.06] p-3 sm:p-4 opacity-60">
            <p className="text-sm leading-relaxed text-muted">{transcript}</p>
          </div>
        )}
        {isLoading && (
          <div className="mb-4">
            <span className="text-[10px] font-medium uppercase tracking-widest text-violet-dim">Jurnal</span>
            <div className="mt-1 flex gap-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-violet-dim" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-violet-dim [animation-delay:0.2s]" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-violet-dim [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>
      <div className="relative z-10 border-t border-card-border bg-background/80 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col items-center gap-3">
          {messages.length === 0 && (
            <p className="font-serif text-base sm:text-lg text-foreground">Raccontami della tua giornata</p>
          )}
          <VoiceRecorder isRecording={isRecording} onStart={startRecording} onStop={handleStopRecording} />
          {messages.length > 0 && (
            <form onSubmit={handleTextSubmit} className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl flex items-center gap-2">
              <Input value={textInput} onChange={(e) => setTextInput(e.target.value)}
                placeholder="Scrivi qui..." className="border-card-border bg-card text-foreground placeholder:text-muted-foreground" disabled={isLoading} />
              <Button type="submit" size="icon" variant="ghost" disabled={!textInput.trim() || isLoading}
                className="text-muted hover:text-foreground"><Send className="h-4 w-4" /></Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
