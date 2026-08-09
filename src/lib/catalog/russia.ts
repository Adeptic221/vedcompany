import type { Car } from "@/types/car";

const RUSSIA_BRAND_SLUGS = new Set([
  "lada",
  "vaz",
  "avtovaz",
  "uaz",
  "gaz",
  "moskvich",
  "aurus",
  "evolute",
  "tenet",
]);

export function isRussiaCountry(country: string | undefined | null): boolean {
  if (!country) return false;
  const normalized = country.trim().toLowerCase();
  return (
    normalized === "russia" ||
    normalized === "россия" ||
    normalized.includes("russia") ||
    normalized.includes("россия")
  );
}

export function isRussiaBrandSlug(brandSlug: string | undefined | null): boolean {
  if (!brandSlug) return false;
  return RUSSIA_BRAND_SLUGS.has(brandSlug.trim().toLowerCase());
}

export function isRussiaCar(car: Pick<Car, "country" | "brandSlug">): boolean {
  return isRussiaCountry(car.country) || isRussiaBrandSlug(car.brandSlug);
}

export function withoutRussiaCars<T extends Pick<Car, "country" | "brandSlug">>(
  cars: T[]
): T[] {
  return cars.filter((car) => !isRussiaCar(car));
}