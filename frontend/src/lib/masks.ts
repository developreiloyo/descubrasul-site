/**
 * maskPhone: formats to (XX) XXXXX-XXXX or (XX) XXXX-XXXX
 * Accepts DDD + number only — no country code prefix displayed.
 * Strips non-digits and limits to 11 digits max.
 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Extracts raw digits from a masked phone — use before sending to API. */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * maskCep: formats to XXXXX-XXX
 */
export function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
