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

const catalog = mergeCatalogs(autohomeDemoCars, staticCars);
const outDir = path.join(process.cwd(), "data");
const outFile = path.join(outDir, "cars.catalog.json");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(catalog, null, 2), "utf-8");
console.log(`Exported ${catalog.length} cars -> ${outFile}`);
