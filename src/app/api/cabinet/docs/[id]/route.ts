import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request-user";
import { deleteUserDoc } from "@/lib/cabinet/server-docs-store";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const ok = await deleteUserDoc(id, user.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}