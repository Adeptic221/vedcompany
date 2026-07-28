export interface CustomsInput { priceRub: number; engineVolumeCc: number; ageYears: number; }
export interface CustomsResult { totalRub: number; breakdown: { duty: number; vat: number; recyclingFee: number }; source: "tks.ru" | "estimate"; }

export async function calculateCustoms(input: CustomsInput): Promise<CustomsResult> {
  const { priceRub, engineVolumeCc, ageYears } = input;
  const ageFactor = ageYears <= 3 ? 1.2 : ageYears <= 5 ? 1.0 : 0.85;
  const volumeFactor = engineVolumeCc / 2000;
  const duty = Math.round(priceRub * 0.15 * ageFactor * volumeFactor);
  const vat = Math.round((priceRub + duty) * 0.2);
  const recyclingFee = ageYears <= 3 ? 5200 : 2600;
  return { totalRub: duty + vat + recyclingFee, breakdown: { duty, vat, recyclingFee }, source: "estimate" };
}

export function parseEngineVolumeCc(engineStr: string): number {
  const match = engineStr.match(/([\d.]+)\s*[lL]/);
  if (match) return Math.round(parseFloat(match[1]) * 1000);
  return 2000;
}