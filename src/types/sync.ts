export interface VtbExchangeRate {
  bank: "VTB";
  currency: "CNY";
  sellRate: number;
  fetchedAt: string;
  source: "manual" | "cbr-fallback" | "vtb-api";
}