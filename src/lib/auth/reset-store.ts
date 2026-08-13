import { promises as fs } from "fs";
import path from "path";

export type ResetRecord = {
  email: string;
  tokenHash: string;
  expiresAt: number;
  createdAt: number;
};

const RESET_FILE = path.join(process.cwd(), "data", "password-resets.json");
const memory = new Map<string, ResetRecord>();

async function readAll(): Promise<Record<string, ResetRecord>> {
  try {
    const raw = await fs.readFile(RESET_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, ResetRecord>): Promise<void> {
  await fs.mkdir(path.dirname(RESET_FILE), { recursive: true });
  await fs.writeFile(RESET_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function hashResetToken(token: string): Promise<string> {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.ADMIN_SECRET ||
    process.env.SYNC_CRON_SECRET ||
    "ved-reset";
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(token));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function createResetToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function saveResetToken(
  email: string,
  token: string
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const tokenHash = await hashResetToken(token);
  const record: ResetRecord = {
    email: normalized,
    tokenHash,
    expiresAt: Date.now() + 60 * 60 * 1000,
    createdAt: Date.now(),
  };
  memory.set(normalized, record);
  try {
    const all = await readAll();
    const now = Date.now();
    for (const key of Object.keys(all)) {
      if (all[key].expiresAt < now) delete all[key];
    }
    all[normalized] = record;
    await writeAll(all);
  } catch (err) {
    console.warn("[reset] file write failed:", err);
  }
}

export async function consumeResetToken(
  email: string,
  token: string
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const tokenHash = await hashResetToken(token);
  let record = memory.get(normalized) || null;
  if (!record) {
    const all = await readAll();
    record = all[normalized] || null;
  }
  if (!record) return false;
  if (record.expiresAt < Date.now()) {
    await clearResetToken(normalized);
    return false;
  }
  if (record.tokenHash !== tokenHash) return false;
  await clearResetToken(normalized);
  return true;
}

export async function clearResetToken(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  memory.delete(normalized);
  try {
    const all = await readAll();
    delete all[normalized];
    await writeAll(all);
  } catch {
    /* ignore */
  }
}