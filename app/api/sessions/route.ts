import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getDb();
  const rows = await sql`SELECT * FROM sessions WHERE user_id = ${userId} AND date = CURRENT_DATE AND summary IS NOT NULL ORDER BY created_at DESC LIMIT 1`;
  return NextResponse.json({ session: rows[0] ?? null });
}

export async function POST() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getDb();
  // Resume an open session (no summary yet) if one exists, otherwise create a new one
  const open = await sql`SELECT * FROM sessions WHERE user_id = ${userId} AND date = CURRENT_DATE AND summary IS NULL ORDER BY created_at DESC LIMIT 1`;
  if (open.length > 0) return NextResponse.json({ session: open[0] });
  const rows = await sql`INSERT INTO sessions (user_id, date) VALUES (${userId}, CURRENT_DATE) RETURNING *`;
  return NextResponse.json({ session: rows[0] });
}
