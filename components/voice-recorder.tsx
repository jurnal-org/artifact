"use client";
import { Mic, Square } from "lucide-react";
import { WaveIndicator } from "./wave-indicator";

interface VoiceRecorderProps { isRecording: boolean; onStart: () => void; onStop: () => void; }

export function VoiceRecorder({ isRecording, onStart, onStop }: VoiceRecorderProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {isRecording && <WaveIndicator />}
      <button onClick={isRecording ? onStop : onStart}
        className={`flex h-16 w-16 sm:h-[72px] sm:w-[72px] items-center justify-center rounded-full border transition-all ${
          isRecording ? "border-pink/30 bg-pink/20 shadow-[0_4px_30px_rgba(200,100,150,0.2)]"
            : "border-white/10 bg-gradient-to-br from-violet/40 to-teal/40 shadow-[0_4px_30px_rgba(120,80,220,0.2)]"
        }`}>
        {isRecording ? <Square className="h-5 w-5 sm:h-6 sm:w-6 fill-pink text-pink" /> : <Mic className="h-6 w-6 sm:h-7 sm:w-7 text-white/90" />}
      </button>
      <span className="text-xs text-muted-foreground">{isRecording ? "Ti sto ascoltando..." : "Tocca per parlare"}</span>
    </div>
  );
}
