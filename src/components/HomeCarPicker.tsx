"use client";

import { useMemo, useState } from "react";
import type { Car } from "@/types/car";
import {
  carTypeLabels,
  type CatalogFilterMeta,
} from "@/data/cars";
import { findAnalogCars } from "@/lib/catalog/analogs";
import { CarCardMini } from "@/components/CarCardMini";

const BUDGET_OPTIONS = [
  { value: "", label: "Бюджет, ₽" },
  { value: "2000000", label: "до 2 000 000" },
  { value: "4000000", label: "до 4 000 000" },
  { value: "6000000", label: "до 6 000 000" },
  { value: "10000000", label: "до 10 000 000" },
];

const CAR_TYPES = Object.keys(carTypeLabels) as (keyof typeof carTypeLabels)[];

export function HomeCarPicker({
  cars,
  meta,
}: {
  cars: Car[];
  meta: CatalogFilterMeta;
}) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [budget, setBudget] = useState("");
  const [type, setType] = useState("");

  const analogs = useMemo(() => {
    if (!budget || !type) return [];
    return findAnalogCars(cars, {
      budget: Number(budget),
      type,
      brand: brand || undefined,
      year: year ? Number(year) : undefined,
      model: model && model !== "any" ? model : undefined,
    });
  }, [cars, brand, model, year, budget, type]);

  const showPreview = Boolean(budget && type);

  return (
    <div className="flex flex-col gap-6">
      <form className="flex flex-col gap-3" action="/catalog" method="get">
        <select
          id="brand"
          name="brand"
          className="ved-select"
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setModel("");
          }}
        >
          <option value="" disabled>
            Выберите марку
          </option>
          {meta.brands.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>

        <select
          id="model"
          name="model"
          className="ved-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={!brand}
        >
          <option value="" disabled>
            {brand ? "Выберите модель" : "Сначала выберите марку"}
          </option>
          <option value="any">Любая модель</option>
        </select>

        <select
          id="year"
          name="year"
          className="ved-select"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="" disabled>
            Год выпуска
          </option>
          {meta.years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>

        <select
          id="type"
          name="type"
          className="ved-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="" disabled>
            Тип автомобиля
          </option>
          {CAR_TYPES.map((value) => (
            <option key={value} value={value}>
              {carTypeLabels[value]}
            </option>
          ))}
        </select>

        <select
          id="budget"
          name="budget"
          className="ved-select"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        >
          {BUDGET_OPTIONS.map((opt) => (
            <option key={opt.value || "placeholder"} value={opt.value} disabled={!opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="mt-4 border border-white bg-transparent px-6 py-3.5 text-xs uppercase tracking-[0.25em] text-white transition hover:bg-white hover:text-ved-navy"
        >
          Смотреть каталог
        </button>
      </form>

      {showPreview && (
        <section aria-live="polite">
          <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-white/60">
            {analogs.length > 0
              ? "Аналоги по вашим параметрам"
              : "Подходящие автомобили"}
          </h2>

          {analogs.length > 0 ? (
            <>
              <div className="grid max-h-[420px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 sm:max-h-none">
                {analogs.map((car) => (
                  <CarCardMini key={car.id} car={car} />
                ))}
              </div>
              <p className="mt-2 text-xs text-white/40">
                Показано {analogs.length} из каталога · нажмите «Смотреть каталог» для полного списка
              </p>
            </>
          ) : (
            <p className="text-sm text-white/50">
              По выбранным параметрам аналоги не найдены. Попробуйте увеличить бюджет или изменить тип.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
