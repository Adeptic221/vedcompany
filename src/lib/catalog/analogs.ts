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
const BUDGET_RELAX_FACTOR = 1.15;

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

function filterPool(
  pool: Car[],
  types: CarType[],
  maxBudget: number
): Car[] {
  const filtered = pool.filter(
    (car) =>
      types.includes(car.type) && getTotalPrice(car) <= maxBudget
  );
  return sortByBudgetFit(filtered, maxBudget);
}

/** Prefer one car per brand so analogs span different manufacturers. */
function collectDiverse(
  target: Car[],
  seen: Set<string>,
  source: Car[],
  limit: number,
  budget: number
): void {
  const candidates = sortByBudgetFit(
    source.filter((car) => !seen.has(car.id)),
    budget
  );
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
    if (params.brand && car.brandSlug === params.brand) return false;
    return true;
  });
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

  collectDiverse(result, seen, filterPool(pool, [type], budget), MAX_ANALOGS, budget);
  if (result.length < MIN_ANALOGS) {
    collectDiverse(
      result,
      seen,
      filterPool(pool, [type], relaxedBudget),
      MAX_ANALOGS,
      budget
    );
  }
  if (result.length < MIN_ANALOGS) {
    collectDiverse(
      result,
      seen,
      filterPool(pool, similarTypes, budget),
      MAX_ANALOGS,
      budget
    );
  }
  if (result.length < MIN_ANALOGS) {
    collectDiverse(
      result,
      seen,
      filterPool(pool, similarTypes, relaxedBudget),
      MAX_ANALOGS,
      budget
    );
  }

  return result.slice(0, MAX_ANALOGS);
}
