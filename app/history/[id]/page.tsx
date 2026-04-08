"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { ChatBubble } from "@/components/chat-bubble";
import { MoodScore } from "@/components/mood-score";
import { MoodPills } from "@/components/mood-pills";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Session, Message } from "@/lib/types";

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

  return (
    <main className="relative min-h-dvh">
      <AuroraBackground />
      <div className="relative z-10 mx-auto max-w-md px-6 pt-6 pb-8">
        <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/history")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Storico
        </Button>
        <p className="mb-1 text-xs uppercase tracking-wide text-teal-dim">{formattedDate}</p>
        {session.mood_score && (
          <div className="mb-6 flex items-center gap-4">
            <MoodScore score={session.mood_score} size="lg" />
            <MoodPills keywords={session.mood_keywords} />
          </div>
        )}
        {session.summary && (
          <div className="mb-8 rounded-2xl border border-card-border bg-card p-5">
            <p className="font-serif text-sm leading-relaxed text-muted">{session.summary}</p>
          </div>
        )}
        {messages.length > 0 && (
          <>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">Conversazione</h2>
            {messages.map((msg) => <ChatBubble key={msg.id} role={msg.role} content={msg.content} />)}
          </>
        )}
      </div>
    </main>
  );
}
