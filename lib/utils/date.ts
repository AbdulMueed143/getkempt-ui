/**
 * Lightweight date formatting utilities — no external dependencies.
 * All functions accept ISO-8601 strings or null.
 */

/** Format a date as "12 Mar 2026" (unambiguous, Australian-style) */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-AU", {
    day:   "numeric",
    month: "short",
    year:  "numeric",
  });
}

/** Days between two dates (positive = date is in the past) */
export function daysSince(dateString: string | null | undefined): number {
  if (!dateString) return Infinity;
  const ms = Date.now() - new Date(dateString).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** Days until a future date (positive = date is in the future) */
export function daysUntil(dateString: string | null | undefined): number {
  if (!dateString) return -Infinity;
  const ms = new Date(dateString).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/**
 * Human-readable relative label for a future date.
 * Falls back to formatted date for anything > 2 weeks away.
 */
export function relativeUpcoming(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const days = daysUntil(dateString);
  if (days < 0)  return formatDate(dateString);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7)  return `In ${days} days`;
  if (days <= 14) return `In ${days} days`;
  return formatDate(dateString);
}

/**
 * Human-readable relative label for a past date.
 * Falls back to formatted date for older entries.
 */
export function relativePast(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const days = daysSince(dateString);
  if (days === 0)  return "Today";
  if (days === 1)  return "Yesterday";
  if (days <= 7)   return `${days} days ago`;
  if (days <= 30)  return `${Math.round(days / 7)} wks ago`;
  if (days <= 365) return formatDate(dateString);
  return formatDate(dateString);
}
