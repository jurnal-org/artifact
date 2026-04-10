"use client";
import { useState, useCallback, useEffect } from "react";
import type { AiResponse, Message, SessionBriefing } from "@/lib/types";

interface UseSessionChatReturn {
  messages: Pick<Message, "role" | "content">[];
  isLoading: boolean;
  isComplete: boolean;
  isRestoring: boolean;
  sendMessage: (content: string) => Promise<void>;
  closeSession: () => Promise<{ summary: string; mood_score: number; mood_keywords: string[] } | null>;
}

export function useSessionChat(sessionId: string | null, briefing: SessionBriefing | null): UseSessionChatReturn {
  const [messages, setMessages] = useState<Pick<Message, "role" | "content">[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Restore messages from DB when resuming an existing session
  useEffect(() => {
    if (!sessionId) return;
    setIsRestoring(true);
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages.map((m: Message) => ({ role: m.role, content: m.content })));
        }
      })
      .catch((err) => console.error("Failed to restore messages:", err))
      .finally(() => setIsRestoring(false));
  }, [sessionId]);

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

  return { messages, isLoading, isComplete, isRestoring, sendMessage, closeSession };
}
