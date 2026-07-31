import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminSessionToken } from "@/lib/admin/session";

function withAdminRobots(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

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

  if (isAdminPage) {
    return withAdminRobots(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/(.*)", "/api/admin/(.*)"],
};
