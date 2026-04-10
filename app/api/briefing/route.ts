import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();

  const [todayFollowUps, significantRecent, moodTrend, recentFacts] = await Promise.all([
    sql`SELECT * FROM facts WHERE user_id = ${userId} AND reference_date = CURRENT_DATE AND status = 'active'`,
    // Recent emotionally significant facts (emotions, major events, key persons) from last 14 days
    // These don't have a specific follow-up date but are important enough to check in on
    sql`SELECT * FROM facts WHERE user_id = ${userId} AND status = 'active' AND type IN ('emotion', 'event', 'person') AND created_at > NOW() - INTERVAL '14 days' AND (reference_date IS NULL OR reference_date < CURRENT_DATE) ORDER BY created_at DESC LIMIT 10`,
    sql`SELECT date, mood_score, mood_keywords FROM sessions WHERE user_id = ${userId} AND mood_score IS NOT NULL ORDER BY date DESC LIMIT 7`,
    sql`SELECT * FROM facts WHERE user_id = ${userId} AND status = 'active' ORDER BY created_at DESC LIMIT 20`,
  ]);

  return NextResponse.json({ todayFollowUps, significantRecent, moodTrend, correlatedFacts: recentFacts });
}
