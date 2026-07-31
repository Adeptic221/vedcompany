import type { LeadRecord } from "@/types/lead";

export function LeadsAdminTable({ leads }: { leads: LeadRecord[] }) {
  if (leads.length === 0) {
    return (
      <p className="text-sm text-white/50">
        No leads yet. On Netlify file storage is ephemeral ? also set Telegram/webhook in env.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-white/50">
          <tr>
            <th className="px-3 py-3 font-normal">Date</th>
            <th className="px-3 py-3 font-normal">Name</th>
            <th className="px-3 py-3 font-normal">Phone</th>
            <th className="px-3 py-3 font-normal">Type</th>
            <th className="px-3 py-3 font-normal">Message</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-white/5 align-top hover:bg-white/5">
              <td className="px-3 py-3 text-white/60 whitespace-nowrap">
                {new Date(lead.createdAt).toLocaleString("ru-RU")}
              </td>
              <td className="px-3 py-3 text-white">{lead.name}</td>
              <td className="px-3 py-3 text-white/80">{lead.phone}</td>
              <td className="px-3 py-3 text-white/60">{lead.type}</td>
              <td className="px-3 py-3 text-white/70">
                {lead.carLabel && <div className="mb-1 text-white/90">{lead.carLabel}</div>}
                {lead.message || "?"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
