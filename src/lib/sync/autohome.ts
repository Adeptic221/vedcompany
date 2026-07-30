import type { Car, CarType } from "@/types/car";
import type { VtbExchangeRate } from "@/types/sync";
import { convertCnyToRub } from "@/lib/exchange/vtb";
import { calculateCustoms, parseEngineVolumeCc } from "@/lib/customs/calculate";

export interface AutohomeRawCar {
  sourceId: string;
  sourceUrl: string;
  brand: string;
  brandSlug: string;
  model: string;
  year: number;
  type: CarType;
  priceCny: number;
  photos: string[];
  specs: Car["specs"];
  descriptionRu: string;
  deliveryDays?: number;
}

/** Carapis / compatible listing shape (https://carapis.com/api/listings) */
export interface CarapisListing {
  id?: string;
  source?: string;
  make?: string;
  model?: string;
  trim?: string;
  year?: number;
  mileage?: number;
  price?: number;
  currency?: string;
  location?: string;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  photos?: string[];
  images?: string[];
  url?: string;
  sourceUrl?: string;
  description?: string;
  specs?: Partial<Record<string, string>>;
  engine?: string;
  power?: string;
  drive?: string;
  consumption?: string;
}

export interface AutohomeApiResponse {
  results?: unknown[];
  data?: unknown[];
  listings?: unknown[];
}

const DEFAULT_LIMIT = 50;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "brand";
}

function inferCarType(item: CarapisListing): CarType {
  const hint = `${item.body_type ?? ""} ${item.model ?? ""} ${item.trim ?? ""}`.toLowerCase();
  if (/suv|внедор|越野|off.?road/.test(hint)) return "suv";
  if (/cross|кросс|compact suv/.test(hint)) return "crossover";
  if (/hatch|хэтч|两厢/.test(hint)) return "hatchback";
  if (/coupe|купе|轿跑/.test(hint)) return "coupe";
  if (/sedan|седан|三厢/.test(hint)) return "sedan";
  if (/han|model 3|passat|camry|седан/.test(hint)) return "sedan";
  if (/tiggo|x5|x7|q5|rav4|coolray|song plus|hs5/.test(hint)) return "suv";
  return "crossover";
}

const FUEL_MAP: Record<string, string> = {
  gasoline: "Бензин",
  petrol: "Бензин",
  gas: "Бензин",
  diesel: "Дизель",
  hybrid: "Гибрид",
  phev: "Гибрид",
  plug_in_hybrid: "Гибрид",
  electric: "Электро",
  ev: "Электро",
  汽油: "Бензин",
  柴油: "Дизель",
  混动: "Гибрид",
  电动: "Электро",
};

const TRANSMISSION_MAP: Record<string, string> = {
  automatic: "Автомат",
  auto: "Автомат",
  cvt: "Вариатор",
  dct: "Робот",
  manual: "Механика",
  自动: "Автомат",
  手动: "Механика",
};

const DRIVE_MAP: Record<string, string> = {
  fwd: "Передний",
  rwd: "Задний",
  awd: "Полный",
  "4wd": "Полный",
  front: "Передний",
  rear: "Задний",
  all: "Полный",
};

function mapFuel(value?: string): string {
  if (!value) return "Бензин";
  const key = value.toLowerCase().trim();
  return FUEL_MAP[key] ?? value;
}

function mapTransmission(value?: string): string {
  if (!value) return "Автомат";
  const key = value.toLowerCase().trim();
  for (const [pattern, label] of Object.entries(TRANSMISSION_MAP)) {
    if (key.includes(pattern)) return label;
  }
  return value;
}

function mapDrive(value?: string): string {
  if (!value) return "Передний";
  const key = value.toLowerCase().trim();
  return DRIVE_MAP[key] ?? value;
}

function buildDescription(item: CarapisListing, brand: string, model: string, year: number): string {
  if (item.description?.trim()) return item.description.trim();
  const trim = item.trim ? ` ${item.trim}` : "";
  const location = item.location ? ` · ${item.location}` : "";
  const mileage =
    typeof item.mileage === "number" && item.mileage > 0
      ? ` · пробег ${item.mileage.toLocaleString("ru-RU")} км`
      : "";
  return `${brand} ${model}${trim} ${year} — автомобиль с китайского рынка${location}${mileage}. Импорт под ключ с расчётом таможни и доставкой.`;
}

function isAutohomeRawCar(item: unknown): item is AutohomeRawCar {
  if (!item || typeof item !== "object") return false;
  const o = item as Record<string, unknown>;
  return (
    typeof o.sourceId === "string" &&
    typeof o.brand === "string" &&
    typeof o.model === "string" &&
    typeof o.year === "number" &&
    typeof o.priceCny === "number"
  );
}

export function parseCarapisListing(item: CarapisListing): AutohomeRawCar | null {
  const brand = (item.make ?? "").trim();
  const modelBase = (item.model ?? "").trim();
  if (!brand || !modelBase) return null;

  const year = item.year ?? new Date().getFullYear();
  const currency = (item.currency ?? "CNY").toUpperCase();
  const rawPrice = item.price ?? 0;
  if (!rawPrice || rawPrice <= 0) return null;

  // Carapis China listings are in CNY; other currencies converted approximately for display
  let priceCny = rawPrice;
  if (currency !== "CNY" && currency !== "RMB") {
    if (currency === "USD") priceCny = Math.round(rawPrice * 7.2);
    else if (currency === "EUR") priceCny = Math.round(rawPrice * 7.8);
    else priceCny = rawPrice;
  }

  const model = item.trim ? `${modelBase} ${item.trim}`.trim() : modelBase;
  const sourceId = item.id ? `ah-${item.id}` : `ah-${slugify(brand)}-${slugify(model)}-${year}`;
  const photos = (item.photos?.length ? item.photos : item.images) ?? [];
  const specs = item.specs ?? {};

  const engine =
    item.engine ??
    specs.engine ??
    specs.displacement ??
    (item.fuel_type === "electric" || item.fuel_type === "ev" ? "Электро" : "2.0 L");

  return {
    sourceId,
    sourceUrl: item.url ?? item.sourceUrl ?? "",
    brand,
    brandSlug: slugify(brand),
    model,
    year,
    type: inferCarType(item),
    priceCny,
    photos,
    specs: {
      engine,
      power: item.power ?? specs.power ?? specs.horsepower ?? "—",
      transmission: mapTransmission(item.transmission ?? specs.transmission),
      drive: mapDrive(item.drive ?? specs.drive),
      fuel: mapFuel(item.fuel_type ?? specs.fuel ?? specs.fuel_type),
      consumption: item.consumption ?? specs.consumption ?? "—",
    },
    descriptionRu: buildDescription(item, brand, model, year),
    deliveryDays: 38 + (year >= new Date().getFullYear() - 1 ? 0 : 4),
  };
}

export function parseAutohomeApiResponse(data: AutohomeApiResponse): AutohomeRawCar[] {
  const items = data.results ?? data.data ?? data.listings ?? [];
  const parsed: AutohomeRawCar[] = [];

  for (const item of items) {
    if (isAutohomeRawCar(item)) {
      parsed.push(item);
      continue;
    }
    const mapped = parseCarapisListing(item as CarapisListing);
    if (mapped) parsed.push(mapped);
  }

  return parsed;
}

function buildApiUrl(baseUrl: string, limit: number): string {
  const url = new URL(baseUrl);
  if (!url.searchParams.has("source")) url.searchParams.set("source", "autohome");
  if (!url.searchParams.has("limit")) url.searchParams.set("limit", String(limit));
  return url.toString();
}

export async function fetchAutohomeCatalog(): Promise<AutohomeRawCar[]> {
  const apiKey = process.env.AUTOHOME_API_KEY?.trim();
  const apiUrl = process.env.AUTOHOME_API_URL?.trim();
  const limit = Number(process.env.AUTOHOME_API_LIMIT ?? DEFAULT_LIMIT) || DEFAULT_LIMIT;

  if (apiKey && apiUrl) {
    try {
      const res = await fetch(buildApiUrl(apiUrl, limit), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        console.error("[autohome] API error:", res.status, await res.text().catch(() => ""));
      } else {
        const data = (await res.json()) as AutohomeApiResponse;
        const parsed = parseAutohomeApiResponse(data);
        if (parsed.length > 0) {
          console.info(`[autohome] Fetched ${parsed.length} listings from API`);
          return parsed;
        }
        console.warn("[autohome] API returned empty results, using demo catalog");
      }
    } catch (e) {
      console.error("[autohome] fetch failed:", e);
    }
  } else {
    console.info("[autohome] No AUTOHOME_API_KEY/URL — using demo catalog");
  }

  return getDemoAutohomeCatalog();
}

/** Demo listings when API key is not configured (dev / Netlify without Carapis) */
export function getDemoAutohomeCatalog(): AutohomeRawCar[] {
  return [
    {
      sourceId: "ah-byd-han-2024",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "BYD",
      brandSlug: "byd",
      model: "Han EV",
      year: 2024,
      type: "sedan",
      priceCny: 189800,
      photos: ["https://images.unsplash.com/photo-1619767886552-efdc259cde1a?w=800&q=80"],
      specs: {
        engine: "Электро",
        power: "517 л.с.",
        transmission: "Автомат",
        drive: "Передний",
        fuel: "Электро",
        consumption: "15.4 kWh/100 км",
      },
      descriptionRu: "BYD Han EV — флагманский электроседан с запасом хода до 715 км (CLTC). Популярен для импорта в РФ.",
      deliveryDays: 40,
    },
    {
      sourceId: "ah-byd-seal-2024",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "BYD",
      brandSlug: "byd",
      model: "Seal",
      year: 2024,
      type: "sedan",
      priceCny: 162800,
      photos: ["https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"],
      specs: {
        engine: "Электро",
        power: "530 л.с.",
        transmission: "Автомат",
        drive: "Задний",
        fuel: "Электро",
        consumption: "14.6 kWh/100 км",
      },
      descriptionRu: "BYD Seal — спортивный электроседан на платформе e-Platform 3.0.",
      deliveryDays: 39,
    },
    {
      sourceId: "ah-geely-coolray-2024",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "Geely",
      brandSlug: "geely",
      model: "Coolray",
      year: 2024,
      type: "crossover",
      priceCny: 95800,
      photos: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80"],
      specs: {
        engine: "1.5 L",
        power: "177 л.с.",
        transmission: "Робот",
        drive: "Передний",
        fuel: "Бензин",
        consumption: "6.2 л/100 км",
      },
      descriptionRu: "Geely Coolray — компактный кроссовер с турбомотором 1.5T.",
      deliveryDays: 38,
    },
    {
      sourceId: "ah-chery-tiggo8-2023",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "Chery",
      brandSlug: "chery",
      model: "Tiggo 8 Pro",
      year: 2023,
      type: "suv",
      priceCny: 129900,
      photos: ["https://images.unsplash.com/photo-1519641471654-76cefc7c8dec?w=800&q=80"],
      specs: {
        engine: "2.0 L",
        power: "254 л.с.",
        transmission: "Автомат",
        drive: "Полный",
        fuel: "Бензин",
        consumption: "8.5 л/100 км",
      },
      descriptionRu: "Chery Tiggo 8 Pro — семиместный SUV с просторным салоном.",
      deliveryDays: 42,
    },
    {
      sourceId: "ah-haval-h6-2024",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "Haval",
      brandSlug: "haval",
      model: "H6",
      year: 2024,
      type: "crossover",
      priceCny: 112800,
      photos: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80"],
      specs: {
        engine: "2.0 L",
        power: "211 л.с.",
        transmission: "Робот",
        drive: "Полный",
        fuel: "Бензин",
        consumption: "7.9 л/100 км",
      },
      descriptionRu: "Haval H6 — один из самых продаваемых кроссоверов в Китае.",
      deliveryDays: 40,
    },
    {
      sourceId: "ah-changan-uni-v-2024",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "Changan",
      brandSlug: "changan",
      model: "UNI-V",
      year: 2024,
      type: "sedan",
      priceCny: 108900,
      photos: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80"],
      specs: {
        engine: "1.5 L",
        power: "188 л.с.",
        transmission: "Автомат",
        drive: "Передний",
        fuel: "Бензин",
        consumption: "6.5 л/100 км",
      },
      descriptionRu: "Changan UNI-V — фастбек-седан с агрессивным дизайном.",
      deliveryDays: 37,
    },
    {
      sourceId: "ah-li-l7-2024",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "Li Auto",
      brandSlug: "li-auto",
      model: "L7",
      year: 2024,
      type: "suv",
      priceCny: 319800,
      photos: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80"],
      specs: {
        engine: "1.5 L",
        power: "449 л.с.",
        transmission: "Автомат",
        drive: "Полный",
        fuel: "Гибрид",
        consumption: "7.8 л/100 км",
      },
      descriptionRu: "Li Auto L7 — премиальный EREV-SUV с большим пробегом на электротяге.",
      deliveryDays: 45,
    },
    {
      sourceId: "ah-zeekr-001-2024",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "Zeekr",
      brandSlug: "zeekr",
      model: "001",
      year: 2024,
      type: "crossover",
      priceCny: 269000,
      photos: ["https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80"],
      specs: {
        engine: "Электро",
        power: "544 л.с.",
        transmission: "Автомат",
        drive: "Полный",
        fuel: "Электро",
        consumption: "16.8 kWh/100 км",
      },
      descriptionRu: "Zeekr 001 — электрошутинг-брейк премиум-класса от Geely.",
      deliveryDays: 43,
    },
    {
      sourceId: "ah-hongqi-h9-2023",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "Hongqi",
      brandSlug: "hongqi",
      model: "H9",
      year: 2023,
      type: "sedan",
      priceCny: 309800,
      photos: ["https://images.unsplash.com/photo-1583121274602-3e2820c50efe?w=800&q=80"],
      specs: {
        engine: "2.0 L",
        power: "252 л.с.",
        transmission: "Автомат",
        drive: "Задний",
        fuel: "Бензин",
        consumption: "8.0 л/100 км",
      },
      descriptionRu: "Hongqi H9 — представительский седан китайского премиум-бренда.",
      deliveryDays: 44,
    },
    {
      sourceId: "ah-gac-aion-y-2024",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "GAC Aion",
      brandSlug: "gac-aion",
      model: "Y Plus",
      year: 2024,
      type: "crossover",
      priceCny: 119800,
      photos: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80"],
      specs: {
        engine: "Электро",
        power: "204 л.с.",
        transmission: "Автомат",
        drive: "Передний",
        fuel: "Электро",
        consumption: "13.1 kWh/100 км",
      },
      descriptionRu: "GAC Aion Y Plus — доступный семейный электрокроссовер.",
      deliveryDays: 38,
    },
    {
      sourceId: "ah-wuling-bingo-2024",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "Wuling",
      brandSlug: "wuling",
      model: "Bingo",
      year: 2024,
      type: "hatchback",
      priceCny: 59800,
      photos: ["https://images.unsplash.com/photo-1541899481282-d53bffe2c00d?w=800&q=80"],
      specs: {
        engine: "Электро",
        power: "68 л.с.",
        transmission: "Автомат",
        drive: "Передний",
        fuel: "Электро",
        consumption: "10.2 kWh/100 км",
      },
      descriptionRu: "Wuling Bingo — компактный городской электромобиль по доступной цене.",
      deliveryDays: 35,
    },
    {
      sourceId: "ah-tank-300-2024",
      sourceUrl: "https://www.autohome.com.cn/",
      brand: "Tank",
      brandSlug: "tank",
      model: "300",
      year: 2024,
      type: "suv",
      priceCny: 199800,
      photos: ["https://images.unsplash.com/photo-1533473353711-1ab7sdf1cb88?w=800&q=80"],
      specs: {
        engine: "2.0 L",
        power: "227 л.с.",
        transmission: "Автомат",
        drive: "Полный",
        fuel: "Бензин",
        consumption: "9.5 л/100 км",
      },
      descriptionRu: "Tank 300 — рамный внедорожник в стиле классических SUV.",
      deliveryDays: 41,
    },
  ];
}

export async function mapAutohomeToCatalog(raw: AutohomeRawCar, exchangeRate: VtbExchangeRate): Promise<Car> {
  const priceRub = convertCnyToRub(raw.priceCny, exchangeRate);
  const ageYears = Math.max(0, new Date().getFullYear() - raw.year);
  const customs = await calculateCustoms({
    priceRub,
    engineVolumeCc: parseEngineVolumeCc(raw.specs.engine),
    ageYears,
  });
  return {
    id: raw.sourceId,
    brand: raw.brand,
    brandSlug: raw.brandSlug,
    model: raw.model,
    year: raw.year,
    type: raw.type,
    price: priceRub,
    customsCost: customs.totalRub,
    deliveryDays: raw.deliveryDays ?? 45,
    country: "Китай",
    imageColor: "#1a3a5c",
    specs: raw.specs,
    description: raw.descriptionRu,
    sync: {
      source: "autohome",
      sourceId: raw.sourceId,
      sourceUrl: raw.sourceUrl,
      photos: raw.photos,
      priceCny: raw.priceCny,
      exchangeRate: exchangeRate.sellRate,
      exchangeBank: "VTB",
      exchangeRateAt: exchangeRate.fetchedAt,
      customsSource: "tks.ru",
      syncedAt: new Date().toISOString(),
    },
  };
}
