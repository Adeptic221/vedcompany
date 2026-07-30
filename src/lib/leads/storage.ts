import { promises as fs } from "fs";
import path from "path";
import type { LeadRecord } from "@/types/lead";

const LEADS_FILE = path.join(process.cwd(), "data", "leads.json");

export async function readLeads(): Promise<LeadRecord[]> {
  try {
    const raw = await fs.readFile(LEADS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export async function appendLead(lead: LeadRecord): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(LEADS_FILE), { recursive: true });
    let existing: LeadRecord[] = [];
    try {
      const raw = await fs.readFile(LEADS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      existing = Array.isArray(parsed) ? parsed : [];
    } catch { existing = []; }
    existing.push(lead);
    await fs.writeFile(LEADS_FILE, JSON.stringify(existing, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.warn("[leads] File append failed:", err);
    return false;
  }
}

export async function forwardToWebhook(lead: LeadRecord): Promise<boolean> {
  const url = process.env.LEADS_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
    return res.ok;
  } catch (err) {
    console.error("[leads] Webhook failed:", err);
    return false;
  }
}