"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { carTypeLabels } from "@/data/cars";
const brands = [{ value: "", label: "\u0412\u0441\u0435 \u043c\u0430\u0440\u043a\u0438" },{ value: "toyota", label: "Toyota" },{ value: "bmw", label: "BMW" },{ value: "mercedes", label: "Mercedes-Benz" },{ value: "audi", label: "Audi" },{ value: "lexus", label: "Lexus" },{ value: "porsche", label: "Porsche" }];
const budgets = [{ value: "", label: "\u041b\u044e\u0431\u043e\u0439 \u0431\u044e\u0434\u0436\u0435\u0442" },{ value: "2000000", label: "\u0434\u043e 2 000 000 \u20bd" },{ value: "4000000", label: "\u0434\u043e 4 000 000 \u20bd" },{ value: "6000000", label: "\u0434\u043e 6 000 000 \u20bd" },{ value: "10000000", label: "\u0434\u043e 10 000 000 \u20bd" }];
export function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/catalog?${params.toString()}`);
  }
  const current = { brand: searchParams.get("brand") ?? "", type: searchParams.get("type") ?? "", year: searchParams.get("year") ?? "", budget: searchParams.get("budget") ?? "" };
  return (
    <aside className="space-y-4 border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <h2 className="text-xs uppercase tracking-[0.2em] text-white/60">{"\u0424\u0438\u043b\u044c\u0442\u0440\u044b"}</h2>
      <label className="block"><span className="mb-1 block text-xs text-white/50">{"\u041c\u0430\u0440\u043a\u0430"}</span><select className="ved-select" value={current.brand} onChange={(e) => updateFilter("brand", e.target.value)}>{brands.map((b) => (<option key={b.value} value={b.value}>{b.label}</option>))}</select></label>
      <label className="block"><span className="mb-1 block text-xs text-white/50">{"\u0422\u0438\u043f \u043a\u0443\u0437\u043e\u0432\u0430"}</span><select className="ved-select" value={current.type} onChange={(e) => updateFilter("type", e.target.value)}><option value="">{"\u0412\u0441\u0435 \u0442\u0438\u043f\u044b"}</option>{Object.entries(carTypeLabels).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}</select></label>
      <label className="block"><span className="mb-1 block text-xs text-white/50">{"\u0413\u043e\u0434"}</span><select className="ved-select" value={current.year} onChange={(e) => updateFilter("year", e.target.value)}><option value="">{"\u041b\u044e\u0431\u043e\u0439"}</option>{[2026,2025,2024,2023,2022].map((y) => (<option key={y} value={String(y)}>{y}</option>))}</select></label>
      <label className="block"><span className="mb-1 block text-xs text-white/50">{"\u0411\u044e\u0434\u0436\u0435\u0442"}</span><select className="ved-select" value={current.budget} onChange={(e) => updateFilter("budget", e.target.value)}>{budgets.map((b) => (<option key={b.value} value={b.value}>{b.label}</option>))}</select></label>
      <button type="button" onClick={() => router.push("/catalog")} className="w-full border border-white/20 py-2 text-xs uppercase tracking-wider text-white/60 transition hover:border-white/40 hover:text-white">{"\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c"}</button>
    </aside>
  );
}