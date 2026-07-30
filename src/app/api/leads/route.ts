import { NextResponse } from "next/server";
import { appendLead, forwardToWebhook, readLeads } from "@/lib/leads/storage";
import { sendLeadToTelegram } from "@/lib/leads/telegram";
import { validateLeadPayload } from "@/lib/leads/validation";
import type { LeadRecord } from "@/types/lead";

function createLeadId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}-${rand}`;
}

export async function GET() {
  const leads = await readLeads();
  return NextResponse.json({
    count: leads.length,
    note: "Netlify: задайте TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID или LEADS_WEBHOOK_URL",
  });
}

export async function POST(request: Request) {
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