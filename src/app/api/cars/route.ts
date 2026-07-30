import { NextRequest, NextResponse } from "next/server";
import { getCarsCatalog } from "@/lib/storage/cars-store";
import { runWeeklyCarSync } from "@/lib/sync/run-sync";

function checkSyncSecret(request: NextRequest): boolean {
  const secret = process.env.SYNC_CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  const refresh = request.nextUrl.searchParams.get("refresh");

  if (refresh === "1") {
    if (!checkSyncSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sync = await runWeeklyCarSync();
    const cars = await getCarsCatalog();
    return NextResponse.json({ sync, count: cars.length, cars });
  }

  const cars = await getCarsCatalog();
  return NextResponse.json(cars);
}
