import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";
import { generateClosure } from "@/lib/gemini";
import { embedText } from "@/lib/embedding";
import { buildClosurePrompt } from "@/lib/prompts";
import type { SessionClosure } from "@/lib/types";

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { session_id } = (await req.json()) as { session_id: string };
  const sql = getDb();

  const messages = await sql`SELECT role, content FROM messages WHERE session_id = ${session_id} ORDER BY created_at`;

  const transcript = messages
    .map((m) => `${m.role === "user" ? "Utente" : "Jurnal"}: ${m.content}`)
    .join("\n\n");

  // Fetch previous completed sessions from today to build a unified daily summary
  const previousSessions = await sql`
    SELECT transcript, summary, mood_score, mood_keywords
    FROM sessions
    WHERE user_id = ${userId} AND date = CURRENT_DATE AND id != ${session_id} AND summary IS NOT NULL
    ORDER BY created_at ASC
  `;

  let fullContext = "";
  if (previousSessions.length > 0) {
    const prevTranscripts = previousSessions
      .map((s, i) => `--- Sessione ${i + 1} ---\n${s.transcript}`)
      .join("\n\n");
    fullContext = `${prevTranscripts}\n\n--- Sessione corrente ---\n${transcript}`;
  } else {
    fullContext = transcript;
  }

  const closureText = await generateClosure(buildClosurePrompt(), fullContext);

  let closure: SessionClosure;
  try {
    closure = JSON.parse(closureText);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const embedding = await embedText(closure.summary);
  const embeddingStr = `[${embedding.join(",")}]`;

  await sql`
    UPDATE sessions SET
      transcript = ${transcript},
      summary = ${closure.summary},
      mood_score = ${closure.mood_score},
      mood_keywords = ${closure.mood_keywords},
      embedding = ${embeddingStr}::vector
    WHERE id = ${session_id} AND user_id = ${userId}
  `;

  for (const fact of closure.facts) {
    await sql`
      INSERT INTO facts (user_id, session_id, type, content, reference_date, tags)
      VALUES (${userId}, ${session_id}, ${fact.type}::fact_type, ${fact.content}, ${fact.reference_date}, ${fact.tags})
    `;
  }

  await sql`
    UPDATE facts SET status = 'followed_up'
    WHERE user_id = ${userId} AND reference_date = CURRENT_DATE AND status = 'active'
  `;

  return NextResponse.json({
    summary: closure.summary,
    mood_score: closure.mood_score,
    mood_keywords: closure.mood_keywords,
    facts_count: closure.facts.length,
  });
}
