import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const sql = getDb();
  const rows = await sql`
    SELECT id, date, summary, mood_score, mood_keywords, created_at
    FROM sessions WHERE user_id = ${userId} AND summary IS NOT NULL
    ORDER BY date DESC LIMIT ${limit} OFFSET ${offset}
  `;
  return NextResponse.json({ sessions: rows });
}
