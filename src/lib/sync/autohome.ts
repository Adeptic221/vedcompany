import type { Car, CarType } from "@/types/car";
import type { VtbExchangeRate } from "@/types/sync";
import { autohomeDemoCars } from "@/data/cars.autohome-demo";
import { convertCnyToRub } from "@/lib/exchange/vtb";
import { calculateCustoms, parseEngineVolumeCc } from "@/lib/customs/calculate";
import { isChinaBrandSlug, isChinaCountry } from "@/lib/catalog/china";

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
  country?: string;
}

function countryForBrandSlug(slug: string): string {
  if (["toyota", "lexus", "honda", "nissan", "mazda", "subaru"].includes(slug)) return "Japan";
  if (["hyundai", "kia", "genesis"].includes(slug)) return "Korea";
  if (slug === "volvo") return "Sweden";
  if (slug === "skoda") return "Czech Republic";
  if (slug === "land-rover") return "UK";
  if (slug === "tesla") return "USA";
  if (slug === "peugeot") return "France";
  if (["bmw", "mercedes", "audi", "porsche", "volkswagen"].includes(slug)) return "Germany";
  if (isChinaBrandSlug(slug)) return "China";
  return "Other";
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

const DEFAULT_LIMIT = 100;

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
  return autohomeDemoCars
    .filter((car) => !isChinaCountry(car.country) && !isChinaBrandSlug(car.brandSlug))
    .map((car) => ({
      sourceId: car.id,
      sourceUrl: car.sync?.sourceUrl ?? "https://www.autohome.com.cn/",
      brand: car.brand,
      brandSlug: car.brandSlug,
      model: car.model,
      year: car.year,
      type: car.type,
      priceCny: car.sync?.priceCny ?? Math.round(car.price / 12.5),
      photos: car.sync?.photos ?? [],
      specs: car.specs,
      descriptionRu: car.description,
      deliveryDays: car.deliveryDays,
      country: car.country,
    }));
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
    country: raw.country ?? countryForBrandSlug(raw.brandSlug),
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
