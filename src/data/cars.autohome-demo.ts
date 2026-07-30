import type { Car, CarType } from "@/types/car";

const RATE = 12.5;
const SYNCED_AT = "2026-01-15T00:00:00.000Z";
/** Curated Unsplash pools — each URL matches the body type it lives in. */
const PHOTOS_BY_TYPE: Record<CarType, string[]> = {
  sedan: [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80", // BMW 5 Series
    "https://images.unsplash.com/photo-1583121274602-3e2820c50efe?w=800&q=80", // Mercedes E-Class
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80", // Tesla Model 3
    "https://images.unsplash.com/photo-1605559424843-efef323f3179?w=800&q=80", // Audi A4
    "https://images.unsplash.com/photo-1621007945112-4c2d9b86e9b2?w=800&q=80", // Toyota Camry
  ],
  crossover: [
    "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80", // Tesla Model Y
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80", // Range Rover Evoque
    "https://images.unsplash.com/photo-1517177646-9e4998a1e996?w=800&q=80", // Honda CR-V
    "https://images.unsplash.com/photo-1549395162-2f0adf235b2e?w=800&q=80", // compact crossover
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80", // Volvo XC90
  ],
  suv: [
    "https://images.unsplash.com/photo-1519641471654-76cefc7c8dec?w=800&q=80", // large SUV
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80", // Jeep 4x4
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80", // Mercedes GLE
    "https://images.unsplash.com/photo-1533474712522-2740e1c96c4e?w=800&q=80", // Land Rover
    "https://images.unsplash.com/photo-1590362896012-4d7a484eaa84?w=800&q=80", // BMW X5
  ],
  hatchback: [
    "https://images.unsplash.com/photo-1541899481282-d53bffe2c00d?w=800&q=80", // VW Golf
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80", // Honda Civic hatch
    "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80", // compact hatch
    "https://images.unsplash.com/photo-1562145161-47612b5a5b4b?w=800&q=80", // Mini hatchback
  ],
  coupe: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", // Porsche 911
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80", // Ford Mustang
    "https://images.unsplash.com/photo-1619767886552-efdc259cde1a?w=800&q=80", // Porsche 911 (alt)
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80", // Chevrolet Camaro
  ],
};

export function photoForDemoCar(type: CarType, brandSlug: string, model: string): string {
  const pool = PHOTOS_BY_TYPE[type] ?? PHOTOS_BY_TYPE.crossover;
  const key = `${brandSlug}:${model.toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length]!;
}

type RawListing = [string, string, string, number, CarType, number, string, string, string, string, number];

const LISTINGS: RawListing[] = [
  ["byd", "BYD", "Han EV", 2024, "sedan", 189800, "2.0 L", "517 hp", "Electric", "15.4 kWh/100km", 40],
  ["byd", "BYD", "Seal", 2024, "sedan", 162800, "2.0 L", "530 hp", "Electric", "14.6 kWh/100km", 39],
  ["byd", "BYD", "Song Plus", 2024, "crossover", 139800, "1.5 L", "197 hp", "Hybrid", "5.3 L/100km", 38],
  ["byd", "BYD", "Tang", 2023, "suv", 219800, "2.0 L", "431 hp", "Hybrid", "6.5 L/100km", 41],
  ["geely", "Geely", "Coolray", 2024, "crossover", 95800, "1.5 L", "177 hp", "Petrol", "6.2 L/100km", 38],
  ["geely", "Geely", "Monjaro", 2024, "crossover", 168800, "2.0 L", "238 hp", "Petrol", "7.8 L/100km", 40],
  ["geely", "Geely", "Galaxy L7", 2024, "crossover", 129800, "1.5 L", "390 hp", "Hybrid", "5.2 L/100km", 39],
  ["chery", "Chery", "Tiggo 8 Pro", 2023, "suv", 129900, "2.0 L", "254 hp", "Petrol", "8.5 L/100km", 42],
  ["chery", "Chery", "Tiggo 7 Pro", 2024, "crossover", 109900, "1.6 L", "197 hp", "Petrol", "7.1 L/100km", 39],
  ["chery", "Chery", "Arrizo 8", 2024, "sedan", 99800, "1.6 L", "197 hp", "Petrol", "6.8 L/100km", 37],
  ["haval", "Haval", "H6", 2024, "crossover", 112800, "2.0 L", "211 hp", "Petrol", "7.9 L/100km", 40],
  ["haval", "Haval", "Jolion", 2024, "crossover", 89800, "1.5 L", "150 hp", "Petrol", "6.8 L/100km", 38],
  ["haval", "Haval", "Dargo", 2023, "crossover", 149800, "2.0 L", "211 hp", "Petrol", "8.2 L/100km", 41],
  ["changan", "Changan", "UNI-V", 2024, "sedan", 108900, "1.5 L", "188 hp", "Petrol", "6.5 L/100km", 37],
  ["changan", "Changan", "CS75 Plus", 2024, "crossover", 119800, "1.5 L", "188 hp", "Petrol", "7.0 L/100km", 38],
  ["li-auto", "Li Auto", "L7", 2024, "suv", 319800, "1.5 L", "449 hp", "Hybrid", "7.8 L/100km", 45],
  ["li-auto", "Li Auto", "L6", 2024, "suv", 249800, "1.5 L", "408 hp", "Hybrid", "7.2 L/100km", 44],
  ["li-auto", "Li Auto", "L9", 2023, "suv", 429800, "1.5 L", "449 hp", "Hybrid", "8.1 L/100km", 46],
  ["zeekr", "Zeekr", "001", 2024, "crossover", 269000, "2.0 L", "544 hp", "Electric", "16.8 kWh/100km", 43],
  ["zeekr", "Zeekr", "007", 2024, "sedan", 209800, "2.0 L", "422 hp", "Electric", "14.2 kWh/100km", 42],
  ["hongqi", "Hongqi", "H9", 2023, "sedan", 309800, "2.0 L", "252 hp", "Petrol", "8.0 L/100km", 44],
  ["hongqi", "Hongqi", "HS5", 2024, "crossover", 189800, "2.0 L", "224 hp", "Petrol", "8.4 L/100km", 41],
  ["gac-aion", "GAC Aion", "Y Plus", 2024, "crossover", 119800, "2.0 L", "204 hp", "Electric", "13.1 kWh/100km", 38],
  ["gac-aion", "GAC Aion", "S Plus", 2024, "sedan", 139800, "2.0 L", "245 hp", "Electric", "13.8 kWh/100km", 39],
  ["wuling", "Wuling", "Bingo", 2024, "hatchback", 59800, "2.0 L", "68 hp", "Electric", "10.2 kWh/100km", 35],
  ["wuling", "Wuling", "Starlight", 2024, "sedan", 79800, "1.5 L", "143 hp", "Petrol", "5.9 L/100km", 36],
  ["tank", "Tank", "300", 2024, "suv", 199800, "2.0 L", "227 hp", "Petrol", "9.5 L/100km", 41],
  ["tank", "Tank", "500", 2023, "suv", 339800, "3.0 L", "354 hp", "Petrol", "10.5 L/100km", 44],
  ["nio", "NIO", "ET5", 2024, "sedan", 298000, "2.0 L", "490 hp", "Electric", "15.1 kWh/100km", 43],
  ["nio", "NIO", "ES6", 2024, "crossover", 338000, "2.0 L", "490 hp", "Electric", "16.2 kWh/100km", 44],
  ["xpeng", "XPeng", "G6", 2024, "crossover", 209800, "2.0 L", "487 hp", "Electric", "14.9 kWh/100km", 42],
  ["xpeng", "XPeng", "P7", 2023, "sedan", 229800, "2.0 L", "473 hp", "Electric", "15.6 kWh/100km", 43],
  ["voyah", "Voyah", "Free", 2024, "suv", 269800, "1.5 L", "510 hp", "Hybrid", "7.5 L/100km", 44],
  ["avatr", "Avatr", "11", 2024, "crossover", 299800, "2.0 L", "578 hp", "Electric", "16.5 kWh/100km", 44],
  ["leapmotor", "Leapmotor", "C11", 2024, "crossover", 149800, "2.0 L", "272 hp", "Electric", "14.8 kWh/100km", 40],
  ["leapmotor", "Leapmotor", "C10", 2024, "crossover", 128800, "2.0 L", "231 hp", "Electric", "14.2 kWh/100km", 39],
  ["jetour", "Jetour", "Dashing", 2024, "crossover", 109800, "1.6 L", "197 hp", "Petrol", "7.3 L/100km", 38],
  ["jetour", "Jetour", "T2", 2024, "suv", 169800, "2.0 L", "254 hp", "Petrol", "8.9 L/100km", 41],
  ["omoda", "Omoda", "C5", 2024, "crossover", 119800, "1.6 L", "197 hp", "Petrol", "7.0 L/100km", 38],
  ["jaecoo", "Jaecoo", "J7", 2024, "crossover", 149800, "1.6 L", "197 hp", "Petrol", "7.4 L/100km", 40],
  ["mg", "MG", "MG4", 2024, "hatchback", 139800, "2.0 L", "204 hp", "Electric", "13.5 kWh/100km", 39],
  ["mg", "MG", "MG7", 2024, "sedan", 119800, "2.0 L", "231 hp", "Petrol", "7.6 L/100km", 38],
  ["deepal", "Deepal", "SL03", 2024, "sedan", 149800, "2.0 L", "258 hp", "Electric", "13.9 kWh/100km", 40],
  ["deepal", "Deepal", "S7", 2024, "crossover", 169800, "2.0 L", "320 hp", "Electric", "14.4 kWh/100km", 41],
  ["aito", "AITO", "M7", 2024, "suv", 249800, "1.5 L", "449 hp", "Hybrid", "7.4 L/100km", 44],
  ["aito", "AITO", "M9", 2024, "suv", 469800, "1.5 L", "496 hp", "Hybrid", "7.9 L/100km", 46],
  ["baic", "BAIC", "BJ40", 2024, "suv", 169800, "2.0 L", "224 hp", "Petrol", "9.8 L/100km", 41],
  ["neta", "Neta", "S", 2024, "sedan", 159800, "2.0 L", "340 hp", "Electric", "14.1 kWh/100km", 40],
  ["roewe", "Roewe", "RX5", 2024, "crossover", 109800, "1.5 L", "181 hp", "Petrol", "6.9 L/100km", 38],
  ["maxus", "Maxus", "Mifa 9", 2024, "crossover", 269800, "2.0 L", "245 hp", "Electric", "17.2 kWh/100km", 44],
  ["dongfeng", "Dongfeng", "Forthing T5 EVO", 2024, "crossover", 99800, "1.5 L", "197 hp", "Petrol", "7.2 L/100km", 37],
  ["great-wall", "Great Wall", "Ora Good Cat", 2024, "hatchback", 109800, "2.0 L", "171 hp", "Electric", "12.8 kWh/100km", 38],
  ["toyota", "Toyota", "Camry", 2024, "sedan", 198000, "2.5 L", "181 hp", "Petrol", "7.1 L/100km", 45],
  ["bmw", "BMW", "X5", 2023, "suv", 578000, "3.0 L", "340 hp", "Petrol", "9.4 L/100km", 55],
  ["mercedes", "Mercedes-Benz", "E-Class", 2024, "sedan", 489000, "2.0 L", "258 hp", "Petrol", "8.2 L/100km", 50],
  ["audi", "Audi", "Q5", 2023, "crossover", 432000, "2.0 L", "249 hp", "Petrol", "8.8 L/100km", 48],
  ["lexus", "Lexus", "RX", 2024, "crossover", 544000, "2.4 L", "279 hp", "Petrol", "9.0 L/100km", 52],
  ["porsche", "Porsche", "Macan", 2023, "crossover", 712000, "2.0 L", "265 hp", "Petrol", "9.6 L/100km", 60],
  ["volkswagen", "Volkswagen", "Tiguan", 2024, "crossover", 298000, "2.0 L", "220 hp", "Petrol", "8.0 L/100km", 46],
  ["hyundai", "Hyundai", "Tucson", 2024, "crossover", 248000, "1.6 L", "180 hp", "Petrol", "7.5 L/100km", 44],
  ["kia", "Kia", "Sportage", 2024, "crossover", 238000, "1.6 L", "180 hp", "Petrol", "7.4 L/100km", 43],
  ["volvo", "Volvo", "XC60", 2024, "crossover", 468000, "2.0 L", "250 hp", "Petrol", "8.5 L/100km", 50],
  ["land-rover", "Land Rover", "Defender", 2023, "suv", 698000, "3.0 L", "400 hp", "Petrol", "11.2 L/100km", 58],
  ["tesla", "Tesla", "Model Y", 2024, "crossover", 399000, "2.0 L", "450 hp", "Electric", "15.0 kWh/100km", 48],
  ["genesis", "Genesis", "GV70", 2024, "crossover", 428000, "2.5 L", "304 hp", "Petrol", "9.1 L/100km", 49],
];

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function countryFor(slug: string): string {
  if (slug === "toyota" || slug === "lexus") return "Japan";
  if (slug === "hyundai" || slug === "kia" || slug === "genesis") return "Korea";
  if (slug === "volvo") return "Sweden";
  if (slug === "land-rover") return "UK";
  if (slug === "tesla") return "USA";
  if (["bmw", "mercedes", "audi", "porsche", "volkswagen"].includes(slug)) return "Germany";
  return "China";
}

function estimateCustoms(priceRub: number, engine: string, year: number): number {
  const ageYears = Math.max(0, new Date().getFullYear() - year);
  const match = engine.match(/([\d.]+)\s*[lL]/);
  const cc = match ? Math.round(parseFloat(match[1]) * 1000) : 2000;
  const ageFactor = ageYears <= 3 ? 1.2 : ageYears <= 5 ? 1.0 : 0.85;
  const duty = Math.round(priceRub * 0.15 * ageFactor * (cc / 2000));
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
    customsCost: estimateCustoms(price, engine, year),
    deliveryDays, country: countryFor(brandSlug), imageColor: "#1a3a5c",
    specs: { engine, power, transmission: "Auto", drive: type === "suv" || type === "crossover" ? "AWD" : "FWD", fuel, consumption },
    description: `${brand} ${model} ${year} — импорт под ключ с расчётом таможни и доставкой.`,
    sync: { source: "autohome", sourceId: id, sourceUrl: "https://www.autohome.com.cn/", photos: [photo], priceCny, exchangeRate: RATE, exchangeBank: "VTB", exchangeRateAt: SYNCED_AT, customsSource: "tks.ru", syncedAt: SYNCED_AT },
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
  LISTINGS.forEach((entry) => {
    cars.push(buildOne(entry));
    cars.push(buildOne(altListing(entry)));
  });
  return cars;
}

export const autohomeDemoCars: Car[] = buildDemoCars();
