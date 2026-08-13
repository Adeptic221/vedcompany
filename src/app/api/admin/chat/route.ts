import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { appendMessage, getThread, listThreads } from "@/lib/chat/chat-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) {
    const threads = await listThreads();
    return NextResponse.json({ threads });
  }
  const thread = await getThread(userId);
  return NextResponse.json({ thread });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    userId?: string;
    text?: string;
    userEmail?: string;
    userName?: string;
  };
  if (!body.userId || !(body.text || "").trim()) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const thread = await appendMessage({
    userId: body.userId,
    userEmail: body.userEmail,
    userName: body.userName,
    text: body.text!.trim(),
    from: "manager",
  });
  return NextResponse.json({ thread });
}