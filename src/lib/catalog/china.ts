import type { Car } from "@/types/car";
import { isRussiaCar } from "@/lib/catalog/russia";

const CHINA_BRAND_SLUGS = new Set([
  "byd",
  "geely",
  "chery",
  "haval",
  "changan",
  "zeekr",
  "nio",
  "xpeng",
  "li-auto",
  "li",
  "hongqi",
  "great-wall",
  "gwm",
  "lynk-co",
  "ora",
  "tank",
  "aito",
  "denza",
  "wuling",
  "jetour",
  "voyah",
  "avatr",
  "xiaomi",
  "dongfeng",
  "faw",
  "saic",
  "mg",
  "maxus",
  "exeed",
  "omoda",
  "jaecoo",
  "leapmotor",
  "seres",
  "hiphi",
  "im",
  "rising",
  "deepal",
  "galaxy",
  "geometry",
  "wey",
  "baic",
  "roewe",
  "neta",
  "fangchengbao",
  "trumpchi",
  "gac-aion",
]);

export function isChinaCountry(country: string | undefined | null): boolean {
  if (!country) return false;
  const normalized = country.trim().toLowerCase();
  return (
    normalized === "china" ||
    normalized === "китай" ||
    normalized.includes("china") ||
    normalized.includes("китай")
  );
}

export function isChinaBrandSlug(brandSlug: string | undefined | null): boolean {
  if (!brandSlug) return false;
  return CHINA_BRAND_SLUGS.has(brandSlug.trim().toLowerCase());
}

export function isChinaCar(car: Pick<Car, "country" | "brandSlug">): boolean {
  return isChinaCountry(car.country) || isChinaBrandSlug(car.brandSlug);
}

export function withoutChinaCars<T extends Pick<Car, "country" | "brandSlug">>(cars: T[]): T[] {
  // Also drop Russian domestic brands — catalog is import-only (no China, no Russia).
  return cars.filter((car) => !isChinaCar(car) && !isRussiaCar(car));
}
