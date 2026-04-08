"use client";
import { useState, useCallback } from "react";
import type { AiResponse, Message, SessionBriefing } from "@/lib/types";

interface UseSessionChatReturn {
  messages: Pick<Message, "role" | "content">[];
  isLoading: boolean;
  isComplete: boolean;
  questionCount: number;
  sendMessage: (content: string) => Promise<void>;
  closeSession: () => Promise<{ summary: string; mood_score: number; mood_keywords: string[] } | null>;
}

export function useSessionChat(sessionId: string | null, briefing: SessionBriefing | null): UseSessionChatReturn {
  const [messages, setMessages] = useState<Pick<Message, "role" | "content">[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId || !briefing || isComplete) return;
    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, content, briefing }),
      });
      const data: AiResponse = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      setQuestionCount((c) => c + 1);
      if (data.session_complete) setIsComplete(true);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, briefing, isComplete]);

  const closeSession = useCallback(async () => {
    if (!sessionId) return null;
    try {
      const res = await fetch("/api/close-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      return await res.json();
    } catch (error) {
      console.error("Failed to close session:", error);
      return null;
    }
  }, [sessionId]);

  return { messages, isLoading, isComplete, questionCount, sendMessage, closeSession };
}
