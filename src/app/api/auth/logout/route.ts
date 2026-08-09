import { NextResponse } from "next/server";
import { clearUserCookieOptions } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearUserCookieOptions());
  return res;
}