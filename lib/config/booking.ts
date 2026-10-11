/**
 * Where the public booking site lives. Businesses share
 * `https://bookings.getkempt.co/<slug>` on their socials.
 *
 * Configurable via NEXT_PUBLIC_BOOKINGS_BASE_URL so preview/UAT can point at
 * their own host. Falls back to the production booking domain.
 */
export const BOOKINGS_BASE_URL: string =
  process.env.NEXT_PUBLIC_BOOKINGS_BASE_URL ?? "https://bookings.getkempt.co";

/** Full shareable booking URL for a business slug. */
export function bookingUrl(slug: string): string {
  return `${BOOKINGS_BASE_URL.replace(/\/$/, "")}/${slug}`;
}

/** In-app path to the booking experience (same repo, same deploy). */
export function bookingPath(slug: string): string {
  return `/book/${slug}`;
}
