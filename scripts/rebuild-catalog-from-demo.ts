/**
 * Rebuild data/cars.catalog.json from autohomeDemoCars (non-China) with current customs math.
 * Usage: npx --yes tsx scripts/rebuild-catalog-from-demo.ts
 */
import fs from "fs";
import path from "path";
import { autohomeDemoCars } from "../src/data/cars.autohome-demo.ts";
import { withoutChinaCars } from "../src/lib/catalog/china.ts";

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "data", "cars.catalog.json");

const cars = withoutChinaCars(autohomeDemoCars).sort((a, b) => {
  if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
  if (a.model !== b.model) return a.model.localeCompare(b.model);
  return a.year - b.year;
});

const china = cars.filter(
  (c) =>
    /china|китай/i.test(c.country || "") ||
    ["byd", "geely", "chery", "haval", "changan"].includes(c.brandSlug)
);
const russia = cars.filter(
  (c) =>
    /russia|россия/i.test(c.country || "") ||
    ["lada", "vaz", "uaz", "gaz", "moskvich"].includes(c.brandSlug)
);

if (china.length) {
  console.error("China cars leaked:", china.map((c) => c.id));
  process.exit(1);
}
if (russia.length) {
  console.error("Russia cars leaked:", russia.map((c) => c.id));
  process.exit(1);
}

fs.writeFileSync(OUT, JSON.stringify(cars, null, 2) + "\n", "utf8");

const years: Record<number, number> = {};
const prices = cars.map((c) => c.price).sort((a, b) => a - b);
cars.forEach((c) => {
  years[c.year] = (years[c.year] || 0) + 1;
});

const cheapest = [...cars].sort((a, b) => a.price - b.price).slice(0, 8);

console.log(
  JSON.stringify(
    {
      count: cars.length,
      years,
      minPrice: prices[0],
      under1M: prices.filter((p) => p < 1_000_000).length,
      under1_2M: prices.filter((p) => p <= 1_200_000).length,
      sampleCustoms: cars
        .filter((c) => /rio|polo|solaris|rapid|corolla/i.test(c.model))
        .slice(0, 12)
        .map((c) => `${c.id} price=${c.price} customs=${c.customsCost}`),
      cheapest: cheapest.map((c) => `${c.brand} ${c.model} ${c.year} ${c.price}`),
    },
    null,
    2
  )
);
