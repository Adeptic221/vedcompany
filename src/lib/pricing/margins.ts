/** Client-facing pricing rules (margin is not shown as a separate line). */
export const CBR_RATE_BUFFER = 0.015; // +1.5% over CBR
export const PROFIT_MARGIN_BEFORE_CUSTOMS = 0.13; // +13% on car cost before customs

/** Apply hidden VED margin to the car RUB cost (before customs). */
export function applyProfitBeforeCustoms(carCostRub: number): number {
  return Math.round(carCostRub * (1 + PROFIT_MARGIN_BEFORE_CUSTOMS));
}

/** Working FX rate: CBR * (1 + buffer). */
export function applyCbrBuffer(cbrRate: number): number {
  return Math.round(cbrRate * (1 + CBR_RATE_BUFFER) * 100) / 100;
}
