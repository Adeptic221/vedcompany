import { LeadsAdminTable } from "@/components/admin/LeadsAdminTable";
import { readLeads } from "@/lib/leads/storage";

export default async function AdminLeadsPage() {
  const leads = await readLeads();
  const sorted = [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light uppercase tracking-[0.15em]">Leads</h1>
        <p className="mt-1 text-sm text-white/50">{sorted.length} total</p>
      </div>
      <LeadsAdminTable leads={sorted} />
    </div>
  );
}
