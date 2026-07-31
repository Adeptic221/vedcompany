function hostnameAllowed(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return true;
  if (host === "vedcompany.ru" || host === "www.vedcompany.ru") return true;
  if (host.endsWith(".vercel.app")) return true;
  return false;
}

function urlAllowed(raw: string): boolean {
  try {
    return hostnameAllowed(new URL(raw).hostname);
  } catch {
    return false;
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin) return urlAllowed(origin);
  const referer = request.headers.get("referer");
  if (referer) return urlAllowed(referer);
  return true;
}
