import type { SessionPayload } from "@/types/user";

export const USER_COOKIE = "ved_user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 14;

function getAuthSecret(): string | null {
  return (
    process.env.AUTH_SECRET ||
    process.env.ADMIN_SECRET ||
    process.env.SYNC_CRON_SECRET ||
    null
  );
}

function base64UrlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 =
    typeof btoa === "function"
      ? btoa(bin)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  if (typeof atob === "function") {
    const bin = atob(padded);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(padded, "base64"));
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return base64UrlEncode(new Uint8Array(sig));
}

export async function createSessionToken(payload: {
  id: string;
  email: string;
  name: string;
  phone: string;
}): Promise<string | null> {
  const secret = getAuthSecret();
  if (!secret) return null;

  const body: SessionPayload = {
    sub: payload.id,
    email: payload.email,
    name: payload.name,
    phone: payload.phone,
    exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE,
  };
  const json = JSON.stringify(body);
  const data = base64UrlEncode(new TextEncoder().encode(json));
  const sig = await hmacSign(data, secret);
  return `${data}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  const secret = getAuthSecret();
  if (!secret) return null;

  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = await hmacSign(data, secret);
  if (expected.length !== sig.length) return null;
  let ok = true;
  for (let i = 0; i < expected.length; i++) {
    if (expected.charCodeAt(i) !== sig.charCodeAt(i)) ok = false;
  }
  if (!ok) return null;

  try {
    const json = new TextDecoder().decode(base64UrlDecode(data));
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload?.sub || !payload.email || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function userCookieOptions(token: string) {
  return {
    name: USER_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export function clearUserCookieOptions() {
  return {
    name: USER_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}