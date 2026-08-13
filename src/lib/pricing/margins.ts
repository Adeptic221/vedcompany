/** Client pricing: VED fee is a separate "services" line, never baked into CNY. */
export const CBR_RATE_BUFFER = 0.015; // +1.5% over CBR (in working rate)

/**
 * Flat 13% of car cost (before customs) for now.
 *
 * TODO(pricing-tiers): later replace with brackets for expensive cars, e.g.
 * - up to ~3M: 13%
 * - 3–6M: lower %
 * - from ~6–7M: lower % or fee cap
 * Keep client label as "Услуги VED" (never show as margin/profit).
 */
export const VED_SERVICES_RATE = 0.13;

/** @deprecated Use VED_SERVICES_RATE / getVedServicesFee */
export const PROFIT_MARGIN_BEFORE_CUSTOMS = VED_SERVICES_RATE;

/** VED services fee in RUB from car cost (before customs). */
export function getVedServicesFeeFromCost(carCostRub: number): number {
  return Math.round(carCostRub * VED_SERVICES_RATE);
}

/** Working FX rate: CBR * (1 + buffer). */
export function applyCbrBuffer(cbrRate: number): number {
  return Math.round(cbrRate * (1 + CBR_RATE_BUFFER) * 100) / 100;
}
