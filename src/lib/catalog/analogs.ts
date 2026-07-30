import type { Car, CarType } from "@/types/car";
import { getTotalPrice } from "@/data/cars";

export interface AnalogSearchParams {
  type?: string;
  budget?: number;
  brand?: string;
  year?: number;
  model?: string;
}

const MIN_ANALOGS = 4;
const MAX_ANALOGS = 10;
const BUDGET_RELAX_FACTOR = 1.35;

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
    sorted.sort((a, b) => {
      const diffA = Math.abs(getTotalPrice(a) - budget);
      const diffB = Math.abs(getTotalPrice(b) - budget);
      return diffA - diffB;
    });
  } else {
    sorted.sort((a, b) => getTotalPrice(a) - getTotalPrice(b));
  }
  return sorted;
}

function filterPool(pool: Car[], types: CarType[], maxBudget?: number): Car[] {
  let filtered =
    types.length > 0
      ? pool.filter((car) => types.includes(car.type))
      : [...pool];
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

function buildPool(cars: Car[], params: AnalogSearchParams): Car[] {
  let pool = [...cars];

  if (params.brand) {
    pool = pool.filter((car) => car.brandSlug === params.brand);
  }
  if (params.model && params.model !== "any") {
    const modelLower = params.model.toLowerCase();
    const byModel = pool.filter((car) =>
      car.model.toLowerCase().includes(modelLower)
    );
    if (byModel.length >= MIN_ANALOGS) pool = byModel;
  }
  if (params.year) {
    const byYear = pool.filter((car) => car.year === params.year);
    if (byYear.length >= MIN_ANALOGS) pool = byYear;
  }

  return pool.length > 0 ? pool : [...cars];
}

export function findAnalogCars(cars: Car[], params: AnalogSearchParams): Car[] {
  const budget = params.budget;
  const type = params.type as CarType | undefined;

  if (!budget && !type && !params.brand) return [];

  const pool = buildPool(cars, params);

  if (!type && !budget) {
    return sortByBudgetFit(pool).slice(0, MAX_ANALOGS);
  }

  const result: Car[] = [];
  const seen = new Set<string>();
  const types: CarType[] = type ? [type] : [];
  const similarTypes = type
    ? [...new Set(SIMILAR_TYPES[type] ?? [type])]
    : (["crossover", "suv", "sedan"] as CarType[]);

  if (type && budget) {
    collectUnique(result, seen, filterPool(pool, [type], budget));
    if (result.length < MIN_ANALOGS) {
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
  } else if (type) {
    collectUnique(result, seen, filterPool(pool, [type]));
    if (result.length < MIN_ANALOGS) {
      collectUnique(result, seen, filterPool(pool, similarTypes));
    }
  } else if (budget) {
    collectUnique(result, seen, filterPool(pool, [], budget));
    if (result.length < MIN_ANALOGS) {
      collectUnique(
        result,
        seen,
        filterPool(pool, [], Math.round(budget * BUDGET_RELAX_FACTOR))
      );
    }
    if (result.length < MIN_ANALOGS) {
      collectUnique(result, seen, sortByBudgetFit(pool));
    }
  }

  if (result.length === 0) {
    return sortByBudgetFit(pool).slice(0, MAX_ANALOGS);
  }

  return result.slice(0, MAX_ANALOGS);
}
