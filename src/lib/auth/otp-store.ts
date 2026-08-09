import { promises as fs } from "fs";
import path from "path";

export type OtpRecord = {
  phone: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  sentAt: number;
  sendCount: number;
  windowStart: number;
};

const OTP_FILE = path.join(process.cwd(), "data", "otp.json");
const memory = new Map<string, OtpRecord>();

async function readAll(): Promise<Record<string, OtpRecord>> {
  try {
    const raw = await fs.readFile(OTP_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, OtpRecord>): Promise<void> {
  await fs.mkdir(path.dirname(OTP_FILE), { recursive: true });
  await fs.writeFile(OTP_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getOtp(phone: string): Promise<OtpRecord | null> {
  if (memory.has(phone)) return memory.get(phone) || null;
  const all = await readAll();
  const row = all[phone];
  if (row) memory.set(phone, row);
  return row || null;
}

export async function setOtp(record: OtpRecord): Promise<void> {
  memory.set(record.phone, record);
  try {
    const all = await readAll();
    all[record.phone] = record;
    // drop expired
    const now = Date.now();
    for (const key of Object.keys(all)) {
      if (all[key].expiresAt < now) delete all[key];
    }
    await writeAll(all);
  } catch (err) {
    console.warn("[otp] file write failed:", err);
  }
}

export async function clearOtp(phone: string): Promise<void> {
  memory.delete(phone);
  try {
    const all = await readAll();
    delete all[phone];
    await writeAll(all);
  } catch {
    /* ignore */
  }
}

export async function hashOtpCode(code: string): Promise<string> {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.ADMIN_SECRET ||
    process.env.SYNC_CRON_SECRET ||
    "ved-otp";
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(code));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}