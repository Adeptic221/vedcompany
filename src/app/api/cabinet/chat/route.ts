import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/request-user";
import { appendMessage, getThread } from "@/lib/chat/chat-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const thread = await getThread(user.id);
  return NextResponse.json({ messages: thread.messages });
}

export async function POST(request: Request) {
  const user = await getRequestUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { text?: string };
  const text = (body.text || "").trim();
  if (!text) return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
  const thread = await appendMessage({
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    text,
    from: "client",
  });
  return NextResponse.json({ messages: thread.messages });
}