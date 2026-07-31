"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Car } from "@/types/car";
import { formatPrice, getTotalPrice, carTypeLabels } from "@/data/cars";

export function CarsAdminTable({ cars }: { cars: Car[] }) {
  const router = useRouter();

  async function remove(id: string, label: string) {
    if (!confirm(`Delete ${label}?`)) return;
    const res = await fetch(`/api/admin/cars/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    router.refresh();
  }

  if (cars.length === 0) {
    return <p className="text-white/50">Catalog is empty.</p>;
  }

  return (
    <div className="overflow-x-auto border border-white/10">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-white/50">
          <tr>
            <th className="px-3 py-3 font-normal">Car</th>
            <th className="px-3 py-3 font-normal">Type</th>
            <th className="px-3 py-3 font-normal">Year</th>
            <th className="px-3 py-3 font-normal">Total</th>
            <th className="px-3 py-3 font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {cars.map((car) => (
            <tr key={car.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-3 py-3">
                <div className="text-white">{car.brand} {car.model}</div>
                <div className="text-xs text-white/40">{car.id}</div>
              </td>
              <td className="px-3 py-3 text-white/70">{carTypeLabels[car.type] || car.type}</td>
              <td className="px-3 py-3 text-white/70">{car.year}</td>
              <td className="px-3 py-3 text-white/90">{formatPrice(getTotalPrice(car))}</td>
              <td className="px-3 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/admin/cars/${encodeURIComponent(car.id)}`}
                    className="border border-white/20 px-2 py-1 text-xs uppercase tracking-wider text-white/70 hover:border-white/40 hover:text-white"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(car.id, `${car.brand} ${car.model}`)}
                    className="border border-red-400/30 px-2 py-1 text-xs uppercase tracking-wider text-red-200/80 hover:border-red-300/50"
                  >
                    Del
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
