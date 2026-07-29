"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  carTypeLabels,
  countActiveFilters,
  fuelLabels,
  sortLabels,
  type CatalogFilterMeta,
  type CatalogSearchParams,
  type CatalogSort,
} from "@/data/cars";

const priceSteps = [
  { value: "", label: "Любая" },
  { value: "2000000", label: "2 000 000 ₽" },
  { value: "4000000", label: "4 000 000 ₽" },
  { value: "6000000", label: "6 000 000 ₽" },
  { value: "8000000", label: "8 000 000 ₽" },
  { value: "10000000", label: "10 000 000 ₽" },
];

function readFilters(searchParams: URLSearchParams): CatalogSearchParams {
  return {
    brand: searchParams.get("brand") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    year: searchParams.get("year") ?? undefined,
    fuel: searchParams.get("fuel") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    priceMin: searchParams.get("priceMin") ?? undefined,
    priceMax: searchParams.get("priceMax") ?? searchParams.get("budget") ?? undefined,
    model: searchParams.get("model") ?? undefined,
    budget: searchParams.get("budget") ?? undefined,
  };
}

function FilterFields({
  meta,
  current,
  searchDraft,
  onSearchChange,
  updateFilter,
  updateFilters,
}: {
  meta: CatalogFilterMeta;
  current: CatalogSearchParams;
  searchDraft: string;
  onSearchChange: (value: string) => void;
  updateFilter: (key: string, value: string) => void;
  updateFilters: (updates: Record<string, string>) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs text-white/50">Поиск</span>
        <input
          type="search"
          className="ved-input"
          placeholder="Марка, модель..."
          value={searchDraft}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Поиск по марке и модели"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-white/50">Сортировка</span>
        <select
          className="ved-select"
          value={current.sort || "newest"}
          onChange={(e) => updateFilter("sort", e.target.value === "newest" ? "" : e.target.value)}
        >
          {(Object.entries(sortLabels) as [CatalogSort, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-white/50">Марка</span>
        <select className="ved-select" value={current.brand ?? ""} onChange={(e) => updateFilter("brand", e.target.value)}>
          <option value="">Все марки</option>
          {meta.brands.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-white/50">Тип кузова</span>
        <select className="ved-select" value={current.type ?? ""} onChange={(e) => updateFilter("type", e.target.value)}>
          <option value="">Все типы</option>
          {meta.types.map((value) => (
            <option key={value} value={value}>
              {carTypeLabels[value]}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-white/50">Год</span>
        <select className="ved-select" value={current.year ?? ""} onChange={(e) => updateFilter("year", e.target.value)}>
          <option value="">Любой</option>
          {meta.years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </label>

      {meta.fuels.length > 0 && (
        <label className="block">
          <span className="mb-1 block text-xs text-white/50">Топливо</span>
          <select className="ved-select" value={current.fuel ?? ""} onChange={(e) => updateFilter("fuel", e.target.value)}>
            <option value="">Любое</option>
            {meta.fuels.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuelLabels[fuel] ?? fuel}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-white/50">Цена от</span>
          <select
            className="ved-select"
            value={current.priceMin ?? ""}
            onChange={(e) => updateFilter("priceMin", e.target.value)}
          >
            {priceSteps.map((step) => (
              <option key={`min-${step.value || "any"}`} value={step.value}>
                {step.value ? `от ${step.label}` : step.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-white/50">Цена до</span>
          <select
            className="ved-select"
            value={current.priceMax ?? ""}
            onChange={(e) => {
              updateFilters({ priceMax: e.target.value, budget: e.target.value });
            }}
          >
            {priceSteps.map((step) => (
              <option key={`max-${step.value || "any"}`} value={step.value}>
                {step.value ? `до ${step.label}` : step.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export function CatalogFilters({ meta }: { meta: CatalogFilterMeta }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(() => searchParams.get("q") ?? "");

  const current = readFilters(searchParams);
  const activeCount = countActiveFilters(current);

  const pushParams = useCallback(
    (params: URLSearchParams) => {
      const query = params.toString();
      router.push(query ? `/catalog?${query}` : "/catalog");
    },
    [router],
  );

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key === "priceMax") params.delete("budget");
      pushParams(params);
    },
    [searchParams, pushParams],
  );

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      pushParams(params);
    },
    [searchParams, pushParams],
  );

  const clearFilters = useCallback(() => {
    setSearchDraft("");
    setMobileOpen(false);
    router.push("/catalog");
  }, [router]);

  useEffect(() => {
    setSearchDraft(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    if (searchDraft === urlQ) return;

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = searchDraft.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      pushParams(params);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchDraft, searchParams, pushParams]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const filterContent = (
    <>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs uppercase tracking-[0.2em] text-white/60">Фильтры</h2>
        {activeCount > 0 && (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">{activeCount}</span>
        )}
      </div>

      <FilterFields
        meta={meta}
        current={current}
        searchDraft={searchDraft}
        onSearchChange={setSearchDraft}
        updateFilter={updateFilter}
        updateFilters={updateFilters}
      />

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full border border-white/20 py-2 text-xs uppercase tracking-wider text-white/60 transition hover:border-white/40 hover:text-white"
        >
          Сбросить фильтры
        </button>
      )}
    </>
  );

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="ved-glass flex w-full items-center justify-between border border-white/10 px-4 py-3 text-sm"
        >
          <span className="uppercase tracking-[0.15em] text-white/80">Фильтры и сортировка</span>
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-xs">{activeCount}</span>
          )}
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label="Закрыть фильтры"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative ml-auto flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-ved-navy/95 p-5 shadow-xl backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-white/60">Фильтры</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="border border-white/20 px-3 py-1 text-xs uppercase tracking-wider text-white/60 hover:text-white"
                >
                  Закрыть
                </button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto">{filterContent}</div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="mt-4 border border-white bg-white py-3 text-xs uppercase tracking-wider text-ved-navy"
              >
                Показать результаты
              </button>
            </aside>
          </div>
        )}
      </div>

      <aside className="ved-glass hidden space-y-4 border border-white/10 p-5 lg:block">{filterContent}</aside>
    </>
  );
}
