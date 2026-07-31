import type { Car, CarType } from "@/types/car";

export const CAR_TYPES: CarType[] = ["sedan", "crossover", "suv", "hatchback", "coupe"];

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "car"
  );
}

export interface CarFormInput {
  id?: string;
  brand: string;
  brandSlug?: string;
  model: string;
  year: number;
  type: CarType;
  price: number;
  customsCost: number;
  deliveryDays: number;
  country: string;
  imageColor?: string;
  description: string;
  photoUrl?: string;
  engine?: string;
  power?: string;
  transmission?: string;
  drive?: string;
  fuel?: string;
  consumption?: string;
}

export function buildCarFromForm(input: CarFormInput, existing?: Car | null): Car {
  const brand = input.brand.trim();
  const model = input.model.trim();
  const brandSlug = (input.brandSlug || slugify(brand)).trim() || slugify(brand);
  const year = Number(input.year);
  const id = (
    input.id ||
    existing?.id ||
    `admin-${brandSlug}-${slugify(model)}-${year}`
  ).trim();
  const photoUrl = (input.photoUrl || "").trim();
  const photos = photoUrl
    ? [photoUrl]
    : existing?.sync?.photos?.length
      ? existing.sync.photos
      : [];

  return {
    id,
    brand,
    brandSlug,
    model,
    year,
    type: input.type,
    price: Number(input.price) || 0,
    customsCost: Number(input.customsCost) || 0,
    deliveryDays: Number(input.deliveryDays) || 45,
    country: input.country.trim() || "China",
    imageColor: input.imageColor || existing?.imageColor || "#1a3a5c",
    description: input.description.trim() || `${brand} ${model} ${year}`,
    specs: {
      engine: input.engine?.trim() || existing?.specs.engine || "-",
      power: input.power?.trim() || existing?.specs.power || "-",
      transmission:
        input.transmission?.trim() || existing?.specs.transmission || "Auto",
      drive: input.drive?.trim() || existing?.specs.drive || "FWD",
      fuel: input.fuel?.trim() || existing?.specs.fuel || "Petrol",
      consumption:
        input.consumption?.trim() || existing?.specs.consumption || "-",
    },
    sync: photos.length
      ? {
          source: "autohome",
          sourceId: id,
          sourceUrl: existing?.sync?.sourceUrl || "https://vedcompany.ru",
          photos,
          priceCny: existing?.sync?.priceCny || 0,
          exchangeRate: existing?.sync?.exchangeRate || 12.5,
          exchangeBank: "VTB",
          exchangeRateAt:
            existing?.sync?.exchangeRateAt || new Date().toISOString(),
          customsSource: "tks.ru",
          syncedAt: new Date().toISOString(),
        }
      : existing?.sync,
  };
}
