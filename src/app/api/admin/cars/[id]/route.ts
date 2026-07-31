import { NextRequest, NextResponse } from "next/server";
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
