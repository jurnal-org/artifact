import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";
import { chatWithGemini } from "@/lib/gemini";
import { buildConversationPrompt } from "@/lib/prompts";
import type { AiResponse, SessionBriefing } from "@/lib/types";

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { session_id, content, briefing } = (await req.json()) as {
    session_id: string;
    content: string;
    briefing: SessionBriefing;
  };

  const sql = getDb();
  await sql`INSERT INTO messages (session_id, role, content) VALUES (${session_id}, 'user', ${content})`;

  const messages = await sql`SELECT role, content FROM messages WHERE session_id = ${session_id} ORDER BY created_at`;

  const geminiMessages = messages.map((m) => ({
    role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
    content: m.content as string,
  }));

  const systemPrompt = buildConversationPrompt(briefing);
  const responseText = await chatWithGemini(systemPrompt, geminiMessages);

  let aiResponse: AiResponse;
  try {
    aiResponse = JSON.parse(responseText);
  } catch {
    aiResponse = { message: responseText, session_complete: false };
  }

  await sql`INSERT INTO messages (session_id, role, content) VALUES (${session_id}, 'assistant', ${aiResponse.message})`;

  return NextResponse.json(aiResponse);
}
