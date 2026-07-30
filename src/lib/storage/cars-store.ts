import { promises as fs } from "fs";
import path from "path";
import type { Car, SyncLogEntry } from "@/types/car";
import { cars as staticCars } from "@/data/cars.static";
import { autohomeDemoCars } from "@/data/cars.autohome-demo";

/** Serverless (Netlify/Vercel functions): ephemeral /tmp only */
const isServerless = Boolean(
  process.env.VERCEL === "1" ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY === "1"
);

const DATA_DIR = isServerless
  ? path.join("/tmp", "ved-data")
  : path.join(process.cwd(), "data");

const CARS_FILE = path.join(DATA_DIR, "cars.catalog.json");
const COMMITTED_CATALOG = path.join(process.cwd(), "data", "cars.catalog.json");
const SYNC_LOG_FILE = path.join(DATA_DIR, "sync-log.json");

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function mergeCatalogs(...sources: Car[][]): Car[] {
  const byId = new Map<string, Car>();
  for (const source of sources) {
    for (const car of source) {
      byId.set(car.id, car);
    }
  }
  return Array.from(byId.values());
}

function getDefaultCatalog(): Car[] {
  return mergeCatalogs(autohomeDemoCars, staticCars);
}

export async function getCarsCatalog(): Promise<Car[]> {
  const runtime = await readJsonFile<Car[]>(CARS_FILE);
  if (Array.isArray(runtime) && runtime.length > 0) return runtime;

  const committed = await readJsonFile<Car[]>(COMMITTED_CATALOG);
  if (Array.isArray(committed) && committed.length > 0) return committed;

  return getDefaultCatalog();
}

export async function saveCarsCatalog(cars: Car[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CARS_FILE, JSON.stringify(cars, null, 2), "utf-8");

    if (!isServerless) {
      await fs.mkdir(path.dirname(COMMITTED_CATALOG), { recursive: true });
      await fs.writeFile(COMMITTED_CATALOG, JSON.stringify(cars, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn("[cars-store] save skipped:", e);
  }
}

export async function appendSyncLog(entry: SyncLogEntry): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let logs: SyncLogEntry[] = [];
    const existing = await readJsonFile<SyncLogEntry[]>(SYNC_LOG_FILE);
    if (existing) logs = existing;
    logs.unshift(entry);
    await fs.writeFile(SYNC_LOG_FILE, JSON.stringify(logs.slice(0, 50), null, 2), "utf-8");
  } catch (e) {
    console.warn("[cars-store] log skipped:", e);
  }
}

export function getCarsStorageInfo() {
  return {
    isServerless,
    dataDir: DATA_DIR,
    carsFile: CARS_FILE,
    committedCatalog: COMMITTED_CATALOG,
  };
}
