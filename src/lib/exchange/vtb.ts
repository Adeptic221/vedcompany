import type { VtbExchangeRate } from "@/types/sync";

export async function fetchVtbCnyRate(): Promise<VtbExchangeRate> {
  const manual = process.env.VTB_RATE_CNY;
  if (manual) {
    const rate = parseFloat(manual);
    if (!Number.isNaN(rate) && rate > 0) {
      return { bank: "VTB", currency: "CNY", sellRate: rate, fetchedAt: new Date().toISOString(), source: "manual" };
    }
  }
  try {
    const res = await fetch("https://www.cbr-xml-daily.ru/daily_json.js", { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json() as { Valute?: { CNY?: { Value?: number; Nominal?: number } } };
      const cny = data.Valute?.CNY;
      if (cny?.Value && cny.Nominal) {
        const cbrRate = cny.Value / cny.Nominal;
        // Working rate: CBR + 1.5% buffer (not shown as a separate line to the client).
        return {
          bank: "VTB",
          currency: "CNY",
          sellRate: Math.round(cbrRate * 1.015 * 100) / 100,
          fetchedAt: new Date().toISOString(),
          source: "cbr-fallback",
        };
      }
    }
  } catch { }
  return { bank: "VTB", currency: "CNY", sellRate: 12.5, fetchedAt: new Date().toISOString(), source: "manual" };
}

export function convertCnyToRub(amountCny: number, rate: VtbExchangeRate): number {
  return Math.round(amountCny * rate.sellRate);
}