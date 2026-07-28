import { NextRequest, NextResponse } from "next/server";
import { runWeeklyCarSync } from "@/lib/sync/run-sync";

export async function GET(request: NextRequest) {
  const secret = process.env.SYNC_CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret && auth !== "Bearer " + secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runWeeklyCarSync();
  return NextResponse.json(result);
}