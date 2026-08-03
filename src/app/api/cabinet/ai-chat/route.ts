import { NextResponse } from "next/server";
import { buildCabinetSystemPrompt, type ClientCarContext } from "@/lib/ai/cabinet-prompt";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientIp } from "@/lib/security/request";

export const runtime = "nodejs";

type ChatRole = "user" | "assistant" | "system";

type IncomingMessage = {
  role: ChatRole;
  content: string;
};

type RequestBody = {
  messages?: IncomingMessage[];
  imageBase64?: string;
  imageMime?: string;
  contextCars?: ClientCarContext[];
};

const MAX_MESSAGES = 24;
const MAX_CONTENT = 4000;

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const limited = checkRateLimit(`cabinet-ai:${ip}`, 30, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Слишком много запросов. Попробуйте позже." }, { status: 429 });
  }

  const apiKey =
    process.env.DEEPSEEK_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "ИИ временно недоступен: не задан DEEPSEEK_API_KEY." },
      { status: 503 }
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.imageBase64 === "string" && body.imageBase64.length > 0) {
    return NextResponse.json(
      {
        error:
          "DeepSeek пока не анализирует фото. Опишите авто или узел текстом / голосом.",
      },
      { status: 400 }
    );
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const cleaned = rawMessages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.trim().slice(0, MAX_CONTENT),
    }))
    .filter((m) => m.content.length > 0);

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
  }

  const contextCars = Array.isArray(body.contextCars)
    ? body.contextCars.slice(0, 8).map((c) => ({
        brand: typeof c?.brand === "string" ? c.brand.slice(0, 40) : undefined,
        model: typeof c?.model === "string" ? c.model.slice(0, 40) : undefined,
        year: typeof c?.year === "number" ? c.year : undefined,
        type: typeof c?.type === "string" ? c.type.slice(0, 24) : undefined,
      }))
    : [];

  const systemPrompt = buildCabinetSystemPrompt(contextCars);
  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat";
  const baseUrl = (process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com").replace(/\/$/, "");

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 900,
        messages: [{ role: "system", content: systemPrompt }, ...cleaned],
      }),
    });
  } catch {
    return NextResponse.json({ error: "Не удалось связаться с DeepSeek" }, { status: 502 });
  }

  const data = (await upstream.json().catch(() => null)) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  } | null;

  if (!upstream.ok) {
    const msg = data?.error?.message || "Ошибка DeepSeek API";
    return NextResponse.json({ error: msg }, { status: upstream.status === 429 ? 429 : 502 });
  }

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return NextResponse.json({ error: "Пустой ответ ИИ" }, { status: 502 });
  }

  return NextResponse.json({ reply });
}
