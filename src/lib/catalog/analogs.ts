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

const MIN_ANALOGS = 3;
const MAX_ANALOGS = 5;
const BUDGET_RELAX_FACTOR = 1.25;

const SIMILAR_TYPES: Record<CarType, CarType[]> = {
  crossover: ["crossover", "suv"],
  suv: ["suv", "crossover"],
  sedan: ["sedan", "coupe"],
  coupe: ["coupe", "sedan"],
  hatchback: ["hatchback", "crossover"],
};

/** One analog slot per brand+model (years must not repeat). */
export function modelKey(car: Pick<Car, "brandSlug" | "model">): string {
  return `${car.brandSlug}::${car.model.trim().toLowerCase()}`;
}

function sortByBudgetFit(items: Car[], budget: number): Car[] {
  return [...items].sort((a, b) => {
    const diffA = Math.abs(getTotalPrice(a) - budget);
    const diffB = Math.abs(getTotalPrice(b) - budget);
    return diffA - diffB;
  });
}

/** Keep best budget fit per brand+model. */
function uniqueByModel(cars: Car[], budget: number): Car[] {
  const best = new Map<string, Car>();
  for (const car of sortByBudgetFit(cars, budget)) {
    const key = modelKey(car);
    if (!best.has(key)) best.set(key, car);
  }
  return [...best.values()];
}

function filterPool(pool: Car[], types: CarType[], maxBudget: number): Car[] {
  return uniqueByModel(
    pool.filter((car) => types.includes(car.type) && getTotalPrice(car) <= maxBudget),
    maxBudget
  );
}

/**
 * Fill analogs: prefer different brands, then same brand with different models.
 * Never repeat the same brand+model.
 */
function collectDiverse(
  target: Car[],
  seenModels: Set<string>,
  source: Car[],
  limit: number,
  budget: number
): void {
  const candidates = uniqueByModel(
    source.filter((car) => !seenModels.has(modelKey(car))),
    budget
  );
  const usedBrands = new Set(target.map((car) => car.brandSlug));

  for (const car of candidates) {
    if (target.length >= limit) return;
    if (usedBrands.has(car.brandSlug)) continue;
    seenModels.add(modelKey(car));
    usedBrands.add(car.brandSlug);
    target.push(car);
  }

  for (const car of candidates) {
    if (target.length >= limit) return;
    const key = modelKey(car);
    if (seenModels.has(key)) continue;
    seenModels.add(key);
    target.push(car);
  }
}

function buildBasePool(cars: Car[], params: AnalogSearchParams): Car[] {
  const currentModel =
    params.brand && params.model
      ? modelKey({ brandSlug: params.brand, model: params.model })
      : null;

  return cars.filter((car) => {
    if (params.excludeId && car.id === params.excludeId) return false;
    if (currentModel && modelKey(car) === currentModel) return false;
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
  const seenModels = new Set<string>();
  const fill = (source: Car[]) => {
    if (result.length < MAX_ANALOGS) {
      collectDiverse(result, seenModels, source, MAX_ANALOGS, budget);
    }
  };

  fill(filterPool(pool, [type], budget));
  fill(filterPool(pool, [type], relaxedBudget));
  fill(filterPool(pool, similarTypes, budget));
  fill(filterPool(pool, similarTypes, relaxedBudget));
  if (result.length < MIN_ANALOGS) {
    fill(
      uniqueByModel(
        pool.filter((car) => similarTypes.includes(car.type)),
        budget
      )
    );
  }

  // Prefer 3–5 distinct models; never pad with year duplicates.
  return result.slice(0, MAX_ANALOGS);
}
