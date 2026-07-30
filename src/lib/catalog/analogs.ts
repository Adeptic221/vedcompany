import type { Car, CarType } from "@/types/car";
import { getTotalPrice } from "@/data/cars";

export interface AnalogSearchParams {
  type?: string;
  budget?: number;
  brand?: string;
  year?: number;
  model?: string;
}

const MIN_ANALOGS = 8;
const MAX_ANALOGS = 10;
const BUDGET_RELAX_FACTOR = 1.15;

const SIMILAR_TYPES: Record<CarType, CarType[]> = {
  crossover: ["crossover", "suv"],
  suv: ["suv", "crossover"],
  sedan: ["sedan", "coupe"],
  coupe: ["coupe", "sedan"],
  hatchback: ["hatchback", "crossover"],
};

function sortByBudgetFit(items: Car[], budget?: number): Car[] {
  const sorted = [...items];
  if (budget) {
    sorted.sort((a, b) => getTotalPrice(b) - getTotalPrice(a));
  } else {
    sorted.sort((a, b) => getTotalPrice(a) - getTotalPrice(b));
  }
  return sorted;
}

function filterPool(pool: Car[], types: CarType[], maxBudget?: number): Car[] {
  let filtered = pool.filter((car) => types.includes(car.type));
  if (maxBudget !== undefined) {
    filtered = filtered.filter((car) => getTotalPrice(car) <= maxBudget);
  }
  return sortByBudgetFit(filtered, maxBudget);
}

function collectUnique(
  target: Car[],
  seen: Set<string>,
  source: Car[],
  limit = MAX_ANALOGS
): void {
  for (const car of source) {
    if (target.length >= limit) break;
    if (seen.has(car.id)) continue;
    seen.add(car.id);
    target.push(car);
  }
}

export function findAnalogCars(cars: Car[], params: AnalogSearchParams): Car[] {
  const budget = params.budget;
  const type = params.type as CarType | undefined;

  if (!budget || !type) return [];

  let pool = [...cars];
  if (params.brand) {
    pool = pool.filter((car) => car.brandSlug === params.brand);
  }
  if (params.year) {
    pool = pool.filter((car) => car.year === params.year);
  }
  if (params.model) {
    pool = pool.filter(
      (car) => car.model.toLowerCase() === params.model!.toLowerCase()
    );
  }

  const result: Car[] = [];
  const seen = new Set<string>();
  const similarTypes = [...new Set(SIMILAR_TYPES[type] ?? [type])];

  collectUnique(result, seen, filterPool(pool, [type], budget));
  if (result.length < MIN_ANALOGS && budget) {
    collectUnique(
      result,
      seen,
      filterPool(pool, [type], Math.round(budget * BUDGET_RELAX_FACTOR))
    );
  }
  if (result.length < MIN_ANALOGS) {
    collectUnique(result, seen, filterPool(pool, [type]));
  }
  if (result.length < MIN_ANALOGS) {
    collectUnique(
      result,
      seen,
      filterPool(
        pool,
        similarTypes,
        budget ? Math.round(budget * BUDGET_RELAX_FACTOR) : undefined
      )
    );
  }
  if (result.length < MIN_ANALOGS) {
    collectUnique(result, seen, filterPool(pool, similarTypes));
  }

  return result.slice(0, MAX_ANALOGS);
}
