import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request-user";
import type { CabinetDocKind } from "@/lib/cabinet/documents";
import { listUserDocs, saveUserDoc } from "@/lib/cabinet/server-docs-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const documents = await listUserDocs(user.id);
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") || "other") as CabinetDocKind;
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }
  if (file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ error: "Максимум 12 МБ" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const doc = await saveUserDoc({
    userId: user.id,
    userEmail: user.email,
    kind,
    fileName: file.name || "document",
    mime: file.type || "application/octet-stream",
    bytes,
  });
  return NextResponse.json({ document: doc });
}