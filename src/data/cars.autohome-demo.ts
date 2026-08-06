import type { Car, CarType } from "@/types/car";
import { photoForDemoCar } from "./demo-car-photos";

const RATE = 12.5;
const SYNCED_AT = "2026-01-15T00:00:00.000Z";

type RawListing = [string, string, string, number, CarType, number, string, string, string, string, number];

const LISTINGS: RawListing[] = [
  ["toyota", "Toyota", "Camry", 2024, "sedan", 198000, "2.5 L", "181 hp", "Petrol", "7.1 L/100km", 45],
  ["toyota", "Toyota", "RAV4", 2024, "crossover", 218000, "2.5 L", "199 hp", "Petrol", "7.8 L/100km", 44],
  ["toyota", "Toyota", "Highlander", 2024, "suv", 298000, "2.5 L", "244 hp", "Hybrid", "6.5 L/100km", 48],
  ["toyota", "Toyota", "Corolla", 2024, "sedan", 148000, "1.8 L", "140 hp", "Hybrid", "4.5 L/100km", 40],
  ["lexus", "Lexus", "RX", 2024, "crossover", 544000, "2.4 L", "279 hp", "Petrol", "9.0 L/100km", 52],
  ["lexus", "Lexus", "ES", 2024, "sedan", 398000, "2.5 L", "218 hp", "Hybrid", "5.5 L/100km", 48],
  ["lexus", "Lexus", "NX", 2024, "crossover", 428000, "2.5 L", "243 hp", "Hybrid", "5.8 L/100km", 49],
  ["honda", "Honda", "CR-V", 2024, "crossover", 248000, "1.5 L", "193 hp", "Petrol", "7.6 L/100km", 44],
  ["honda", "Honda", "Accord", 2024, "sedan", 228000, "1.5 L", "192 hp", "Petrol", "7.0 L/100km", 43],
  ["nissan", "Nissan", "X-Trail", 2024, "crossover", 238000, "1.5 L", "163 hp", "Petrol", "7.4 L/100km", 43],
  ["mazda", "Mazda", "CX-5", 2024, "crossover", 218000, "2.5 L", "194 hp", "Petrol", "7.9 L/100km", 42],
  ["subaru", "Subaru", "Forester", 2024, "crossover", 248000, "2.5 L", "182 hp", "Petrol", "8.2 L/100km", 44],
  ["hyundai", "Hyundai", "Tucson", 2024, "crossover", 248000, "1.6 L", "180 hp", "Petrol", "7.5 L/100km", 44],
  ["hyundai", "Hyundai", "Santa Fe", 2024, "suv", 298000, "2.5 L", "281 hp", "Petrol", "9.0 L/100km", 46],
  ["kia", "Kia", "Sportage", 2024, "crossover", 238000, "1.6 L", "180 hp", "Petrol", "7.4 L/100km", 43],
  ["kia", "Kia", "Sorento", 2024, "suv", 278000, "2.5 L", "191 hp", "Petrol", "8.6 L/100km", 45],
  ["genesis", "Genesis", "GV70", 2024, "crossover", 428000, "2.5 L", "304 hp", "Petrol", "9.1 L/100km", 49],
  ["genesis", "Genesis", "G80", 2024, "sedan", 448000, "2.5 L", "304 hp", "Petrol", "8.8 L/100km", 50],
  ["bmw", "BMW", "X5", 2023, "suv", 578000, "3.0 L", "340 hp", "Petrol", "9.4 L/100km", 55],
  ["bmw", "BMW", "3 Series", 2024, "sedan", 368000, "2.0 L", "184 hp", "Petrol", "7.2 L/100km", 48],
  ["bmw", "BMW", "X3", 2024, "crossover", 448000, "2.0 L", "184 hp", "Petrol", "8.0 L/100km", 50],
  ["mercedes", "Mercedes-Benz", "E-Class", 2024, "sedan", 489000, "2.0 L", "258 hp", "Petrol", "8.2 L/100km", 50],
  ["mercedes", "Mercedes-Benz", "GLE", 2024, "suv", 628000, "2.0 L", "258 hp", "Petrol", "9.2 L/100km", 52],
  ["mercedes", "Mercedes-Benz", "C-Class", 2024, "sedan", 398000, "1.5 L", "204 hp", "Petrol", "7.0 L/100km", 48],
  ["audi", "Audi", "Q5", 2023, "crossover", 432000, "2.0 L", "249 hp", "Petrol", "8.8 L/100km", 48],
  ["audi", "Audi", "A6", 2024, "sedan", 448000, "2.0 L", "245 hp", "Petrol", "7.8 L/100km", 49],
  ["audi", "Audi", "Q7", 2024, "suv", 598000, "3.0 L", "340 hp", "Petrol", "9.8 L/100km", 52],
  ["porsche", "Porsche", "Macan", 2023, "crossover", 712000, "2.0 L", "265 hp", "Petrol", "9.6 L/100km", 60],
  ["porsche", "Porsche", "Cayenne", 2024, "suv", 898000, "3.0 L", "353 hp", "Petrol", "11.0 L/100km", 58],
  ["volkswagen", "Volkswagen", "Tiguan", 2024, "crossover", 298000, "2.0 L", "220 hp", "Petrol", "8.0 L/100km", 46],
  ["volkswagen", "Volkswagen", "Passat", 2024, "sedan", 248000, "2.0 L", "190 hp", "Petrol", "7.2 L/100km", 44],
  ["volvo", "Volvo", "XC60", 2024, "crossover", 468000, "2.0 L", "250 hp", "Petrol", "8.5 L/100km", 50],
  ["volvo", "Volvo", "XC90", 2024, "suv", 598000, "2.0 L", "250 hp", "Petrol", "9.2 L/100km", 52],
  ["land-rover", "Land Rover", "Defender", 2023, "suv", 698000, "3.0 L", "400 hp", "Petrol", "11.2 L/100km", 58],
  ["land-rover", "Land Rover", "Range Rover Sport", 2024, "suv", 798000, "3.0 L", "400 hp", "Petrol", "10.8 L/100km", 58],
  ["tesla", "Tesla", "Model Y", 2024, "crossover", 399000, "Dual Motor", "450 hp", "Electric", "15.0 kWh/100km", 48],
  ["tesla", "Tesla", "Model 3", 2024, "sedan", 329000, "Dual Motor", "450 hp", "Electric", "14.0 kWh/100km", 46],
  ["skoda", "Skoda", "Kodiaq", 2024, "suv", 278000, "2.0 L", "190 hp", "Petrol", "8.1 L/100km", 45],
  ["peugeot", "Peugeot", "3008", 2024, "crossover", 248000, "1.6 L", "180 hp", "Petrol", "7.3 L/100km", 44],
];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function countryFor(slug: string): string {
  if (["toyota", "lexus", "honda", "nissan", "mazda", "subaru"].includes(slug)) return "Japan";
  if (["hyundai", "kia", "genesis"].includes(slug)) return "Korea";
  if (slug === "volvo") return "Sweden";
  if (slug === "skoda") return "Czech Republic";
  if (slug === "land-rover") return "UK";
  if (slug === "tesla") return "USA";
  if (slug === "peugeot") return "France";
  if (["bmw", "mercedes", "audi", "porsche", "volkswagen"].includes(slug)) return "Germany";
  return "China";
}

function driveFor(type: CarType, fuel: string, brandSlug: string): string {
  if (fuel === "Electric" && ["tesla", "porsche", "bmw", "nio", "xpeng", "zeekr", "avatr", "xiaomi"].includes(brandSlug)) {
    return type === "sedan" ? "RWD" : "AWD";
  }
  if (type === "suv" || type === "crossover") return "AWD";
  return "FWD";
}

function transmissionFor(fuel: string): string {
  return fuel === "Electric" ? "Single-speed" : "Auto";
}

function estimateCustoms(priceRub: number, engine: string, year: number, fuel: string): number {
  const ageYears = Math.max(0, new Date().getFullYear() - year);
  let cc = 2000;
  if (fuel === "Electric") cc = 0;
  else {
    const match = engine.match(/([\d.]+)\s*[lL]/);
    if (match) cc = Math.round(parseFloat(match[1]) * 1000);
  }
  const ageFactor = ageYears <= 3 ? 1.2 : ageYears <= 5 ? 1.0 : 0.85;
  const dutyBase = fuel === "Electric" ? priceRub * 0.15 : priceRub * 0.15 * (cc / 2000 || 1);
  const duty = Math.round(dutyBase * ageFactor);
  const vat = Math.round((priceRub + duty) * 0.2);
  return duty + vat + (ageYears <= 3 ? 5200 : 2600);
}

function buildOne(entry: RawListing): Car {
  const [brandSlug, brand, model, year, type, priceCny, engine, power, fuel, consumption, deliveryDays] = entry;
  const id = `ah-${slugify(brand)}-${slugify(model)}-${year}`;
  const price = Math.round(priceCny * RATE);
  const photo = photoForDemoCar(type, brandSlug, model);
  return {
    id, brand, brandSlug, model, year, type, price,
    customsCost: estimateCustoms(price, engine, year, fuel),
    deliveryDays, country: countryFor(brandSlug), imageColor: "#1a3a5c",
    specs: {
      engine, power,
      transmission: transmissionFor(fuel),
      drive: driveFor(type, fuel, brandSlug),
      fuel, consumption,
    },
    description: `${brand} ${model} ${year} — импорт под ключ с расчётом таможни и доставкой.`,
    sync: {
      source: "autohome", sourceId: id, sourceUrl: "https://www.autohome.com.cn/",
      photos: [photo], priceCny, exchangeRate: RATE, exchangeBank: "VTB",
      exchangeRateAt: SYNCED_AT, customsSource: "tks.ru", syncedAt: SYNCED_AT,
    },
  };
}

function altListing(entry: RawListing): RawListing {
  const year = entry[3];
  const altYear = year >= 2024 ? 2023 : 2024;
  const priceFactor = altYear < year ? 0.88 : 1.06;
  return [
    entry[0], entry[1], entry[2], altYear, entry[4],
    Math.round(entry[5] * priceFactor), entry[6], entry[7], entry[8], entry[9],
    entry[10] + (altYear === 2023 ? 2 : 0),
  ];
}

function buildDemoCars(): Car[] {
  const cars: Car[] = [];
  LISTINGS.filter((entry) => countryFor(entry[0]) !== "China").forEach((entry) => {
    cars.push(buildOne(entry));
    cars.push(buildOne(altListing(entry)));
  });
  return cars;
}

export const autohomeDemoCars: Car[] = buildDemoCars();
