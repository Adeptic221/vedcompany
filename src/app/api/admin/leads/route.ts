import { NextResponse } from "next/server";
import { readLeads } from "@/lib/leads/storage";

export async function GET() {
  const leads = await readLeads();
  const sorted = [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ count: sorted.length, leads: sorted });
}
