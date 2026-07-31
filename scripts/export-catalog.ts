import fs from "fs";
import path from "path";
import type { Car } from "../src/types/car";
import { autohomeDemoCars } from "../src/data/cars.autohome-demo";
import { cars as staticCars } from "../src/data/cars.static";

function mergeCatalogs(...sources: Car[][]): Car[] {
  const byId = new Map<string, Car>();
  for (const source of sources) {
    for (const car of source) {
      byId.set(car.id, car);
    }
  }
  return Array.from(byId.values());
}

const outDir = path.join(process.cwd(), "data");
const outFile = path.join(outDir, "cars.catalog.json");

if (fs.existsSync(outFile)) {
  try {
    const existing = JSON.parse(fs.readFileSync(outFile, "utf8"));
    if (Array.isArray(existing) && existing.length > 0) {
      // KEEP existing catalog (admin/GitHub/sync) - do not wipe on build.
      console.log(`Keeping existing catalog (${existing.length} cars) -> ${outFile}`);
      process.exit(0);
    }
  } catch {
    // fall through and regenerate
  }
}

const catalog = mergeCatalogs(autohomeDemoCars, staticCars);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(catalog, null, 2), "utf-8");
console.log(`Exported ${catalog.length} cars -> ${outFile}`);
