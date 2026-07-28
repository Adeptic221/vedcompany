import { fetchAutohomeCatalog, mapAutohomeToCatalog } from "@/lib/sync/autohome";
import { fetchVtbCnyRate } from "@/lib/exchange/vtb";
import { getCarsCatalog, saveCarsCatalog, appendSyncLog } from "@/lib/storage/cars-store";

export async function runWeeklyCarSync() {
  const startedAt = new Date().toISOString();
  let exchangeRate = 0;
  try {
    const rate = await fetchVtbCnyRate();
    exchangeRate = rate.sellRate;
    const rawCars = await fetchAutohomeCatalog();
    const mapped = await Promise.all(rawCars.map((r) => mapAutohomeToCatalog(r, rate)));
    const existing = await getCarsCatalog();
    const newIds = new Set(mapped.map((c) => c.id));
    const kept = existing.filter((c) => !newIds.has(c.id) && !c.sync);
    await saveCarsCatalog([...mapped, ...kept]);
    await appendSyncLog({ startedAt, finishedAt: new Date().toISOString(), success: true, carsUpdated: mapped.length, exchangeRate });
    return { success: true, carsUpdated: mapped.length, exchangeRate };
  } catch (e) {
    const error = e instanceof Error ? e.message : "sync error";
    await appendSyncLog({ startedAt, finishedAt: new Date().toISOString(), success: false, carsUpdated: 0, exchangeRate, error });
    return { success: false, carsUpdated: 0, exchangeRate, error };
  }
}