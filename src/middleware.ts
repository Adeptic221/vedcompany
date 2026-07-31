import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminSessionToken } from "@/lib/admin/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let expected: string | null = null;
  try {
    expected = await getAdminSessionToken();
  } catch {
    expected = null;
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const ok = Boolean(expected && token && token === expected);

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  if (isLoginApi) return NextResponse.next();

  if (isLoginPage) {
    if (ok) return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!ok) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/(.*)", "/api/admin/(.*)"],
};
