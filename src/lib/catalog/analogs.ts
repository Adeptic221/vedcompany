import type { Car, CarType } from "@/types/car";
import { getTotalPrice } from "@/data/cars";

export interface AnalogSearchParams {
  type?: string;
  budget?: number;
  brand?: string;
  year?: number;
  model?: string;
  excludeId?: string;
}

const MIN_ANALOGS = 4;
const MAX_ANALOGS = 5;
const BUDGET_RELAX_FACTOR = 1.25;

const SIMILAR_TYPES: Record<CarType, CarType[]> = {
  crossover: ["crossover", "suv"],
  suv: ["suv", "crossover"],
  sedan: ["sedan", "coupe"],
  coupe: ["coupe", "sedan"],
  hatchback: ["hatchback", "crossover"],
};

function sortByBudgetFit(items: Car[], budget: number): Car[] {
  return [...items].sort((a, b) => {
    const diffA = Math.abs(getTotalPrice(a) - budget);
    const diffB = Math.abs(getTotalPrice(b) - budget);
    return diffA - diffB;
  });
}

function filterPool(pool: Car[], types: CarType[], maxBudget: number): Car[] {
  return sortByBudgetFit(
    pool.filter((car) => types.includes(car.type) && getTotalPrice(car) <= maxBudget),
    maxBudget
  );
}

function collectDiverse(target: Car[], seen: Set<string>, source: Car[], limit: number, budget: number): void {
  const candidates = sortByBudgetFit(source.filter((car) => !seen.has(car.id)), budget);
  const usedBrands = new Set(target.map((car) => car.brandSlug));
  for (const car of candidates) {
    if (target.length >= limit) return;
    if (usedBrands.has(car.brandSlug)) continue;
    seen.add(car.id);
    usedBrands.add(car.brandSlug);
    target.push(car);
  }
  for (const car of candidates) {
    if (target.length >= limit) return;
    if (seen.has(car.id)) continue;
    seen.add(car.id);
    target.push(car);
  }
}

function buildBasePool(cars: Car[], params: AnalogSearchParams): Car[] {
  return cars.filter((car) => {
    if (params.excludeId && car.id === params.excludeId) return false;
    if (params.brand && car.brandSlug === params.brand) return false;
    return true;
  });
}

export function findSelectedCar(
  cars: Car[],
  params: { brand?: string; model?: string; year?: string; type?: string }
): Car | null {
  const { brand, model, year, type } = params;
  if (!brand) return null;
  let pool = cars.filter((car) => car.brandSlug === brand);
  if (type) pool = pool.filter((car) => car.type === type);
  if (model && model !== "any") pool = pool.filter((car) => car.model === model);
  if (year) pool = pool.filter((car) => Number(car.year) === Number(year));
  if (pool.length === 0) {
    pool = cars.filter((car) => car.brandSlug === brand && (!type || car.type === type));
    if (model && model !== "any") {
      const byModel = pool.filter((car) => car.model === model);
      if (byModel.length > 0) pool = byModel;
    }
  }
  if (pool.length === 0) return null;
  return [...pool].sort((a, b) => b.year - a.year)[0];
}

export function findAnalogCars(cars: Car[], params: AnalogSearchParams): Car[] {
  const budget = params.budget;
  const type = params.type as CarType | undefined;
  if (!budget || !type) return [];
  const pool = buildBasePool(cars, params);
  const similarTypes = [...new Set(SIMILAR_TYPES[type] ?? [type])];
  const relaxedBudget = Math.round(budget * BUDGET_RELAX_FACTOR);
  const result: Car[] = [];
  const seen = new Set<string>();
  const fill = (source: Car[]) => {
    if (result.length < MAX_ANALOGS) {
      collectDiverse(result, seen, source, MAX_ANALOGS, budget);
    }
  };

  fill(filterPool(pool, [type], budget));
  fill(filterPool(pool, [type], relaxedBudget));
  fill(filterPool(pool, similarTypes, budget));
  fill(filterPool(pool, similarTypes, relaxedBudget));
  // Last resort: same/similar body type, closest by price (no hard budget cap).
  if (result.length < MIN_ANALOGS) {
    fill(
      sortByBudgetFit(
        pool.filter((car) => similarTypes.includes(car.type)),
        budget
      )
    );
  }

  return result.slice(0, MAX_ANALOGS);
}