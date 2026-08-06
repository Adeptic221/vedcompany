import type { Car, CarType } from "@/types/car";
import {
  carAgeYears,
  estimateCustoms,
  parseEngineVolumeCc,
  parsePowerHp,
} from "@/lib/customs/calculate";
import { photoForDemoCar } from "./demo-car-photos";

const RATE = 12.5;
const SYNCED_AT = "2026-01-15T00:00:00.000Z";

/** Years to materialize for each model template. */
const YEARS = [2021, 2022, 2023, 2024, 2025, 2026] as const;

/** CNY price multiplier vs the template’s reference year price. */
const YEAR_PRICE_FACTOR: Record<number, number> = {
  2021: 0.7,
  2022: 0.78,
  2023: 0.88,
  2024: 1.0,
  2025: 1.08,
  2026: 1.16,
};

type RawListing = [
  string,
  string,
  string,
  number,
  CarType,
  number,
  string,
  string,
  string,
  string,
  number
];

/**
 * Template year is the reference for priceCny (usually 2024).
 * Budget / mass-market first; zero China brands.
 */
const LISTINGS: RawListing[] = [
  // Budget / mass-market
  ["volkswagen", "Volkswagen", "Polo", 2024, "hatchback", 92000, "1.6 L", "110 hp", "Petrol", "6.5 L/100km", 38],
  ["volkswagen", "Volkswagen", "Golf", 2024, "hatchback", 138000, "1.5 L", "150 hp", "Petrol", "6.2 L/100km", 40],
  ["skoda", "Skoda", "Rapid", 2024, "sedan", 88000, "1.6 L", "110 hp", "Petrol", "6.3 L/100km", 37],
  ["skoda", "Skoda", "Octavia", 2024, "sedan", 124000, "1.4 L", "150 hp", "Petrol", "6.4 L/100km", 40],
  ["skoda", "Skoda", "Karoq", 2024, "crossover", 158000, "1.4 L", "150 hp", "Petrol", "6.9 L/100km", 42],
  ["skoda", "Skoda", "Kodiaq", 2024, "suv", 278000, "2.0 L", "190 hp", "Petrol", "8.1 L/100km", 45],
  ["hyundai", "Hyundai", "Solaris", 2024, "sedan", 95000, "1.6 L", "123 hp", "Petrol", "6.6 L/100km", 38],
  ["hyundai", "Hyundai", "Creta", 2024, "crossover", 118000, "1.6 L", "123 hp", "Petrol", "7.1 L/100km", 40],
  ["hyundai", "Hyundai", "Elantra", 2024, "sedan", 142000, "2.0 L", "149 hp", "Petrol", "7.0 L/100km", 41],
  ["hyundai", "Hyundai", "Tucson", 2024, "crossover", 248000, "1.6 L", "180 hp", "Petrol", "7.5 L/100km", 44],
  ["hyundai", "Hyundai", "Santa Fe", 2024, "suv", 298000, "2.5 L", "281 hp", "Petrol", "9.0 L/100km", 46],
  ["kia", "Kia", "Rio", 2024, "sedan", 90000, "1.6 L", "123 hp", "Petrol", "6.4 L/100km", 37],
  ["kia", "Kia", "Cerato", 2024, "hatchback", 132000, "2.0 L", "150 hp", "Petrol", "7.2 L/100km", 40],
  ["kia", "Kia", "Sportage", 2024, "crossover", 238000, "1.6 L", "180 hp", "Petrol", "7.4 L/100km", 43],
  ["kia", "Kia", "Sorento", 2024, "suv", 278000, "2.5 L", "191 hp", "Petrol", "8.6 L/100km", 45],
  ["ford", "Ford", "Focus", 2024, "hatchback", 105000, "1.5 L", "150 hp", "Petrol", "6.8 L/100km", 40],
  ["ford", "Ford", "Kuga", 2024, "crossover", 168000, "1.5 L", "150 hp", "Petrol", "7.5 L/100km", 42],
  ["renault", "Renault", "Duster", 2024, "crossover", 98000, "1.6 L", "114 hp", "Petrol", "7.6 L/100km", 39],
  ["renault", "Renault", "Arkana", 2024, "crossover", 148000, "1.3 L", "150 hp", "Petrol", "6.9 L/100km", 41],
  ["nissan", "Nissan", "Qashqai", 2024, "crossover", 178000, "1.3 L", "158 hp", "Petrol", "6.8 L/100km", 42],
  ["mazda", "Mazda", "3", 2024, "sedan", 148000, "2.0 L", "150 hp", "Petrol", "6.5 L/100km", 41],
  ["toyota", "Toyota", "Corolla", 2024, "sedan", 135000, "1.8 L", "140 hp", "Hybrid", "4.5 L/100km", 40],
  // Mid / volume Japan-Korea-EU
  ["toyota", "Toyota", "Camry", 2024, "sedan", 198000, "2.5 L", "181 hp", "Petrol", "7.1 L/100km", 45],
  ["toyota", "Toyota", "RAV4", 2024, "crossover", 218000, "2.5 L", "199 hp", "Petrol", "7.8 L/100km", 44],
  ["toyota", "Toyota", "Highlander", 2024, "suv", 298000, "2.5 L", "244 hp", "Hybrid", "6.5 L/100km", 48],
  ["lexus", "Lexus", "RX", 2024, "crossover", 544000, "2.4 L", "279 hp", "Petrol", "9.0 L/100km", 52],
  ["lexus", "Lexus", "ES", 2024, "sedan", 398000, "2.5 L", "218 hp", "Hybrid", "5.5 L/100km", 48],
  ["lexus", "Lexus", "NX", 2024, "crossover", 428000, "2.5 L", "243 hp", "Hybrid", "5.8 L/100km", 49],
  ["honda", "Honda", "CR-V", 2024, "crossover", 248000, "1.5 L", "193 hp", "Petrol", "7.6 L/100km", 44],
  ["honda", "Honda", "Accord", 2024, "sedan", 228000, "1.5 L", "192 hp", "Petrol", "7.0 L/100km", 43],
  ["nissan", "Nissan", "X-Trail", 2024, "crossover", 238000, "1.5 L", "163 hp", "Petrol", "7.4 L/100km", 43],
  ["mazda", "Mazda", "CX-5", 2024, "crossover", 218000, "2.5 L", "194 hp", "Petrol", "7.9 L/100km", 42],
  ["subaru", "Subaru", "Forester", 2024, "crossover", 248000, "2.5 L", "182 hp", "Petrol", "8.2 L/100km", 44],
  ["genesis", "Genesis", "GV70", 2024, "crossover", 428000, "2.5 L", "304 hp", "Petrol", "9.1 L/100km", 49],
  ["genesis", "Genesis", "G80", 2024, "sedan", 448000, "2.5 L", "304 hp", "Petrol", "8.8 L/100km", 50],
  ["bmw", "BMW", "X5", 2024, "suv", 578000, "3.0 L", "340 hp", "Petrol", "9.4 L/100km", 55],
  ["bmw", "BMW", "3 Series", 2024, "sedan", 368000, "2.0 L", "184 hp", "Petrol", "7.2 L/100km", 48],
  ["bmw", "BMW", "X3", 2024, "crossover", 448000, "2.0 L", "184 hp", "Petrol", "8.0 L/100km", 50],
  ["mercedes", "Mercedes-Benz", "E-Class", 2024, "sedan", 489000, "2.0 L", "258 hp", "Petrol", "8.2 L/100km", 50],
  ["mercedes", "Mercedes-Benz", "GLE", 2024, "suv", 628000, "2.0 L", "258 hp", "Petrol", "9.2 L/100km", 52],
  ["mercedes", "Mercedes-Benz", "C-Class", 2024, "sedan", 398000, "1.5 L", "204 hp", "Petrol", "7.0 L/100km", 48],
  ["audi", "Audi", "Q5", 2024, "crossover", 432000, "2.0 L", "249 hp", "Petrol", "8.8 L/100km", 48],
  ["audi", "Audi", "A6", 2024, "sedan", 448000, "2.0 L", "245 hp", "Petrol", "7.8 L/100km", 49],
  ["audi", "Audi", "Q7", 2024, "suv", 598000, "3.0 L", "340 hp", "Petrol", "9.8 L/100km", 52],
  ["porsche", "Porsche", "Macan", 2024, "crossover", 712000, "2.0 L", "265 hp", "Petrol", "9.6 L/100km", 60],
  ["porsche", "Porsche", "Cayenne", 2024, "suv", 898000, "3.0 L", "353 hp", "Petrol", "11.0 L/100km", 58],
  ["volkswagen", "Volkswagen", "Tiguan", 2024, "crossover", 298000, "2.0 L", "220 hp", "Petrol", "8.0 L/100km", 46],
  ["volkswagen", "Volkswagen", "Passat", 2024, "sedan", 248000, "2.0 L", "190 hp", "Petrol", "7.2 L/100km", 44],
  ["volvo", "Volvo", "XC60", 2024, "crossover", 468000, "2.0 L", "250 hp", "Petrol", "8.5 L/100km", 50],
  ["volvo", "Volvo", "XC90", 2024, "suv", 598000, "2.0 L", "250 hp", "Petrol", "9.2 L/100km", 52],
  ["land-rover", "Land Rover", "Defender", 2024, "suv", 698000, "3.0 L", "400 hp", "Petrol", "11.2 L/100km", 58],
  ["land-rover", "Land Rover", "Range Rover Sport", 2024, "suv", 798000, "3.0 L", "400 hp", "Petrol", "10.8 L/100km", 58],
  ["tesla", "Tesla", "Model Y", 2024, "crossover", 399000, "Dual Motor", "450 hp", "Electric", "15.0 kWh/100km", 48],
  ["tesla", "Tesla", "Model 3", 2024, "sedan", 329000, "Dual Motor", "450 hp", "Electric", "14.0 kWh/100km", 46],
  ["peugeot", "Peugeot", "3008", 2024, "crossover", 248000, "1.6 L", "180 hp", "Petrol", "7.3 L/100km", 44],
];

/** Premium models: skip oldest years (less realistic as “new import stock”). */
const PREMIUM_SLUGS = new Set([
  "lexus",
  "bmw",
  "mercedes",
  "audi",
  "porsche",
  "volvo",
  "land-rover",
  "genesis",
  "tesla",
]);

function yearsFor(brandSlug: string): readonly number[] {
  if (PREMIUM_SLUGS.has(brandSlug)) return [2023, 2024, 2025, 2026];
  return YEARS;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function countryFor(slug: string): string {
  if (["toyota", "lexus", "honda", "nissan", "mazda", "subaru"].includes(slug)) return "Japan";
  if (["hyundai", "kia", "genesis"].includes(slug)) return "Korea";
  if (slug === "volvo") return "Sweden";
  if (slug === "skoda") return "Czech Republic";
  if (slug === "land-rover") return "UK";
  if (["tesla", "ford"].includes(slug)) return "USA";
  if (["peugeot", "renault"].includes(slug)) return "France";
  if (["bmw", "mercedes", "audi", "porsche", "volkswagen"].includes(slug)) return "Germany";
  return "China";
}

function driveFor(type: CarType, fuel: string, brandSlug: string): string {
  if (fuel === "Electric" && ["tesla", "porsche", "bmw"].includes(brandSlug)) {
    return type === "sedan" ? "RWD" : "AWD";
  }
  if (type === "suv" || type === "crossover") return "AWD";
  return "FWD";
}

function transmissionFor(fuel: string): string {
  return fuel === "Electric" ? "Single-speed" : "Auto";
}

function customsForCar(
  priceRub: number,
  engine: string,
  year: number,
  fuel: string,
  power: string
): number {
  const ageYears = carAgeYears(year);
  const engineVolumeCc =
    fuel === "Electric" ? 0 : parseEngineVolumeCc(engine);
  return estimateCustoms({
    priceRub,
    engineVolumeCc,
    ageYears,
    fuel,
    powerHp: parsePowerHp(power),
  }).totalRub;
}

function buildOne(entry: RawListing, year: number): Car {
  const [brandSlug, brand, model, refYear, type, priceCnyRef, engine, power, fuel, consumption, deliveryDays] =
    entry;
  const factor =
    (YEAR_PRICE_FACTOR[year] ?? 1) / (YEAR_PRICE_FACTOR[refYear] ?? 1);
  const priceCny = Math.round(priceCnyRef * factor);
  const id = `ah-${slugify(brand)}-${slugify(model)}-${year}`;
  const price = Math.round(priceCny * RATE);
  const photo = photoForDemoCar(type, brandSlug, model);
  const days =
    deliveryDays + (year <= 2022 ? 4 : year === 2023 ? 2 : year >= 2026 ? -1 : 0);

  return {
    id,
    brand,
    brandSlug,
    model,
    year,
    type,
    price,
    customsCost: customsForCar(price, engine, year, fuel, power),
    deliveryDays: Math.max(30, days),
    country: countryFor(brandSlug),
    imageColor: "#1a3a5c",
    specs: {
      engine,
      power,
      transmission: transmissionFor(fuel),
      drive: driveFor(type, fuel, brandSlug),
      fuel,
      consumption,
    },
    description: `${brand} ${model} ${year} — импорт под ключ с расчётом таможни и доставкой.`,
    sync: {
      source: "autohome",
      sourceId: id,
      sourceUrl: "https://www.autohome.com.cn/",
      photos: [photo],
      priceCny,
      exchangeRate: RATE,
      exchangeBank: "VTB",
      exchangeRateAt: SYNCED_AT,
      customsSource: "tks.ru",
      syncedAt: SYNCED_AT,
    },
  };
}

function buildDemoCars(): Car[] {
  const cars: Car[] = [];
  for (const entry of LISTINGS) {
    if (countryFor(entry[0]) === "China") continue;
    for (const year of yearsFor(entry[0])) {
      cars.push(buildOne(entry, year));
    }
  }
  return cars;
}

export const autohomeDemoCars: Car[] = buildDemoCars();
