import { promises as fs } from "fs";
import path from "path";
import type { Car, SyncLogEntry } from "@/types/car";
import { cars as fallbackCars } from "@/data/cars.static";

const isVercel = process.env.VERCEL === "1";
const DATA_DIR = isVercel ? path.join("/tmp", "ved-data") : path.join(process.cwd(), "data");
const CARS_FILE = path.join(DATA_DIR, "cars.catalog.json");
const SYNC_LOG_FILE = path.join(DATA_DIR, "sync-log.json");

export async function getCarsCatalog(): Promise<Car[]> {
  try {
    const raw = await fs.readFile(CARS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Car[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch { }
  return fallbackCars;
}

export async function saveCarsCatalog(cars: Car[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CARS_FILE, JSON.stringify(cars, null, 2), "utf-8");
  } catch (e) {
    console.warn("[cars-store] save skipped:", e);
  }
}

export async function appendSyncLog(entry: SyncLogEntry): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let logs: SyncLogEntry[] = [];
    try { logs = JSON.parse(await fs.readFile(SYNC_LOG_FILE, "utf-8")) as SyncLogEntry[]; } catch { }
    logs.unshift(entry);
    await fs.writeFile(SYNC_LOG_FILE, JSON.stringify(logs.slice(0, 50), null, 2), "utf-8");
  } catch (e) {
    console.warn("[cars-store] log skipped:", e);
  }
}