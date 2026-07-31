import { NextRequest, NextResponse } from "next/server";
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
