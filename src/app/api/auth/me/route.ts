import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  USER_COOKIE,
  createSessionToken,
  userCookieOptions,
  verifySessionToken,
} from "@/lib/auth/session";
import { updateUserProfile } from "@/lib/auth/users-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const session = await verifySessionToken(jar.get(USER_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.sub,
      email: session.email,
      name: session.name,
      phone: session.phone,
    },
  });
}

export async function PATCH(request: Request) {
  const jar = await cookies();
  const session = await verifySessionToken(jar.get(USER_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string; phone?: string };
  const updated = await updateUserProfile(session.sub, {
    name: body.name,
    phone: body.phone,
  });

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const token = await createSessionToken(updated);
  const res = NextResponse.json({ user: updated });
  if (token) res.cookies.set(userCookieOptions(token));
  return res;
}