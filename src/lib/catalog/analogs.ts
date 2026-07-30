import type { Car, CarType } from "@/types/car";
import { getTotalPrice } from "@/data/cars";

export interface AnalogSearchParams {
  type?: string;
  budget?: number;
  /** Selected brand — excluded from results (cross-brand analogs). */
  brand?: string;
  year?: number;
  model?: string;
}

const MIN_ANALOGS = 3;
const MAX_ANALOGS = 6;

function sortByBudgetFit(items: Car[], budget: number): Car[] {
  return [...items].sort((a, b) => {
    const diffA = Math.abs(getTotalPrice(a) - budget);
    const diffB = Math.abs(getTotalPrice(b) - budget);
    return diffA - diffB;
  });
}

/** Prefer one car per brand so analogs span different manufacturers. */
function collectDiverse(source: Car[], limit: number, budget: number): Car[] {
  const target: Car[] = [];
  const seen = new Set<string>();
  const usedBrands = new Set<string>();
  const candidates = sortByBudgetFit(source, budget);

  for (const car of candidates) {
    if (target.length >= limit) break;
    if (usedBrands.has(car.brandSlug)) continue;
    seen.add(car.id);
    usedBrands.add(car.brandSlug);
    target.push(car);
  }

  for (const car of candidates) {
    if (target.length >= limit) break;
    if (seen.has(car.id)) continue;
    seen.add(car.id);
    target.push(car);
  }

  return target;
}

export function findAnalogCars(cars: Car[], params: AnalogSearchParams): Car[] {
  const budget = params.budget;
  const type = params.type as CarType | undefined;

  if (!budget || !type) return [];

  const pool = cars.filter((car) => {
    if (params.brand && car.brandSlug === params.brand) return false;
    if (car.type !== type) return false;
    return getTotalPrice(car) <= budget;
  });

  const result = collectDiverse(pool, MAX_ANALOGS, budget);
  return result.length >= MIN_ANALOGS ? result : [];
}
