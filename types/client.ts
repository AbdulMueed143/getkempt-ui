/**
 * Client — a person who has made at least one booking at the shop.
 * All computed fields (isActive, isNew, hasUpcoming) are derived at runtime
 * from the raw dates rather than stored, to avoid stale data.
 */
export interface Client {
  id:                 string;
  firstName:          string;
  lastName:           string;
  email:              string;
  phone:              string;

  /* Booking history */
  totalBookings:      number;
  lastBookingDate:    string | null;   // ISO date string
  nextBookingDate:    string | null;   // ISO date string — null if no future booking

  /* Shop relationship */
  preferredStaffId:   string | null;   // the staff member they usually book with
  joinedAt:           string;          // ISO date string — first booking date

  notes?:             string;
}

/* ── Derived helpers ────────────────────────────────────────── */
export function isActiveClient(client: Client, thresholdDays = 90): boolean {
  if (!client.lastBookingDate) return false;
  const ms  = Date.now() - new Date(client.lastBookingDate).getTime();
  const days = ms / (1000 * 60 * 60 * 24);
  return days < thresholdDays;
}

export function isNewClient(client: Client, thresholdDays = 30): boolean {
  const ms   = Date.now() - new Date(client.joinedAt).getTime();
  const days = ms / (1000 * 60 * 60 * 24);
  return days < thresholdDays;
}

export function hasUpcomingBooking(client: Client): boolean {
  return client.nextBookingDate != null;
}
