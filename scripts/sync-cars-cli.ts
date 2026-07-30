import fs from "fs";
import path from "path";
import { runWeeklyCarSync } from "../src/lib/sync/run-sync.ts";
import { getCarsCatalog, getCarsStorageInfo } from "../src/lib/storage/cars-store.ts";

function loadEnvFile(relativePath: string) {
  const fullPath = path.join(process.cwd(), relativePath);
  if (!fs.existsSync(fullPath)) return;
  for (const line of fs.readFileSync(fullPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

async function main() {
  const result = await runWeeklyCarSync();
  const cars = await getCarsCatalog();
  const storage = getCarsStorageInfo();
  console.log(JSON.stringify({ ...result, count: cars.length, storage }, null, 2));
  process.exit(result.success ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
