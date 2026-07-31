import { NextRequest, NextResponse } from "next/server";
import {
  adminCookieOptions,
  getAdminSecret,
  getAdminSessionToken,
} from "@/lib/admin/session";

export async function POST(request: NextRequest) {
  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET is not configured" },
      { status: 503 }
    );
  }

  let body: { password?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.password || body.password !== secret) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = await getAdminSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Auth unavailable" }, { status: 503 });
  }

  const res = NextResponse.json({ success: true });
  const opts = adminCookieOptions(token);
  res.cookies.set(opts.name, opts.value, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
    maxAge: opts.maxAge,
  });
  return res;
}
