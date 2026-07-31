import { promises as fs } from "fs";
import path from "path";
import type { Car, SyncLogEntry } from "@/types/car";
import { cars as staticCars } from "@/data/cars.static";
import { autohomeDemoCars } from "@/data/cars.autohome-demo";
import {
  fetchCatalogFromGithub,
  isGithubCatalogEnabled,
  pushCatalogToGithub,
} from "@/lib/storage/github-catalog";

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

type MemoryCatalog = {
  cars: Car[];
  fetchedAt: number;
};

let memoryCatalog: MemoryCatalog | null = null;
const MEMORY_TTL_MS = 30_000;

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

async function writeLocalCatalog(cars: Car[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CARS_FILE, JSON.stringify(cars, null, 2), "utf-8");

  if (!isServerless) {
    await fs.mkdir(path.dirname(COMMITTED_CATALOG), { recursive: true });
    await fs.writeFile(COMMITTED_CATALOG, JSON.stringify(cars, null, 2), "utf-8");
  }
}

async function readLocalCatalog(): Promise<Car[] | null> {
  const runtime = await readJsonFile<Car[]>(CARS_FILE);
  if (Array.isArray(runtime) && runtime.length > 0) return runtime;

  const committed = await readJsonFile<Car[]>(COMMITTED_CATALOG);
  if (Array.isArray(committed) && committed.length > 0) return committed;

  return null;
}

export async function getCarsCatalog(): Promise<Car[]> {
  if (memoryCatalog && Date.now() - memoryCatalog.fetchedAt < MEMORY_TTL_MS) {
    return memoryCatalog.cars;
  }

  if (isGithubCatalogEnabled()) {
    try {
      const remote = await fetchCatalogFromGithub();
      if (remote && remote.cars.length > 0) {
        memoryCatalog = { cars: remote.cars, fetchedAt: Date.now() };
        try {
          await writeLocalCatalog(remote.cars);
        } catch {
          // Local cache is best-effort on serverless.
        }
        return remote.cars;
      }
    } catch (e) {
      console.warn("[cars-store] GitHub catalog read failed, falling back to disk:", e);
    }
  }

  const local = await readLocalCatalog();
  if (local) {
    memoryCatalog = { cars: local, fetchedAt: Date.now() };
    return local;
  }

  const fallback = getDefaultCatalog();
  memoryCatalog = { cars: fallback, fetchedAt: Date.now() };
  return fallback;
}

export async function saveCarsCatalog(cars: Car[]): Promise<void> {
  memoryCatalog = { cars, fetchedAt: Date.now() };

  let localError: unknown = null;
  try {
    await writeLocalCatalog(cars);
  } catch (e) {
    localError = e;
    console.warn("[cars-store] local save skipped:", e);
  }

  if (isGithubCatalogEnabled()) {
    await pushCatalogToGithub(
      cars,
      `chore(catalog): update cars.catalog.json via admin (${cars.length} cars)`
    );
    return;
  }

  if (isServerless) {
    console.warn(
      "[cars-store] serverless save is ephemeral; set GITHUB_TOKEN + GITHUB_OWNER + GITHUB_REPO for durable persistence"
    );
  }

  if (localError && !isServerless) {
    throw localError;
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
  const githubEnabled = isGithubCatalogEnabled();
  return {
    isServerless,
    githubEnabled,
    persistence: githubEnabled
      ? ("github" as const)
      : isServerless
        ? ("ephemeral" as const)
        : ("disk" as const),
    dataDir: DATA_DIR,
    carsFile: CARS_FILE,
    committedCatalog: COMMITTED_CATALOG,
  };
}

export async function getCarById(id: string): Promise<Car | null> {
  const cars = await getCarsCatalog();
  return cars.find((car) => car.id === id) ?? null;
}

export async function upsertCar(car: Car): Promise<Car> {
  const cars = await getCarsCatalog();
  const idx = cars.findIndex((c) => c.id === car.id);
  if (idx >= 0) cars[idx] = car;
  else cars.unshift(car);
  await saveCarsCatalog(cars);
  return car;
}

export async function deleteCarById(id: string): Promise<boolean> {
  const cars = await getCarsCatalog();
  const next = cars.filter((car) => car.id !== id);
  if (next.length === cars.length) return false;
  await saveCarsCatalog(next);
  return true;
}
