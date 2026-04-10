"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { ChatBubble } from "@/components/chat-bubble";
import { VoiceRecorder } from "@/components/voice-recorder";
import { ProgressDots } from "@/components/progress-dots";
import { MoodScore } from "@/components/mood-score";
import { MoodPills } from "@/components/mood-pills";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useSessionChat } from "@/hooks/use-session-chat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
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
  const { messages, isLoading, isComplete, questionCount, sendMessage, closeSession } = useSessionChat(sessionId, briefing);

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
      <div className="relative z-10 mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl px-4 sm:px-6 pt-6 pb-2"><ProgressDots total={5} current={questionCount} /></div>
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
        {messages.length === 0 ? (
          <div className="flex flex-col items-center">
            <p className="mb-4 font-serif text-base sm:text-lg text-foreground">Raccontami della tua giornata</p>
            <VoiceRecorder isRecording={isRecording} onStart={startRecording} onStop={handleStopRecording} />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl flex items-center gap-2 sm:gap-3">
            <button onClick={isRecording ? handleStopRecording : startRecording}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border transition-all ${
                isRecording ? "border-pink/30 bg-pink/20" : "border-white/10 bg-white/5"
              }`}>
              {isRecording ? <div className="h-3 w-3 rounded-sm bg-pink" /> : (
                <svg className="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 7h2v-2c3.93-.5 7-3.88 7-7.95h-2c0 3.31-2.69 6-6 6s-6-2.69-6-6H4c0 4.07 3.07 7.45 7 7.95V21z" />
                </svg>
              )}
            </button>
            <form onSubmit={handleTextSubmit} className="flex flex-1 gap-2">
              <Input value={textInput} onChange={(e) => setTextInput(e.target.value)}
                placeholder="Scrivi qui..." className="border-card-border bg-card text-foreground placeholder:text-muted-foreground" disabled={isLoading} />
              <Button type="submit" size="icon" variant="ghost" disabled={!textInput.trim() || isLoading}
                className="text-muted hover:text-foreground"><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
