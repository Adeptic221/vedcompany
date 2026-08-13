import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request-user";
import { getDocById, readDocBytes } from "@/lib/cabinet/server-docs-store";
import { isAdminAuthenticated } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const doc = await getDocById(id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await getRequestUser();
  const admin = await isAdminAuthenticated();
  if (!admin && (!user || doc.userId !== user.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (doc.url) {
    return NextResponse.redirect(doc.url);
  }

  const payload = await readDocBytes(doc);
  if (!payload) return NextResponse.json({ error: "File missing" }, { status: 404 });

  return new NextResponse(new Uint8Array(payload.bytes), {
    headers: {
      "Content-Type": payload.mime,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(payload.name)}`,
    },
  });
}