import type { LeadPayload, LeadType } from "@/types/lead";

const PHONE_RE = /^(\+7|8)?[\s\-()]*(\d[\s\-()]*){10}$/;

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) return "+7" + digits.slice(1);
  if (digits.length === 10) return "+7" + digits;
  return phone.trim();
}

export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (trimmed.length < 10) return false;
  return PHONE_RE.test(trimmed);
}

export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

export function isValidLeadType(type: unknown): type is LeadType {
  return type === "car_request" || type === "callback";
}

export function validateLeadPayload(body: unknown): { ok: true; data: LeadPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "\u041d\u0435\u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 \u0437\u0430\u043f\u0440\u043e\u0441" };
  const raw = body as Record<string, unknown>;
  if (!isValidLeadType(raw.type)) return { ok: false, error: "\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0442\u0438\u043f \u0437\u0430\u044f\u0432\u043a\u0438" };
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const phone = typeof raw.phone === "string" ? raw.phone.trim() : "";
  const message = typeof raw.message === "string" ? raw.message.trim().slice(0, 1000) : undefined;
  if (!isValidName(name)) return { ok: false, error: "\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0438\u043c\u044f (\u043c\u0438\u043d\u0438\u043c\u0443\u043c 2 \u0441\u0438\u043c\u0432\u043e\u043b\u0430)" };
  if (!isValidPhone(phone)) return { ok: false, error: "\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u044b\u0439 \u043d\u043e\u043c\u0435\u0440 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0430" };
  const carId = typeof raw.carId === "string" ? raw.carId.trim().slice(0, 64) : undefined;
  const carLabel = typeof raw.carLabel === "string" ? raw.carLabel.trim().slice(0, 200) : undefined;
  const source = typeof raw.source === "string" ? raw.source.trim().slice(0, 64) : undefined;
  if (raw.type === "car_request" && !carId && !carLabel) return { ok: false, error: "\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0430\u0432\u0442\u043e\u043c\u043e\u0431\u0438\u043b\u044c" };
  return { ok: true, data: { type: raw.type, name, phone: normalizePhone(phone), message: message || undefined, carId, carLabel, source } };
}