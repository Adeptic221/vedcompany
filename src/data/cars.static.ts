import type { Car } from "@/types/car";

export const cars: Car[] = [
  { id: "toyota-camry-2024", brand: "Toyota", brandSlug: "toyota", model: "Camry", year: 2024, type: "sedan", price: 2850000, customsCost: 420000, deliveryDays: 45, country: "Japan", imageColor: "#1a3a5c", specs: { engine: "2.5 L", power: "181 hp", transmission: "Auto", drive: "FWD", fuel: "Petrol", consumption: "7.1 L/100km" }, description: "Reliable business sedan." },
  { id: "bmw-x5-2023", brand: "BMW", brandSlug: "bmw", model: "X5", year: 2023, type: "suv", price: 7200000, customsCost: 980000, deliveryDays: 55, country: "Germany", imageColor: "#2c3e50", specs: { engine: "3.0 L", power: "340 hp", transmission: "Auto", drive: "AWD", fuel: "Petrol", consumption: "9.4 L/100km" }, description: "Premium SUV with AWD." },
  { id: "mercedes-e-class-2024", brand: "Mercedes-Benz", brandSlug: "mercedes", model: "E-Class", year: 2024, type: "sedan", price: 6100000, customsCost: 850000, deliveryDays: 50, country: "Germany", imageColor: "#1c2833", specs: { engine: "2.0 L", power: "258 hp", transmission: "Auto", drive: "RWD", fuel: "Petrol", consumption: "8.2 L/100km" }, description: "Elegant business class sedan." },
  { id: "audi-q5-2023", brand: "Audi", brandSlug: "audi", model: "Q5", year: 2023, type: "crossover", price: 5400000, customsCost: 760000, deliveryDays: 48, country: "Germany", imageColor: "#2e4053", specs: { engine: "2.0 L", power: "249 hp", transmission: "DSG", drive: "AWD", fuel: "Petrol", consumption: "8.8 L/100km" }, description: "Stylish crossover with quattro." },
  { id: "lexus-rx-2024", brand: "Lexus", brandSlug: "lexus", model: "RX", year: 2024, type: "crossover", price: 6800000, customsCost: 920000, deliveryDays: 52, country: "Japan", imageColor: "#1b2631", specs: { engine: "2.4 L", power: "279 hp", transmission: "Auto", drive: "AWD", fuel: "Petrol", consumption: "9.0 L/100km" }, description: "Comfortable premium crossover." },
  { id: "porsche-macan-2023", brand: "Porsche", brandSlug: "porsche", model: "Macan", year: 2023, type: "crossover", price: 8900000, customsCost: 1150000, deliveryDays: 60, country: "Germany", imageColor: "#17202a", specs: { engine: "2.0 L", power: "265 hp", transmission: "PDK", drive: "AWD", fuel: "Petrol", consumption: "9.6 L/100km" }, description: "Sporty Porsche crossover." },
  { id: "toyota-rav4-2024", brand: "Toyota", brandSlug: "toyota", model: "RAV4", year: 2024, type: "crossover", price: 3200000, customsCost: 480000, deliveryDays: 42, country: "Japan", imageColor: "#1a5276", specs: { engine: "2.5 L", power: "199 hp", transmission: "Auto", drive: "AWD", fuel: "Petrol", consumption: "7.8 L/100km" }, description: "Popular family crossover." },
  { id: "bmw-3-series-2022", brand: "BMW", brandSlug: "bmw", model: "3 Series", year: 2022, type: "sedan", price: 3900000, customsCost: 560000, deliveryDays: 40, country: "Germany", imageColor: "#212f3d", specs: { engine: "2.0 L", power: "184 hp", transmission: "Auto", drive: "RWD", fuel: "Petrol", consumption: "7.5 L/100km" }, description: "Classic sporty sedan." },
];

export const carTypeLabels: Record<string, string> = {
  sedan: "\u0421\u0435\u0434\u0430\u043d",
  crossover: "\u041a\u0440\u043e\u0441\u0441\u043e\u0432\u0435\u0440",
  suv: "\u0412\u043d\u0435\u0434\u043e\u0440\u043e\u0436\u043d\u0438\u043a",
  hatchback: "\u0425\u044d\u0442\u0447\u0431\u0435\u043a",
  coupe: "\u041a\u0443\u043f\u0435",
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU").format(price) + " \u20bd";
}

export function getTotalPrice(car: Car): number {
  return car.price + car.customsCost;
}

export type CatalogSort = "price-asc" | "price-desc" | "year-desc" | "year-asc" | "newest";

export interface CatalogSearchParams {
  brand?: string;
  model?: string;
  year?: string;
  budget?: string;
  priceMin?: string;
  priceMax?: string;
  type?: string;
  fuel?: string;
  q?: string;
  sort?: string;
}

export const fuelLabels: Record<string, string> = {
  Petrol: "Бензин",
  Diesel: "Дизель",
  Hybrid: "Гибрид",
  Electric: "Электро",
};

export const sortLabels: Record<CatalogSort, string> = {
  newest: "Сначала новые",
  "price-asc": "Цена: по возрастанию",
  "price-desc": "Цена: по убыванию",
  "year-desc": "Год: новее",
  "year-asc": "Год: старше",
};

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function matchesSearch(car: Car, query: string): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  const title = normalizeSearch(`${car.brand} ${car.model}`);
  return (
    title.includes(q) ||
    normalizeSearch(car.brand).includes(q) ||
    normalizeSearch(car.model).includes(q) ||
    car.id.toLowerCase().includes(q.replace(/\s+/g, "-"))
  );
}

export function filterCars(items: Car[], filters: CatalogSearchParams): Car[] {
  const priceMax = filters.priceMax || filters.budget;
  const priceMin = filters.priceMin;

  return items.filter((car) => {
    if (filters.brand && car.brandSlug !== filters.brand) return false;
    if (filters.model && filters.model !== "any" && car.model.toLowerCase() !== filters.model.toLowerCase()) return false;
    if (filters.year && car.year !== Number(filters.year)) return false;
    if (filters.type && car.type !== filters.type) return false;
    if (filters.fuel && car.specs.fuel !== filters.fuel) return false;
    if (filters.q && !matchesSearch(car, filters.q)) return false;

    const total = getTotalPrice(car);
    if (priceMax && total > Number(priceMax)) return false;
    if (priceMin && total < Number(priceMin)) return false;

    return true;
  });
}

export function sortCars(items: Car[], sort?: string): Car[] {
  const mode = (sort as CatalogSort) || "newest";
  const sorted = [...items];

  sorted.sort((a, b) => {
    const priceA = getTotalPrice(a);
    const priceB = getTotalPrice(b);

    switch (mode) {
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "year-asc":
        return a.year - b.year || priceA - priceB;
      case "year-desc":
        return b.year - a.year || priceB - priceA;
      case "newest":
      default: {
        const syncedA = a.sync?.syncedAt ? Date.parse(a.sync.syncedAt) : 0;
        const syncedB = b.sync?.syncedAt ? Date.parse(b.sync.syncedAt) : 0;
        if (syncedA !== syncedB) return syncedB - syncedA;
        return b.year - a.year || priceB - priceA;
      }
    }
  });

  return sorted;
}

export interface CatalogFilterMeta {
  brands: { value: string; label: string }[];
  years: number[];
  fuels: string[];
  types: string[];
  priceMin: number;
  priceMax: number;
}

export function getCatalogFilterMeta(items: Car[]): CatalogFilterMeta {
  const brandMap = new Map<string, string>();
  const fuels = new Set<string>();
  const types = new Set<string>();
  const years = new Set<number>();
  let priceMin = Infinity;
  let priceMax = 0;

  for (const car of items) {
    brandMap.set(car.brandSlug, car.brand);
    fuels.add(car.specs.fuel);
    types.add(car.type);
    years.add(car.year);
    const total = getTotalPrice(car);
    priceMin = Math.min(priceMin, total);
    priceMax = Math.max(priceMax, total);
  }

  const brands = Array.from(brandMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1], "ru"))
    .map(([value, label]) => ({ value, label }));

  return {
    brands,
    years: Array.from(years).sort((a, b) => b - a),
    fuels: Array.from(fuels).sort((a, b) => a.localeCompare(b, "ru")),
    types: Array.from(types),
    priceMin: priceMin === Infinity ? 0 : priceMin,
    priceMax,
  };
}

export function countActiveFilters(filters: CatalogSearchParams): number {
  let count = 0;
  if (filters.q?.trim()) count++;
  if (filters.brand) count++;
  if (filters.type) count++;
  if (filters.year) count++;
  if (filters.fuel) count++;
  if (filters.priceMin || filters.priceMax || filters.budget) count++;
  if (filters.model && filters.model !== "any") count++;
  return count;
}