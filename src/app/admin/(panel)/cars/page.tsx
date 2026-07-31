import Link from "next/link";
import { CarsAdminTable } from "@/components/admin/CarsAdminTable";
import { getCarsCatalog } from "@/lib/storage/cars-store";

export default async function AdminCarsPage() {
  const cars = await getCarsCatalog();
  const sorted = [...cars].sort((a, b) =>
    `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "ru")
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-light uppercase tracking-[0.15em]">Cars</h1>
          <p className="mt-1 text-sm text-white/50">{sorted.length} in catalog</p>
        </div>
        <Link
          href="/admin/cars/new"
          className="border border-white px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-ved-navy"
        >
          Add car
        </Link>
      </div>
      <CarsAdminTable cars={sorted} />
    </div>
  );
}
