/**
 * Pure utility functions for package pricing and timing.
 * No React dependencies — safe to import in tests and server code.
 */

export type DiscountType = "percentage" | "fixed";

/* ── Base value aggregations ────────────────────────────────────────────── */

/**
 * Sum the prices of an array of services.
 * Returns 0 for an empty array.
 */
export function calculateBasePrice(services: { price: number }[]): number {
  return services.reduce((sum, s) => sum + s.price, 0);
}

/**
 * Sum the duration (in minutes) of an array of services.
 * Returns 0 for an empty array.
 */
export function calculateBaseDuration(
  services: { durationMinutes: number }[]
): number {
  return services.reduce((sum, s) => sum + s.durationMinutes, 0);
}

/* ── Discount & final price ─────────────────────────────────────────────── */

/**
 * Apply an optional discount to a base price.
 *
 * - `percentage`: reduces price by the given %, capped at 100%.
 * - `fixed`: subtracts a flat dollar amount; never returns a negative price.
 * - If `discountType` or `discountValue` is null/falsy, returns `basePrice` unchanged.
 */
export function calculateFinalPrice(
  basePrice: number,
  discountType: DiscountType | null | undefined,
  discountValue: number | null | undefined
): number {
  if (!discountType || discountValue == null || discountValue <= 0) {
    return basePrice;
  }

  if (discountType === "percentage") {
    const pct = Math.min(discountValue, 100);
    return Math.max(0, basePrice * (1 - pct / 100));
  }

  // fixed
  return Math.max(0, basePrice - discountValue);
}

/* ── Saving summary ─────────────────────────────────────────────────────── */

export interface SavingSummary {
  amount:     number;   // dollar saving (rounded to 2dp)
  percentage: number;   // % saving (rounded to 1dp)
}

/**
 * Compute the saving between a base price and a (discounted) final price.
 * Returns zero values when there is no saving or base is zero.
 */
export function calculateSaving(
  basePrice: number,
  finalPrice: number
): SavingSummary {
  const amount     = Math.max(0, basePrice - finalPrice);
  const percentage = basePrice > 0 ? (amount / basePrice) * 100 : 0;

  return {
    amount:     Math.round(amount     * 100) / 100,
    percentage: Math.round(percentage * 10)  / 10,
  };
}

/* ── Duration formatting ────────────────────────────────────────────────── */

/**
 * Format a number of minutes into a human-readable string.
 *
 * @example
 * formatDuration(30)   // "30m"
 * formatDuration(60)   // "1h"
 * formatDuration(90)   // "1h 30m"
 * formatDuration(0)    // "0m"
 */
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0m";

  const hours = Math.floor(totalMinutes / 60);
  const mins  = totalMinutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins  === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/* ── Currency formatting ────────────────────────────────────────────────── */

/**
 * Format a number as a dollar amount (2 decimal places).
 * Works for AUD, USD and GBP — currency symbol applied at the display layer.
 *
 * @example
 * formatPrice(50)      // "50.00"
 * formatPrice(99.9)    // "99.90"
 */
export function formatPrice(value: number): string {
  return value.toFixed(2);
}
