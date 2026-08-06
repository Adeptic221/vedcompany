/**
 * Estimate of Russian personal-import customs for passenger cars (физлицо),
 * aligned with EAEU Council Decision No. 107 (единые ставки) as published on tks.ru.
 *
 * Not legal advice — estimate for catalog / sync pricing.
 */

export type CustomsFuel = "Petrol" | "Diesel" | "Hybrid" | "Electric" | string;

export interface CustomsInput {
  priceRub: number;
  engineVolumeCc: number;
  ageYears: number;
  /** Fuel / powertrain; Electric uses STP-style estimate instead of единые ставки. */
  fuel?: CustomsFuel;
  /** Engine power in hp — used for recycling fee льготный threshold (≤160). */
  powerHp?: number;
  /** EUR→RUB rate; defaults to env or ~CB-style fallback. */
  euroRate?: number;
}

export interface CustomsBreakdown {
  /** Единая ставка (or EV duty). Includes customs clearance fee. */
  duty: number;
  /** Separate VAT — 0 under единые ставки; set for EV STP estimate. */
  vat: number;
  recyclingFee: number;
  clearanceFee: number;
}

export interface CustomsResult {
  totalRub: number;
  breakdown: CustomsBreakdown;
  source: "tks.ru" | "estimate";
}

const DEFAULT_EURO_RATE = 98;

/** Preferential recycling (физлицо, личное пользование): base 20_000 × 0.17 / 0.26. */
const RECYCLING_PREF_NEW = 3_400;
const RECYCLING_PREF_OLD = 5_200;
const RECYCLING_BASE = 20_000;
const RECYCLING_POWER_LIMIT_HP = 160;
const RECYCLING_VOLUME_LIMIT_CC = 3_000;
const RECYCLING_EV_POWER_LIMIT_HP = 80;

/**
 * Commercial M1 recycling coefficients (base × coeff), approximate 2026 schedule
 * by engine volume when льготный does not apply (>160 hp or volume >3L).
 */
const RECYCLING_COMMERCIAL: { maxCc: number; newCoeff: number; oldCoeff: number }[] = [
  { maxCc: 1000, newCoeff: 12.8, oldCoeff: 21.4 },
  { maxCc: 2000, newCoeff: 37.5, oldCoeff: 62.4 },
  { maxCc: 3000, newCoeff: 112.52, oldCoeff: 170.36 },
  { maxCc: 3500, newCoeff: 130.0, oldCoeff: 210.0 },
  { maxCc: Infinity, newCoeff: 150.0, oldCoeff: 250.0 },
];

/** Under-3y: value brackets in EUR → { percent, minEuroPerCc }. Decision 107. */
const UNDER3_BY_VALUE: { maxEuro: number; percent: number; minEurPerCc: number }[] = [
  { maxEuro: 8_500, percent: 0.54, minEurPerCc: 2.5 },
  { maxEuro: 16_700, percent: 0.48, minEurPerCc: 3.5 },
  { maxEuro: 42_300, percent: 0.48, minEurPerCc: 5.5 },
  { maxEuro: 84_500, percent: 0.48, minEurPerCc: 7.5 },
  { maxEuro: 169_000, percent: 0.48, minEurPerCc: 15 },
  { maxEuro: Infinity, percent: 0.48, minEurPerCc: 20 },
];

const AGE_3_TO_5_EUR_PER_CC: { maxCc: number; eurPerCc: number }[] = [
  { maxCc: 1000, eurPerCc: 1.5 },
  { maxCc: 1500, eurPerCc: 1.7 },
  { maxCc: 1800, eurPerCc: 2.5 },
  { maxCc: 2300, eurPerCc: 2.7 },
  { maxCc: 3000, eurPerCc: 3.0 },
  { maxCc: Infinity, eurPerCc: 3.6 },
];

const AGE_OVER_5_EUR_PER_CC: { maxCc: number; eurPerCc: number }[] = [
  { maxCc: 1000, eurPerCc: 3.0 },
  { maxCc: 1500, eurPerCc: 3.2 },
  { maxCc: 1800, eurPerCc: 3.5 },
  { maxCc: 2300, eurPerCc: 4.8 },
  { maxCc: 3000, eurPerCc: 5.0 },
  { maxCc: Infinity, eurPerCc: 5.7 },
];

function pickRate<T extends { maxCc: number }>(rows: T[], cc: number): T {
  return rows.find((r) => cc <= r.maxCc) ?? rows[rows.length - 1];
}

export function getEuroRate(explicit?: number): number {
  if (explicit != null && Number.isFinite(explicit) && explicit > 0) return explicit;
  const fromEnv = Number(
    process.env.NEXT_PUBLIC_EUR_RUB_RATE ?? process.env.EUR_RUB_RATE ?? ""
  );
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return DEFAULT_EURO_RATE;
}

/** Customs clearance fee (сборы за таможенные операции), RUB brackets. */
export function customsClearanceFee(priceRub: number): number {
  const p = Math.max(0, priceRub);
  if (p <= 200_000) return 775;
  if (p <= 450_000) return 1_550;
  if (p <= 1_200_000) return 3_100;
  if (p <= 2_700_000) return 8_530;
  if (p <= 4_200_000) return 12_000;
  if (p <= 5_500_000) return 15_500;
  if (p <= 7_000_000) return 20_000;
  if (p <= 8_000_000) return 23_000;
  if (p <= 9_000_000) return 25_000;
  if (p <= 10_000_000) return 27_000;
  return 30_000;
}

function isElectric(fuel?: CustomsFuel): boolean {
  return String(fuel || "").toLowerCase() === "electric";
}

export function calculateRecyclingFee(input: {
  ageYears: number;
  engineVolumeCc: number;
  powerHp?: number;
  fuel?: CustomsFuel;
}): number {
  const { ageYears, engineVolumeCc, powerHp, fuel } = input;
  const older = ageYears > 3;
  const cc = Math.max(0, engineVolumeCc || 0);
  const hp = powerHp != null && Number.isFinite(powerHp) ? powerHp : undefined;
  const ev = isElectric(fuel);

  const powerOk =
    hp == null
      ? true // unknown power: keep льготный for typical budget ICE estimates
      : ev
        ? hp <= RECYCLING_EV_POWER_LIMIT_HP
        : hp <= RECYCLING_POWER_LIMIT_HP;

  const volumeOk = ev || cc <= RECYCLING_VOLUME_LIMIT_CC;

  if (powerOk && volumeOk) {
    return older ? RECYCLING_PREF_OLD : RECYCLING_PREF_NEW;
  }

  const row = pickRate(RECYCLING_COMMERCIAL, ev ? 2000 : cc || 2000);
  const coeff = older ? row.oldCoeff : row.newCoeff;
  return Math.round(RECYCLING_BASE * coeff);
}

function unifiedDutyUnder3(
  priceRub: number,
  engineVolumeCc: number,
  euroRate: number
): number {
  const valueEuro = priceRub / euroRate;
  const bracket =
    UNDER3_BY_VALUE.find((b) => valueEuro <= b.maxEuro) ??
    UNDER3_BY_VALUE[UNDER3_BY_VALUE.length - 1];
  const adValorem = priceRub * bracket.percent;
  const specific = bracket.minEurPerCc * engineVolumeCc * euroRate;
  return Math.round(Math.max(adValorem, specific));
}

function unifiedDutyByCc(
  engineVolumeCc: number,
  euroRate: number,
  table: { maxCc: number; eurPerCc: number }[]
): number {
  const row = pickRate(table, engineVolumeCc);
  return Math.round(row.eurPerCc * engineVolumeCc * euroRate);
}

/**
 * EV (8703 80): единые ставки do not apply — STP-style estimate
 * (duty ~15% + VAT 20% on value+duty). Excise omitted without reliable kW table.
 */
function estimateElectricStp(priceRub: number): { duty: number; vat: number } {
  const duty = Math.round(priceRub * 0.15);
  const vat = Math.round((priceRub + duty) * 0.2);
  return { duty, vat };
}

export function estimateCustoms(input: CustomsInput): CustomsResult {
  const priceRub = Math.max(0, Number(input.priceRub) || 0);
  const ageYears = Math.max(0, Number(input.ageYears) || 0);
  const euroRate = getEuroRate(input.euroRate);
  const fuel = input.fuel;
  const clearanceFee = customsClearanceFee(priceRub);

  let duty = 0;
  let vat = 0;

  if (isElectric(fuel) || input.engineVolumeCc <= 0) {
    const stp = estimateElectricStp(priceRub);
    duty = stp.duty;
    vat = stp.vat;
  } else {
    const cc = Math.max(1, Math.round(input.engineVolumeCc));
    if (ageYears <= 3) {
      duty = unifiedDutyUnder3(priceRub, cc, euroRate);
    } else if (ageYears <= 5) {
      duty = unifiedDutyByCc(cc, euroRate, AGE_3_TO_5_EUR_PER_CC);
    } else {
      duty = unifiedDutyByCc(cc, euroRate, AGE_OVER_5_EUR_PER_CC);
    }
    vat = 0; // included in единая ставка
  }

  const recyclingFee = calculateRecyclingFee({
    ageYears,
    engineVolumeCc: input.engineVolumeCc,
    powerHp: input.powerHp,
    fuel,
  });

  const dutyWithClearance = duty + clearanceFee;
  const totalRub = dutyWithClearance + vat + recyclingFee;

  return {
    totalRub,
    breakdown: {
      duty: dutyWithClearance,
      vat,
      recyclingFee,
      clearanceFee,
    },
    source: "tks.ru",
  };
}

export async function calculateCustoms(input: CustomsInput): Promise<CustomsResult> {
  return estimateCustoms(input);
}

export function parseEngineVolumeCc(engineStr: string): number {
  const match = String(engineStr || "").match(/([\d.]+)\s*[lL]/);
  if (match) return Math.round(parseFloat(match[1]) * 1000);
  return 2000;
}

export function parsePowerHp(powerStr: string): number | undefined {
  const match = String(powerStr || "").match(/([\d.]+)\s*hp/i);
  if (!match) return undefined;
  const n = parseFloat(match[1]);
  return Number.isFinite(n) ? n : undefined;
}

export function carAgeYears(year: number, now = new Date()): number {
  return Math.max(0, now.getFullYear() - year);
}
