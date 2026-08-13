import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request-user";
import { createOrder, listUserOrders } from "@/lib/orders/orders-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await listUserOrders(user.id);
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as {
    carId?: string;
    totalAmount?: number;
  };
  if (!body.carId || typeof body.totalAmount !== "number") {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const order = await createOrder({
    carId: body.carId,
    totalAmount: body.totalAmount,
    paidAmount: Math.round(body.totalAmount * 0.3),
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
  });
  return NextResponse.json({ order });
}