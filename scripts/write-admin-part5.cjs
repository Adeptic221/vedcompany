const fs = require("fs");
const path = require("path");

function write(rel, content) {
  const full = path.join(__dirname, "..", rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("wrote", rel);
}

write("src/lib/admin/session.ts", `export const ADMIN_COOKIE = "ved_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function getAdminSecret(): string | null {
  return process.env.ADMIN_SECRET || process.env.SYNC_CRON_SECRET || null;
}

export async function getAdminSessionToken(): Promise<string | null> {
  const secret = getAdminSecret();
  if (!secret) return null;
  const data = new TextEncoder().encode(\`ved-admin:\${secret}\`);
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
`);

write("src/lib/admin/auth.ts", `import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin/session";

export {
  ADMIN_COOKIE,
  getAdminSecret,
  getAdminSessionToken,
  verifyAdminToken,
  adminCookieOptions,
} from "@/lib/admin/session";

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}
`);

write("src/middleware.ts", `import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, getAdminSessionToken } from "@/lib/admin/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const expected = await getAdminSessionToken();
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const ok = Boolean(expected && token && token === expected);

  if (pathname === "/api/admin/login") return NextResponse.next();

  if (pathname === "/admin/login") {
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
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
`);

// Fix login route imports to use session for cookie options
const loginPath = path.join(__dirname, "..", "src/app/api/admin/login/route.ts");
let login = fs.readFileSync(loginPath, "utf8");
login = login.replace(
  'from "@/lib/admin/auth"',
  'from "@/lib/admin/session"'
);
fs.writeFileSync(loginPath, login, "utf8");
console.log("patched login route");

const logoutPath = path.join(__dirname, "..", "src/app/api/admin/logout/route.ts");
let logout = fs.readFileSync(logoutPath, "utf8");
logout = logout.replace(
  'from "@/lib/admin/auth"',
  'from "@/lib/admin/session"'
);
fs.writeFileSync(logoutPath, logout, "utf8");
console.log("patched logout route");

// Fix car-form slugify - simpler ascii
write("src/lib/admin/car-form.ts", `import type { Car, CarType } from "@/types/car";

export const CAR_TYPES: CarType[] = ["sedan", "crossover", "suv", "hatchback", "coupe"];

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "car"
  );
}

export interface CarFormInput {
  id?: string;
  brand: string;
  brandSlug?: string;
  model: string;
  year: number;
  type: CarType;
  price: number;
  customsCost: number;
  deliveryDays: number;
  country: string;
  imageColor?: string;
  description: string;
  photoUrl?: string;
  engine?: string;
  power?: string;
  transmission?: string;
  drive?: string;
  fuel?: string;
  consumption?: string;
}

export function buildCarFromForm(input: CarFormInput, existing?: Car | null): Car {
  const brand = input.brand.trim();
  const model = input.model.trim();
  const brandSlug = (input.brandSlug || slugify(brand)).trim() || slugify(brand);
  const year = Number(input.year);
  const id = (
    input.id ||
    existing?.id ||
    \`admin-\${brandSlug}-\${slugify(model)}-\${year}\`
  ).trim();
  const photoUrl = (input.photoUrl || "").trim();
  const photos = photoUrl
    ? [photoUrl]
    : existing?.sync?.photos?.length
      ? existing.sync.photos
      : [];

  return {
    id,
    brand,
    brandSlug,
    model,
    year,
    type: input.type,
    price: Number(input.price) || 0,
    customsCost: Number(input.customsCost) || 0,
    deliveryDays: Number(input.deliveryDays) || 45,
    country: input.country.trim() || "China",
    imageColor: input.imageColor || existing?.imageColor || "#1a3a5c",
    description: input.description.trim() || \`\${brand} \${model} \${year}\`,
    specs: {
      engine: input.engine?.trim() || existing?.specs.engine || "-",
      power: input.power?.trim() || existing?.specs.power || "-",
      transmission:
        input.transmission?.trim() || existing?.specs.transmission || "Auto",
      drive: input.drive?.trim() || existing?.specs.drive || "FWD",
      fuel: input.fuel?.trim() || existing?.specs.fuel || "Petrol",
      consumption:
        input.consumption?.trim() || existing?.specs.consumption || "-",
    },
    sync: photos.length
      ? {
          source: "autohome",
          sourceId: id,
          sourceUrl: existing?.sync?.sourceUrl || "https://vedcompany.ru",
          photos,
          priceCny: existing?.sync?.priceCny || 0,
          exchangeRate: existing?.sync?.exchangeRate || 12.5,
          exchangeBank: "VTB",
          exchangeRateAt:
            existing?.sync?.exchangeRateAt || new Date().toISOString(),
          customsSource: "tks.ru",
          syncedAt: new Date().toISOString(),
        }
      : existing?.sync,
  };
}
`);

console.log("auth split ok");
