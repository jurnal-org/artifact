import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    apiKey: process.env.GOOGLE_CLOUD_STT_API_KEY,
  });
}
