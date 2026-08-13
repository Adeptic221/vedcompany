import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { updateOrderStatus } from "@/lib/orders/orders-store";
import type { OrderStatus } from "@/types/cart";
import { statusSteps } from "@/lib/cabinet/constants";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = (await request.json()) as { status?: OrderStatus };
  if (!body.status || !statusSteps.includes(body.status)) {
    return NextResponse.json({ error: "Некорректный статус" }, { status: 400 });
  }
  const order = await updateOrderStatus(id, body.status);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}