import { NextResponse } from "next/server";
import { appendLead, forwardToWebhook, readLeads } from "@/lib/leads/storage";
import { sendLeadToTelegram } from "@/lib/leads/telegram";
import { validateLeadPayload } from "@/lib/leads/validation";
import type { LeadRecord } from "@/types/lead";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientIp } from "@/lib/security/request";

function createLeadId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

export async function GET() {
  const leads = await readLeads();
  return NextResponse.json({
    count: leads.length,
    note: "Netlify: \u0437\u0430\u0434\u0430\u0439\u0442\u0435 TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID \u0438\u043b\u0438 LEADS_WEBHOOK_URL",
  });
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const limited = checkRateLimit(`leads:${ip}`, 20, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
  const validation = validateLeadPayload(body);
  if (!validation.ok) {
    return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
  }
  const lead: LeadRecord = { ...validation.data, id: createLeadId(), createdAt: new Date().toISOString() };
  const [fileSaved, webhookSent, telegramSent] = await Promise.all([
    appendLead(lead),
    forwardToWebhook(lead),
    sendLeadToTelegram(lead),
  ]);
  const persisted = fileSaved || webhookSent || telegramSent;
  if (!persisted) console.info("[leads] Accepted:", lead.id);
  return NextResponse.json({ success: true, id: lead.id, persisted, message: "\u0417\u0430\u044f\u0432\u043a\u0430 \u043f\u0440\u0438\u043d\u044f\u0442\u0430" });
}
