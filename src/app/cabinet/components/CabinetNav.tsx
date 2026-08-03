"use client";

import type { CabinetTab } from "@/lib/cabinet/constants";
import { cabinetTabs } from "@/lib/cabinet/constants";

interface CabinetNavProps {
  tab: CabinetTab;
  onTabChange: (tab: CabinetTab) => void;
  cartCount: number;
  favoritesCount: number;
}

export function CabinetNav({
  tab,
  onTabChange,
  cartCount,
  favoritesCount,
}: CabinetNavProps) {
  const badge = (id: CabinetTab) => {
    if (id === "cart" && cartCount > 0) return cartCount;
    if (id === "favorites" && favoritesCount > 0) return favoritesCount;
    return null;
  };

  return (
    <>
      <div className="lg:hidden">
        <label htmlFor="cabinet-tab-select" className="sr-only">
          Раздел личного кабинета
        </label>
        <select
          id="cabinet-tab-select"
          value={tab}
          onChange={(e) => onTabChange(e.target.value as CabinetTab)}
          className="ved-glass ved-select w-full border border-white/10 px-4 py-3 text-sm outline-none focus:border-white/30"
        >
          {cabinetTabs.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
              {badge(t.id) ? ` (${badge(t.id)})` : ""}
            </option>
          ))}
        </select>
      </div>

      <nav className="hidden w-full shrink-0 lg:flex lg:flex-col lg:gap-1.5">
        {cabinetTabs.map((t) => {
          const count = badge(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`flex items-center justify-between gap-2 border px-4 py-3 text-left text-xs uppercase tracking-wider transition ${
                tab === t.id
                  ? "border-white bg-white/10 text-white"
                  : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
              }`}
            >
              <span className="min-w-0 whitespace-normal leading-snug">{t.label}</span>
              {count !== null && (
                <span className="ml-2 shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white/70">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <nav className="hidden shrink-0 snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex lg:hidden [&::-webkit-scrollbar]:hidden">
        {cabinetTabs.map((t) => {
          const count = badge(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`snap-start whitespace-nowrap border px-4 py-2.5 text-xs uppercase tracking-wider transition ${
                tab === t.id
                  ? "border-white bg-white/10 text-white"
                  : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
              }`}
            >
              {t.label}
              {count !== null && (
                <span className="ml-1.5 text-white/60">({count})</span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
