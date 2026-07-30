"use client";
import type { LeadPayload } from "@/types/lead";
const STORAGE_KEY = "ved_leads_backup";
export interface LocalLeadBackup extends LeadPayload { id: string; createdAt: string; }
export function saveLeadLocally(lead: LocalLeadBackup): void {
  try {
    const existing = getLocalLeads();
    existing.push(lead);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(-50)));
  } catch {}
}
export function getLocalLeads(): LocalLeadBackup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
export function getLocalLeadsCount(): number { return getLocalLeads().length; }