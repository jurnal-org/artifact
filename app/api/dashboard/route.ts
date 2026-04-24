import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30");

  const sql = getDb();

  const [moodData, keywordData] = await Promise.all([
    sql`
      SELECT date, mood_score, mood_keywords
      FROM sessions
      WHERE user_id = ${userId} AND mood_score IS NOT NULL AND date >= CURRENT_DATE - ${days}::integer
      ORDER BY date ASC
    `,
    sql`
      SELECT unnest(mood_keywords) as keyword, COUNT(*) as count
      FROM sessions
      WHERE user_id = ${userId} AND mood_score IS NOT NULL AND date >= CURRENT_DATE - ${days}::integer
      GROUP BY keyword ORDER BY count DESC LIMIT 15
    `,
  ]);

  let trend: string | null = null;
  if (moodData.length >= 7) {
    const recent = moodData.slice(-7);
    const older = moodData.slice(-14, -7);
    if (older.length > 0) {
      const recentAvg = recent.reduce((s, r) => s + (r.mood_score as number), 0) / recent.length;
      const olderAvg = older.reduce((s, r) => s + (r.mood_score as number), 0) / older.length;
      const diff = Math.round(recentAvg - olderAvg);
      if (diff > 3) trend = `Questa settimana stai meglio della scorsa (+${diff})`;
      else if (diff < -3) trend = `Questa settimana il mood è più basso della scorsa (${diff})`;
      else trend = "Il tuo mood è stabile rispetto alla scorsa settimana";
    }
  }

  let trendDelta: number | null = null;
  if (moodData.length >= 7) {
    const recent = moodData.slice(-7);
    const older = moodData.slice(-14, -7);
    if (older.length > 0) {
      const recentAvg = recent.reduce((s, r) => s + (r.mood_score as number), 0) / recent.length;
      const olderAvg = older.reduce((s, r) => s + (r.mood_score as number), 0) / older.length;
      trendDelta = Math.round(recentAvg - olderAvg);
    }
  }

  return NextResponse.json({ moodData, keywords: keywordData, trend, trendDelta });
}
