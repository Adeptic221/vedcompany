export const ADMIN_COOKIE = "ved_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function getAdminSecret(): string | null {
  return process.env.ADMIN_SECRET || process.env.SYNC_CRON_SECRET || null;
}

export async function getAdminSessionToken(): Promise<string | null> {
  const secret = getAdminSecret();
  if (!secret) return null;
  const data = new TextEncoder().encode(`ved-admin:${secret}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyAdminToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const expected = await getAdminSessionToken();
  if (!expected || token.length !== expected.length) return false;
  let ok = true;
  for (let i = 0; i < expected.length; i++) {
    if (token.charCodeAt(i) !== expected.charCodeAt(i)) ok = false;
  }
  return ok;
}

export function adminCookieOptions(token: string) {
  return {
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}
