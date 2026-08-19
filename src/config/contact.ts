/**
 * Turning a seller's phone number into links you can actually press.
 *
 * Sellers type their number the way they would say it out loud — every number in the data today is
 * a bare nine-digit Georgian mobile like "557983764", with no country code and no punctuation.
 * wa.me and t.me both want digits only, in full international form, so the code has to be filled
 * in. `tel:` does not care and gets the raw string.
 */
const GEORGIA_COUNTRY_CODE = '995';

/**
 * Best-effort international form, or null when there is nothing to work with.
 *
 * The one guess made here is that a bare nine-digit number starting with 5 is a Georgian mobile,
 * which is what the format is. Anything already carrying a country code — written with a + or
 * long enough to start with 995 — is passed through untouched rather than re-prefixed. A number
 * in neither shape goes as typed: a link that finds nobody is better than one confidently
 * pointing at a stranger.
 */
export function toInternationalPhone(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;

  if (trimmed.startsWith('+')) return digits;
  if (digits.startsWith(GEORGIA_COUNTRY_CODE) && digits.length >= 11) return digits;
  if (digits.length === 9 && digits.startsWith('5')) return GEORGIA_COUNTRY_CODE + digits;

  return digits;
}

export function whatsAppUrl(phone: string): string | null {
  const number = toInternationalPhone(phone);
  return number ? `https://wa.me/${number}` : null;
}

/** Telegram resolves a phone number when it is given in full international form behind a `+`. */
export function telegramUrl(phone: string): string | null {
  const number = toInternationalPhone(phone);
  return number ? `https://t.me/+${number}` : null;
}

/**
 * Locations are free text a seller typed — "თბილისი გვეტაძის 6", "კახეთი" — never coordinates, so
 * the only thing to do with one is hand it to a map as a search.
 */
export function mapsUrl(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}
