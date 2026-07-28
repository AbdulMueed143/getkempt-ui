/**
 * Format a monetary amount for display.
 *
 * @example
 * formatMoney(55, "AUD")     // "$55.00"
 * formatMoney(166.5, "AUD")  // "$166.50"
 */
export function formatMoney(amount: number, currency = "AUD"): string {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}
