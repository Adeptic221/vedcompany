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

export async function fetchAutohomeCatalog(): Promise<AutohomeRawCar[]> {
  const apiKey = process.env.AUTOHOME_API_KEY;
  const apiUrl = process.env.AUTOHOME_API_URL;
  if (apiKey && apiUrl) {
    try {
      const res = await fetch(apiUrl + "?source=autohome&limit=50", { headers: { Authorization: "Bearer " + apiKey } });
      if (res.ok) {
        const data = await res.json() as { results?: AutohomeRawCar[] };
        if (data.results?.length) return data.results;
      }
    } catch (e) { console.error("[autohome]", e); }
  }
  return [
    { sourceId: "ah-byd-han-2024", sourceUrl: "https://www.autohome.com.cn/", brand: "BYD", brandSlug: "byd", model: "Han", year: 2024, type: "sedan", priceCny: 189800, photos: ["https://images.unsplash.com/photo-1619767886552-efdc259cde1a?w=800&q=80"], specs: { engine: "2.0 L", power: "245 \u043b.\u0441.", transmission: "\u0410\u0432\u0442\u043e\u043c\u0430\u0442", drive: "\u041f\u0435\u0440\u0435\u0434\u043d\u0438\u0439", fuel: "\u0413\u0438\u0431\u0440\u0438\u0434", consumption: "4.2 \u043b/100 \u043a\u043c" }, descriptionRu: "BYD Han \u2014 \u043f\u0440\u0435\u043c\u0438\u0430\u043b\u044c\u043d\u044b\u0439 \u0441\u0435\u0434\u0430\u043d \u0438\u0437 \u041a\u0438\u0442\u0430\u044f.", deliveryDays: 40 },
    { sourceId: "ah-geely-coolray-2024", sourceUrl: "https://www.autohome.com.cn/", brand: "Geely", brandSlug: "geely", model: "Coolray", year: 2024, type: "crossover", priceCny: 95800, photos: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80"], specs: { engine: "1.5 L", power: "177 \u043b.\u0441.", transmission: "\u0420\u043e\u0431\u043e\u0442", drive: "\u041f\u0435\u0440\u0435\u0434\u043d\u0438\u0439", fuel: "\u0411\u0435\u043d\u0437\u0438\u043d", consumption: "6.2 \u043b/100 \u043a\u043c" }, descriptionRu: "Geely Coolray \u2014 \u043a\u043e\u043c\u043f\u0430\u043a\u0442\u043d\u044b\u0439 \u043a\u0440\u043e\u0441\u0441\u043e\u0432\u0435\u0440.", deliveryDays: 38 },
    { sourceId: "ah-chery-tiggo8-2023", sourceUrl: "https://www.autohome.com.cn/", brand: "Chery", brandSlug: "chery", model: "Tiggo 8 Pro", year: 2023, type: "suv", priceCny: 129900, photos: ["https://images.unsplash.com/photo-1519641471654-76cefc7c8dec?w=800&q=80"], specs: { engine: "2.0 L", power: "254 \u043b.\u0441.", transmission: "\u0410\u0432\u0442\u043e\u043c\u0430\u0442", drive: "\u041f\u043e\u043b\u043d\u044b\u0439", fuel: "\u0411\u0435\u043d\u0437\u0438\u043d", consumption: "8.5 \u043b/100 \u043a\u043c" }, descriptionRu: "Chery Tiggo 8 Pro \u2014 \u0441\u0435\u043c\u0438\u043c\u0435\u0441\u0442\u043d\u044b\u0439 SUV.", deliveryDays: 42 },
  ];
}

export async function mapAutohomeToCatalog(raw: AutohomeRawCar, exchangeRate: VtbExchangeRate): Promise<Car> {
  const priceRub = convertCnyToRub(raw.priceCny, exchangeRate);
  const ageYears = Math.max(0, new Date().getFullYear() - raw.year);
  const customs = await calculateCustoms({ priceRub, engineVolumeCc: parseEngineVolumeCc(raw.specs.engine), ageYears });
  return {
    id: raw.sourceId, brand: raw.brand, brandSlug: raw.brandSlug, model: raw.model, year: raw.year, type: raw.type,
    price: priceRub, customsCost: customs.totalRub, deliveryDays: raw.deliveryDays ?? 45, country: "\u041a\u0438\u0442\u0430\u0439", imageColor: "#1a3a5c",
    specs: raw.specs, description: raw.descriptionRu,
    sync: { source: "autohome", sourceId: raw.sourceId, sourceUrl: raw.sourceUrl, photos: raw.photos, priceCny: raw.priceCny, exchangeRate: exchangeRate.sellRate, exchangeBank: "VTB", exchangeRateAt: exchangeRate.fetchedAt, customsSource: "tks.ru", syncedAt: new Date().toISOString() },
  };
}