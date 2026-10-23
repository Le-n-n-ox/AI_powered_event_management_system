/**
 * Kenyan phone number handling.
 *
 * Attendees text the help desk from a handset, so the number has to end up in
 * E.164 (+254XXXXXXXXX) for Africa's Talking to route the SMS. Organizers
 * typing "0712345678" and attendees typing "+254 712 345 678" must resolve to
 * the same subscriber, otherwise the assistant tells someone they are not
 * registered when they are.
 */

/** Strip spaces, dashes, brackets and a leading "tel:" prefix. */
export function normalisePhone(phone: string): string {
  return phone.trim().replace(/^tel:/i, "").replace(/[\s\-().]/g, "");
}

/** Convert any accepted Kenyan format to E.164. Returns "" if unrecognised. */
export function formatPhoneNumber(phone: string): string {
  const clean = normalisePhone(phone);
  if (!clean) return "";

  if (clean.startsWith("+254")) return `+${clean.slice(1).replace(/\D/g, "")}`;
  if (clean.startsWith("00254")) return `+${clean.slice(4).replace(/\D/g, "")}`;
  if (clean.startsWith("254")) return `+${clean.replace(/\D/g, "")}`;

  // Local Kenyan formats: 07XXXXXXXX, 01XXXXXXXX, 0712345678
  if (/^0[17]\d{8}$/.test(clean)) return `+254${clean.slice(1)}`;

  // Already a bare subscriber number (712345678) with no trunk prefix.
  if (/^[17]\d{8}$/.test(clean)) return `+254${clean}`;

  return clean;
}

/**
 * True when the number can receive an SMS: a valid Kenyan mobile, or an
 * E.164 number with a plausible country code and length.
 */
export function isValidPhone(phone: string): boolean {
  const e164 = formatPhoneNumber(phone);
  if (!e164) return false;
  if (!/^\+\d{10,15}$/.test(e164)) return false;
  // Kenyan mobile numbers are Safaricom (07xx) or Airtel (01xx) prefixed.
  return /^254(7|1)\d{8}$/.test(e164.slice(1)) || !e164.startsWith("+254");
}

/** "+254 712 345 678" — for display, not for storage. */
export function formatPhoneForDisplay(phone: string): string {
  const e164 = formatPhoneNumber(phone);
  if (e164.startsWith("+254") && e164.length === 13) {
    return `+254 ${e164.slice(4, 7)} ${e164.slice(7, 10)} ${e164.slice(10)}`;
  }
  return phone;
}

/** A masked number for privacy: "+254 712 ••• 678". */
export function maskPhone(phone: string): string {
  const e164 = formatPhoneNumber(phone);
  if (e164.length < 6) return phone;
  return `${e164.slice(0, 6)} ••• ${e164.slice(-3)}`;
}
