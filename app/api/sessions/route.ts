import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getDb();
  const rows = await sql`SELECT * FROM sessions WHERE user_id = ${userId} AND date = CURRENT_DATE LIMIT 1`;
  return NextResponse.json({ session: rows[0] ?? null });
}

export async function POST() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getDb();
  const existing = await sql`SELECT id FROM sessions WHERE user_id = ${userId} AND date = CURRENT_DATE`;
  if (existing.length > 0) return NextResponse.json({ session: existing[0] });
  const rows = await sql`INSERT INTO sessions (user_id, date) VALUES (${userId}, CURRENT_DATE) RETURNING *`;
  return NextResponse.json({ session: rows[0] });
}
