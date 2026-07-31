import type { Car, CarType } from "@/types/car";
import { photoForDemoCar } from "./demo-car-photos";

const RATE = 12.5;
const SYNCED_AT = "2026-01-15T00:00:00.000Z";

type RawListing = [string, string, string, number, CarType, number, string, string, string, string, number];

const LISTINGS: RawListing[] = [
  ["byd", "BYD", "Han EV", 2024, "sedan", 189800, "Dual Motor", "517 hp", "Electric", "15.4 kWh/100km", 40],
  ["byd", "BYD", "Seal", 2024, "sedan", 162800, "Rear Motor", "313 hp", "Electric", "14.6 kWh/100km", 39],
  ["byd", "BYD", "Song Plus", 2024, "crossover", 139800, "1.5 L", "197 hp", "Hybrid", "5.3 L/100km", 38],
  ["byd", "BYD", "Tang", 2023, "suv", 219800, "1.5 L", "431 hp", "Hybrid", "6.5 L/100km", 41],
  ["byd", "BYD", "Qin Plus", 2024, "sedan", 99800, "1.5 L", "180 hp", "Hybrid", "3.8 L/100km", 36],
  ["byd", "BYD", "Yuan Plus", 2024, "crossover", 129800, "Single Motor", "204 hp", "Electric", "13.8 kWh/100km", 38],
  ["byd", "BYD", "Dolphin", 2024, "hatchback", 99800, "Single Motor", "177 hp", "Electric", "12.2 kWh/100km", 36],
  ["byd", "BYD", "Seal 06", 2024, "sedan", 112800, "1.5 L", "212 hp", "Hybrid", "3.9 L/100km", 37],
  ["geely", "Geely", "Coolray", 2024, "crossover", 95800, "1.5 L", "177 hp", "Petrol", "6.2 L/100km", 38],
  ["geely", "Geely", "Monjaro", 2024, "crossover", 168800, "2.0 L", "238 hp", "Petrol", "7.8 L/100km", 40],
  ["geely", "Geely", "Galaxy L7", 2024, "crossover", 129800, "1.5 L", "390 hp", "Hybrid", "5.2 L/100km", 39],
  ["geely", "Geely", "Preface", 2024, "sedan", 118800, "2.0 L", "218 hp", "Petrol", "7.0 L/100km", 38],
  ["geely", "Geely", "Xingyue L", 2024, "crossover", 148800, "2.0 L", "218 hp", "Petrol", "7.6 L/100km", 39],
  ["chery", "Chery", "Tiggo 8 Pro", 2023, "suv", 129900, "2.0 L", "254 hp", "Petrol", "8.5 L/100km", 42],
  ["chery", "Chery", "Tiggo 7 Pro", 2024, "crossover", 109900, "1.6 L", "197 hp", "Petrol", "7.1 L/100km", 39],
  ["chery", "Chery", "Arrizo 8", 2024, "sedan", 99800, "1.6 L", "197 hp", "Petrol", "6.8 L/100km", 37],
  ["chery", "Chery", "Tiggo 4 Pro", 2024, "crossover", 89800, "1.5 L", "147 hp", "Petrol", "6.9 L/100km", 37],
  ["omoda", "Omoda", "C5", 2024, "crossover", 119800, "1.6 L", "197 hp", "Petrol", "7.0 L/100km", 38],
  ["jaecoo", "Jaecoo", "J7", 2024, "crossover", 149800, "1.6 L", "197 hp", "Petrol", "7.4 L/100km", 40],
  ["exeed", "Exeed", "TXL", 2024, "crossover", 169800, "2.0 L", "249 hp", "Petrol", "8.1 L/100km", 41],
  ["exeed", "Exeed", "LX", 2024, "crossover", 129800, "1.6 L", "197 hp", "Petrol", "7.2 L/100km", 39],
  ["haval", "Haval", "H6", 2024, "crossover", 112800, "2.0 L", "211 hp", "Petrol", "7.9 L/100km", 40],
  ["haval", "Haval", "Jolion", 2024, "crossover", 89800, "1.5 L", "150 hp", "Petrol", "6.8 L/100km", 38],
  ["haval", "Haval", "Dargo", 2023, "crossover", 149800, "2.0 L", "211 hp", "Petrol", "8.2 L/100km", 41],
  ["haval", "Haval", "H9", 2024, "suv", 189800, "2.0 L", "224 hp", "Petrol", "10.2 L/100km", 42],
  ["tank", "Tank", "300", 2024, "suv", 199800, "2.0 L", "227 hp", "Petrol", "9.5 L/100km", 41],
  ["tank", "Tank", "500", 2023, "suv", 339800, "3.0 L", "354 hp", "Petrol", "10.5 L/100km", 44],
  ["tank", "Tank", "400", 2024, "suv", 249800, "2.0 L", "252 hp", "Hybrid", "8.8 L/100km", 42],
  ["great-wall", "Great Wall", "Ora Good Cat", 2024, "hatchback", 109800, "Single Motor", "171 hp", "Electric", "12.8 kWh/100km", 38],
  ["wey", "WEY", "Coffee 01", 2024, "crossover", 189800, "1.5 L", "245 hp", "Hybrid", "5.5 L/100km", 41],
  ["changan", "Changan", "UNI-V", 2024, "sedan", 108900, "1.5 L", "188 hp", "Petrol", "6.5 L/100km", 37],
  ["changan", "Changan", "CS75 Plus", 2024, "crossover", 119800, "1.5 L", "188 hp", "Petrol", "7.0 L/100km", 38],
  ["changan", "Changan", "UNI-K", 2024, "crossover", 139800, "2.0 L", "233 hp", "Petrol", "8.0 L/100km", 39],
  ["deepal", "Deepal", "SL03", 2024, "sedan", 149800, "Single Motor", "218 hp", "Electric", "13.9 kWh/100km", 40],
  ["deepal", "Deepal", "S7", 2024, "crossover", 169800, "Single Motor", "258 hp", "Electric", "14.4 kWh/100km", 41],
  ["li-auto", "Li Auto", "L7", 2024, "suv", 319800, "1.5 L", "449 hp", "Hybrid", "7.8 L/100km", 45],
  ["li-auto", "Li Auto", "L6", 2024, "suv", 249800, "1.5 L", "408 hp", "Hybrid", "7.2 L/100km", 44],
  ["li-auto", "Li Auto", "L9", 2023, "suv", 429800, "1.5 L", "449 hp", "Hybrid", "8.1 L/100km", 46],
  ["li-auto", "Li Auto", "L8", 2024, "suv", 359800, "1.5 L", "449 hp", "Hybrid", "7.9 L/100km", 45],
  ["aito", "AITO", "M7", 2024, "suv", 249800, "1.5 L", "449 hp", "Hybrid", "7.4 L/100km", 44],
  ["aito", "AITO", "M9", 2024, "suv", 469800, "1.5 L", "496 hp", "Hybrid", "7.9 L/100km", 46],
  ["aito", "AITO", "M5", 2024, "crossover", 249800, "1.5 L", "496 hp", "Hybrid", "6.4 L/100km", 43],
  ["voyah", "Voyah", "Free", 2024, "suv", 269800, "1.5 L", "510 hp", "Hybrid", "7.5 L/100km", 44],
  ["voyah", "Voyah", "Dream", 2024, "suv", 369800, "1.5 L", "510 hp", "Hybrid", "8.0 L/100km", 45],
  ["avatr", "Avatr", "11", 2024, "crossover", 299800, "Dual Motor", "578 hp", "Electric", "16.5 kWh/100km", 44],
  ["avatr", "Avatr", "12", 2024, "sedan", 279800, "Dual Motor", "578 hp", "Electric", "15.8 kWh/100km", 44],
  ["zeekr", "Zeekr", "001", 2024, "crossover", 269000, "Dual Motor", "544 hp", "Electric", "16.8 kWh/100km", 43],
  ["zeekr", "Zeekr", "007", 2024, "sedan", 209800, "Dual Motor", "422 hp", "Electric", "14.2 kWh/100km", 42],
  ["zeekr", "Zeekr", "X", 2024, "crossover", 189800, "Dual Motor", "428 hp", "Electric", "15.5 kWh/100km", 41],
  ["zeekr", "Zeekr", "009", 2024, "suv", 499800, "Dual Motor", "544 hp", "Electric", "20.2 kWh/100km", 46],
  ["lynk-co", "Lynk & Co", "08", 2024, "crossover", 189800, "1.5 L", "245 hp", "Hybrid", "5.5 L/100km", 41],
  ["lynk-co", "Lynk & Co", "09", 2024, "suv", 229800, "2.0 L", "254 hp", "Petrol", "8.6 L/100km", 42],
  ["hongqi", "Hongqi", "H9", 2023, "sedan", 309800, "2.0 L", "252 hp", "Petrol", "8.0 L/100km", 44],
  ["hongqi", "Hongqi", "HS5", 2024, "crossover", 189800, "2.0 L", "224 hp", "Petrol", "8.4 L/100km", 41],
  ["hongqi", "Hongqi", "E-HS9", 2024, "suv", 429800, "Dual Motor", "551 hp", "Electric", "20.5 kWh/100km", 46],
  ["hongqi", "Hongqi", "HS7", 2024, "suv", 249800, "2.0 L", "252 hp", "Petrol", "9.0 L/100km", 43],
  ["gac-aion", "GAC Aion", "Y Plus", 2024, "crossover", 119800, "Single Motor", "204 hp", "Electric", "13.1 kWh/100km", 38],
  ["gac-aion", "GAC Aion", "S Plus", 2024, "sedan", 139800, "Single Motor", "245 hp", "Electric", "13.8 kWh/100km", 39],
  ["gac-aion", "GAC Aion", "V", 2024, "crossover", 149800, "Single Motor", "184 hp", "Electric", "14.5 kWh/100km", 39],
  ["trumpchi", "Trumpchi", "GS8", 2024, "suv", 169800, "2.0 L", "252 hp", "Petrol", "8.9 L/100km", 41],
  ["wuling", "Wuling", "Bingo", 2024, "hatchback", 59800, "Single Motor", "68 hp", "Electric", "10.2 kWh/100km", 35],
  ["wuling", "Wuling", "Starlight", 2024, "sedan", 79800, "1.5 L", "143 hp", "Petrol", "5.9 L/100km", 36],
  ["wuling", "Wuling", "Hongguang Mini EV", 2024, "hatchback", 32800, "Single Motor", "41 hp", "Electric", "9.0 kWh/100km", 34],
  ["nio", "NIO", "ET5", 2024, "sedan", 298000, "Dual Motor", "490 hp", "Electric", "15.1 kWh/100km", 43],
  ["nio", "NIO", "ES6", 2024, "crossover", 338000, "Dual Motor", "490 hp", "Electric", "16.2 kWh/100km", 44],
  ["nio", "NIO", "ET7", 2024, "sedan", 428000, "Dual Motor", "653 hp", "Electric", "16.0 kWh/100km", 45],
  ["nio", "NIO", "ES8", 2024, "suv", 468000, "Dual Motor", "653 hp", "Electric", "19.5 kWh/100km", 46],
  ["xpeng", "XPeng", "G6", 2024, "crossover", 209800, "Dual Motor", "487 hp", "Electric", "14.9 kWh/100km", 42],
  ["xpeng", "XPeng", "P7", 2023, "sedan", 229800, "Dual Motor", "473 hp", "Electric", "15.6 kWh/100km", 43],
  ["xpeng", "XPeng", "G9", 2024, "suv", 309800, "Dual Motor", "551 hp", "Electric", "18.2 kWh/100km", 44],
  ["xpeng", "XPeng", "X9", 2024, "suv", 359800, "Dual Motor", "551 hp", "Electric", "18.8 kWh/100km", 45],
  ["xiaomi", "Xiaomi", "SU7", 2024, "sedan", 245900, "Dual Motor", "673 hp", "Electric", "14.9 kWh/100km", 42],
  ["im", "IM Motors", "LS6", 2024, "crossover", 229800, "Dual Motor", "579 hp", "Electric", "15.8 kWh/100km", 42],
  ["im", "IM Motors", "L7", 2024, "sedan", 249800, "Dual Motor", "578 hp", "Electric", "15.2 kWh/100km", 43],
  ["leapmotor", "Leapmotor", "C11", 2024, "crossover", 149800, "Dual Motor", "272 hp", "Electric", "14.8 kWh/100km", 40],
  ["leapmotor", "Leapmotor", "C10", 2024, "crossover", 128800, "Single Motor", "231 hp", "Electric", "14.2 kWh/100km", 39],
  ["leapmotor", "Leapmotor", "C01", 2024, "sedan", 139800, "Dual Motor", "544 hp", "Electric", "14.5 kWh/100km", 40],
  ["neta", "Neta", "S", 2024, "sedan", 159800, "Dual Motor", "340 hp", "Electric", "14.1 kWh/100km", 40],
  ["neta", "Neta", "X", 2024, "crossover", 119800, "Single Motor", "231 hp", "Electric", "13.8 kWh/100km", 38],
  ["jetour", "Jetour", "Dashing", 2024, "crossover", 109800, "1.6 L", "197 hp", "Petrol", "7.3 L/100km", 38],
  ["jetour", "Jetour", "T2", 2024, "suv", 169800, "2.0 L", "254 hp", "Petrol", "8.9 L/100km", 41],
  ["mg", "MG", "MG4", 2024, "hatchback", 139800, "Single Motor", "204 hp", "Electric", "13.5 kWh/100km", 39],
  ["mg", "MG", "MG7", 2024, "sedan", 119800, "2.0 L", "231 hp", "Petrol", "7.6 L/100km", 38],
  ["mg", "MG", "ZS", 2024, "crossover", 99800, "1.5 L", "162 hp", "Petrol", "6.9 L/100km", 37],
  ["baic", "BAIC", "BJ40", 2024, "suv", 169800, "2.0 L", "224 hp", "Petrol", "9.8 L/100km", 41],
  ["roewe", "Roewe", "RX5", 2024, "crossover", 109800, "1.5 L", "181 hp", "Petrol", "6.9 L/100km", 38],
  ["maxus", "Maxus", "Mifa 9", 2024, "crossover", 269800, "Single Motor", "245 hp", "Electric", "17.2 kWh/100km", 44],
  ["dongfeng", "Dongfeng", "Forthing T5 EVO", 2024, "crossover", 99800, "1.5 L", "197 hp", "Petrol", "7.2 L/100km", 37],
  ["denza", "Denza", "D9", 2024, "suv", 389800, "1.5 L", "376 hp", "Hybrid", "6.6 L/100km", 45],
  ["denza", "Denza", "N7", 2024, "crossover", 239800, "Dual Motor", "313 hp", "Electric", "15.2 kWh/100km", 43],
  ["fangchengbao", "Fangchengbao", "Bao 5", 2024, "suv", 289800, "1.5 L", "510 hp", "Hybrid", "8.5 L/100km", 44],
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
  LISTINGS.forEach((entry) => {
    cars.push(buildOne(entry));
    cars.push(buildOne(altListing(entry)));
  });
  return cars;
}

export const autohomeDemoCars: Car[] = buildDemoCars();
