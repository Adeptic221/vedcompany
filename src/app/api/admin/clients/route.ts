import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listUsers } from "@/lib/auth/users-store";
import { listAllDocs } from "@/lib/cabinet/server-docs-store";
import { listOrders } from "@/lib/orders/orders-store";
import { listThreads } from "@/lib/chat/chat-store";
import { REQUIRED_DOC_SLOTS } from "@/lib/cabinet/documents";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [users, docs, orders, threads] = await Promise.all([
    listUsers(),
    listAllDocs(),
    listOrders(),
    listThreads(),
  ]);

  const clients = users.map((u) => {
    const userDocs = docs.filter((d) => d.userId === u.id);
    const kinds = new Set(userDocs.map((d) => d.kind).filter(Boolean));
    const docsDone = REQUIRED_DOC_SLOTS.filter((s) => kinds.has(s.kind)).length;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      phone: u.phone,
      createdAt: u.createdAt,
      ordersCount: orders.filter((o) => o.userId === u.id).length,
      docsCount: userDocs.length,
      docsDone,
      docsTotal: REQUIRED_DOC_SLOTS.length,
      chatUpdatedAt: threads.find((t) => t.userId === u.id)?.updatedAt || null,
    };
  });

  return NextResponse.json({ clients });
}