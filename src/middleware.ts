import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminSessionToken } from "@/lib/admin/session";
import { USER_COOKIE, verifySessionToken } from "@/lib/auth/session";

function withAdminRobots(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminArea =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin");

  if (isAdminArea) {
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
      if (ok) {
        return withAdminRobots(NextResponse.redirect(new URL("/admin", request.url)));
      }
      return withAdminRobots(NextResponse.next());
    }

    if (!ok) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", pathname);
      return withAdminRobots(NextResponse.redirect(login));
    }

    return withAdminRobots(NextResponse.next());
  }

  const isCabinet =
    pathname === "/cabinet" || pathname.startsWith("/cabinet/");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isCabinet || isAuthPage) {
    const session = await verifySessionToken(
      request.cookies.get(USER_COOKIE)?.value
    );

    if (isAuthPage && session) {
      const next = request.nextUrl.searchParams.get("next") || "/cabinet";
      return NextResponse.redirect(new URL(next, request.url));
    }

    if (isCabinet && !session) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/(.*)",
    "/api/admin/(.*)",
    "/cabinet",
    "/cabinet/(.*)",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
