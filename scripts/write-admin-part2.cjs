const fs = require("fs");
const path = require("path");
function write(rel, content) {
  const full = path.join(__dirname, "..", rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("wrote", rel);
}

// Patch cars-store
const storePath = path.join(__dirname, "..", "src/lib/storage/cars-store.ts");
let store = fs.readFileSync(storePath, "utf8");
if (!store.includes("upsertCar")) {
  store = store.replace(/\r\n/g, "\n");
  if (!store.endsWith("\n")) store += "\n";
  store += `
export async function getCarById(id: string): Promise<Car | null> {
  const cars = await getCarsCatalog();
  return cars.find((car) => car.id === id) ?? null;
}

export async function upsertCar(car: Car): Promise<Car> {
  const cars = await getCarsCatalog();
  const idx = cars.findIndex((c) => c.id === car.id);
  if (idx >= 0) cars[idx] = car;
  else cars.unshift(car);
  await saveCarsCatalog(cars);
  return car;
}

export async function deleteCarById(id: string): Promise<boolean> {
  const cars = await getCarsCatalog();
  const next = cars.filter((car) => car.id !== id);
  if (next.length === cars.length) return false;
  await saveCarsCatalog(next);
  return true;
}
`;
  fs.writeFileSync(storePath, store, "utf8");
  console.log("patched cars-store.ts");
}

write("src/app/api/admin/login/route.ts", `import { NextRequest, NextResponse } from "next/server";
import {
  adminCookieOptions,
  getAdminSecret,
  getAdminSessionToken,
} from "@/lib/admin/auth";

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
`);

write("src/app/api/admin/logout/route.ts", `import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/auth";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
`);

write("src/app/api/admin/cars/route.ts", `import { NextRequest, NextResponse } from "next/server";
import { buildCarFromForm, type CarFormInput } from "@/lib/admin/car-form";
import { getCarsCatalog, upsertCar } from "@/lib/storage/cars-store";

export async function GET() {
  const cars = await getCarsCatalog();
  return NextResponse.json(cars);
}

export async function POST(request: NextRequest) {
  let body: CarFormInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.brand?.trim() || !body.model?.trim() || !body.year || !body.type) {
    return NextResponse.json(
      { error: "brand, model, year, type are required" },
      { status: 400 }
    );
  }

  const car = buildCarFromForm(body);
  await upsertCar(car);
  return NextResponse.json(car, { status: 201 });
}
`);

write("src/app/api/admin/cars/[id]/route.ts", `import { NextRequest, NextResponse } from "next/server";
import { buildCarFromForm, type CarFormInput } from "@/lib/admin/car-form";
import {
  deleteCarById,
  getCarById,
  upsertCar,
} from "@/lib/storage/cars-store";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const car = await getCarById(decodeURIComponent(id));
  if (!car) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(car);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const carId = decodeURIComponent(id);
  const existing = await getCarById(carId);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: CarFormInput;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const car = buildCarFromForm({ ...body, id: carId }, existing);
  await upsertCar(car);
  return NextResponse.json(car);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ok = await deleteCarById(decodeURIComponent(id));
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
`);

write("src/app/api/admin/leads/route.ts", `import { NextResponse } from "next/server";
import { readLeads } from "@/lib/leads/storage";

export async function GET() {
  const leads = await readLeads();
  const sorted = [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ count: sorted.length, leads: sorted });
}
`);

console.log("API routes done");
