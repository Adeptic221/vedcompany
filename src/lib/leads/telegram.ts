import type { LeadRecord, LeadType } from "@/types/lead";

const TYPE_LABELS: Record<LeadType, string> = {
  car_request: "Запрос на авто",
  callback: "Обратный звонок",
};

/** Экранирование пользовательского ввода для Telegram MarkdownV2 */
export function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
  } catch {
    return iso;
  }
}

export function formatLeadTelegramMessage(lead: LeadRecord): string {
  const lines: string[] = [
    "🆕 *Новая заявка*",
    "",
    `*Тип:* ${escapeMarkdownV2(TYPE_LABELS[lead.type] ?? lead.type)}`,
    `*Имя:* ${escapeMarkdownV2(lead.name)}`,
    `*Телефон:* ${escapeMarkdownV2(lead.phone)}`,
  ];

  if (lead.message) {
    lines.push(`*Сообщение:* ${escapeMarkdownV2(lead.message)}`);
  }
  if (lead.carLabel) {
    lines.push(`*Авто:* ${escapeMarkdownV2(lead.carLabel)}`);
  } else if (lead.carId) {
    lines.push(`*Авто ID:* ${escapeMarkdownV2(lead.carId)}`);
  }
  if (lead.source) {
    lines.push(`*Источник:* ${escapeMarkdownV2(lead.source)}`);
  }

  lines.push(
    "",
    `*ID:* \`${escapeMarkdownV2(lead.id)}\``,
    `*Дата:* ${escapeMarkdownV2(formatDate(lead.createdAt))}`,
  );

  return lines.join("\n");
}

export async function sendLeadToTelegram(lead: LeadRecord): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatLeadTelegramMessage(lead),
        parse_mode: "MarkdownV2",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[leads] Telegram failed:", err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[leads] Telegram failed:", err);
    return false;
  }
}
