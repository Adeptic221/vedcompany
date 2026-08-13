/** Client-facing pricing: 13% is baked into the yuan figure the client sees. */
export const CBR_RATE_BUFFER = 0.015; // +1.5% over CBR (in working rate, not a separate line)
export const PROFIT_MARGIN_BEFORE_CUSTOMS = 0.13; // +13% on car cost before customs

/** Inflate cost CNY so client CNY x rate = client RUB (no visible margin line). */
export function applyProfitToCny(costCny: number): number {
  return Math.round(costCny * (1 + PROFIT_MARGIN_BEFORE_CUSTOMS));
}

/** @deprecated Prefer applyProfitToCny + rate; kept for cars without sync meta. */
export function applyProfitBeforeCustoms(carCostRub: number): number {
  return Math.round(carCostRub * (1 + PROFIT_MARGIN_BEFORE_CUSTOMS));
}

/** Working FX rate: CBR * (1 + buffer). */
export function applyCbrBuffer(cbrRate: number): number {
  return Math.round(cbrRate * (1 + CBR_RATE_BUFFER) * 100) / 100;
}
