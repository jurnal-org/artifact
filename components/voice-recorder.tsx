"use client";

import { Loader2, Square } from "lucide-react";

interface VoiceRecorderProps {
  isRecording: boolean;
  isLoading?: boolean;
  onStart: () => void;
  onStop: () => void;
  large?: boolean;
}

export function VoiceRecorder({ isRecording, isLoading, onStart, onStop, large }: VoiceRecorderProps) {
  const sz = large ? 88 : 72;
  const ripple1 = large ? "-14px" : "-10px";
  const ripple2 = large ? "-28px" : "-22px";
  const iconSz = large ? 30 : 26;

  return (
    <div className="relative flex items-center justify-center" style={{ height: sz, width: sz }}>
      {/* Ripple rings — only when idle/ready */}
      {!isRecording && !isLoading && (
        <>
          <span className="absolute rounded-full bg-violet/[0.12] animate-mic-ripple" style={{ inset: ripple1 }} />
          <span className="absolute rounded-full bg-violet/[0.06] animate-mic-ripple-delay" style={{ inset: ripple2 }} />
        </>
      )}

      <button
        onClick={isRecording ? onStop : onStart}
        disabled={isLoading}
        style={{ height: sz, width: sz }}
        className={`relative z-10 flex items-center justify-center rounded-full border-[1.5px] transition-all duration-200 active:scale-95 cursor-pointer ${
          isLoading
            ? "border-white/[0.14] bg-gradient-to-br from-violet/40 to-teal/25 opacity-70"
            : isRecording
            ? "border-pink/[0.30] bg-pink/[0.20] shadow-[0_0_0_1px_rgba(200,100,150,0.15),0_6px_24px_rgba(200,100,150,0.22),inset_0_1px_0_rgba(255,255,255,0.15)]"
            : "border-white/[0.22] bg-gradient-to-br from-violet/[0.55] to-teal/[0.35] shadow-[0_0_0_1px_rgba(120,80,220,0.20),0_8px_32px_rgba(120,80,220,0.35),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.15)]"
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 text-white/80 animate-spin" />
        ) : isRecording ? (
          <Square className="h-5 w-5 fill-pink text-pink" />
        ) : (
          <svg width={iconSz} height={iconSz} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        )}
      </button>
    </div>
  );
}
