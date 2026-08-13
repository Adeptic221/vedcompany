import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { listAllDocs, listUserDocs } from "@/lib/cabinet/server-docs-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = new URL(request.url).searchParams.get("userId");
  const documents = userId ? await listUserDocs(userId) : await listAllDocs();
  return NextResponse.json({ documents });
}