import Link from "next/link";
import { getCarsCatalog } from "@/lib/storage/cars-store";
import { readLeads } from "@/lib/leads/storage";
import { getCarsStorageInfo } from "@/lib/storage/cars-store";

export default async function AdminDashboardPage() {
  const [cars, leads] = await Promise.all([getCarsCatalog(), readLeads()]);
  const storage = getCarsStorageInfo();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light uppercase tracking-[0.15em]">Dashboard</h1>
        <p className="mt-2 text-sm text-white/50">MVP admin: cars and leads</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/cars"
          className="border border-white/10 bg-white/5 p-6 transition hover:border-white/25"
        >
          <p className="text-xs uppercase tracking-widest text-white/50">Cars</p>
          <p className="mt-2 text-3xl font-light">{cars.length}</p>
        </Link>
        <Link
          href="/admin/leads"
          className="border border-white/10 bg-white/5 p-6 transition hover:border-white/25"
        >
          <p className="text-xs uppercase tracking-widest text-white/50">Leads</p>
          <p className="mt-2 text-3xl font-light">{leads.length}</p>
        </Link>
      </div>

      {storage.isServerless && (
        <p className="border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100/90">
          Serverless host: catalog writes go to temporary storage and may reset after redeploy.
          Prefer editing locally and committing data/cars.catalog.json, or use a persistent DB later.
        </p>
      )}
    </div>
  );
}
