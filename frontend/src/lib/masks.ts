/**
 * maskPhone: formats to +55 (XX) XXXXX-XXXX
 * Strips non-digits, removes leading 55 country code if already present,
 * then rebuilds with mask up to 11 digits (DDD + 9-digit or 8-digit number).
 */
export function maskPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  // Drop leading country code 55 only if we have more than 11 digits
  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `+55 (${digits}`;
  if (digits.length <= 7) return `+55 (${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * maskCep: formats to XXXXX-XXX
 */
export function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
