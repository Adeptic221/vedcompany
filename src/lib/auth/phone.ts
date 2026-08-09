/** Normalize RU phones to +7XXXXXXXXXX */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let n = digits;
  if (n.length === 11 && n.startsWith("8")) n = "7" + n.slice(1);
  if (n.length === 10 && n.startsWith("9")) n = "7" + n;
  if (n.length !== 11 || !n.startsWith("7")) return null;
  return `+${n}`;
}

export function isValidPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}

export function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `sms_${digits}@ved.local`;
}

export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length < 11) return phone;
  return `+${d.slice(0, 1)} (${d.slice(1, 4)}) ***-**-${d.slice(9)}`;
}