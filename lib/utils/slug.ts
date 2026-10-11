/**
 * Convert a business name into a URL-safe slug.
 *
 * @example
 * slugify("The Kempt Studio")   // "the-kempt-studio"
 * slugify("Ali's Barber & Co.") // "alis-barber-co"
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, "")    // drop non-alphanumerics
    .replace(/[\s_-]+/g, "-")        // collapse whitespace/underscores to a single hyphen
    .replace(/^-+|-+$/g, "");        // trim leading/trailing hyphens
}
