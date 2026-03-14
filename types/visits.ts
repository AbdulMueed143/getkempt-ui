/**
 * Visits — the record of past appointments and whether the client attended.
 *
 * Since payments are not processed in-app, "Visits" is the primary way
 * to mark whether a booked appointment was actually completed.
 */

export type AppointmentStatus =
  | "pending"    // past appointment not yet reviewed
  | "completed"  // client attended, service delivered
  | "no_show"    // client did not arrive
  | "cancelled"; // appointment was cancelled before the time

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending:   "Needs review",
  completed: "Attended",
  no_show:   "No-show",
  cancelled: "Cancelled",
};

export const STATUS_STYLES: Record<
  AppointmentStatus,
  { color: string; bg: string; border: string }
> = {
  pending:   { color: "#92400E", bg: "#FEF9C3", border: "#FDE68A" },
  completed: { color: "#166534", bg: "#DCFCE7", border: "#86EFAC" },
  no_show:   { color: "#991B1B", bg: "#FEE2E2", border: "#FCA5A5" },
  cancelled: { color: "#6B7280", bg: "#F3F4F6", border: "#D1D5DB" },
};

export interface AppointmentRecord {
  id: string;

  /** Display name — e.g. "Sarah Johnson" */
  clientName: string;
  clientId?:  string;

  /** The service that was booked */
  serviceName:     string;
  durationMinutes: number;

  /** Staff member who performed (or was to perform) the service */
  staffId:   string;
  staffName: string;

  /**
   * Scheduled start time in ISO-8601 UTC.
   * The UI localises this to the shop's timezone for display.
   */
  scheduledAt: string;

  status: AppointmentStatus;

  /** Free-text note added when reviewing (e.g. "Client called to cancel") */
  note?: string;

  /** ISO UTC timestamp of the last status change */
  statusUpdatedAt?: string;
}
