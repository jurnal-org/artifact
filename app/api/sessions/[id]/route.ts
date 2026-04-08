import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sql = getDb();
  const [sessions, messages] = await Promise.all([
    sql`SELECT * FROM sessions WHERE id = ${id} AND user_id = ${userId}`,
    sql`SELECT * FROM messages WHERE session_id = ${id} ORDER BY created_at`,
  ]);
  if (sessions.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ session: sessions[0], messages });
}
