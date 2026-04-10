import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const checks: Record<string, string> = {};

  // Database check
  try {
    const sql = getDb();
    await sql`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
