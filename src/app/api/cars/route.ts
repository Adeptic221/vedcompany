import { NextResponse } from "next/server";
import { getCarsCatalog } from "@/lib/storage/cars-store";

export async function GET() {
  const cars = await getCarsCatalog();
  return NextResponse.json(cars);
}