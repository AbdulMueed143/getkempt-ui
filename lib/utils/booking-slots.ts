import type { Booking } from "@/types/booking";

const SLOT_INTERVAL_MINS = 15;
const DAY_START_HOUR = 9;  // 9 AM
const DAY_END_HOUR   = 18; // 6 PM

/** Parse "HH:MM" → total minutes from midnight */
export function hhmm(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Total minutes from midnight → "H:MM AM/PM" */
export function minsToDisplay(mins: number): string {
  const h   = Math.floor(mins / 60);
  const m   = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/** ISO UTC string → minutes from local midnight */
function toLocalMins(isoUtc: string): number {
  const d = new Date(isoUtc);
  return d.getHours() * 60 + d.getMinutes();
}

/** ISO UTC string → "YYYY-MM-DD" in local timezone */
export function toLocalDate(isoUtc: string): string {
  return new Date(isoUtc).toLocaleDateString("en-CA"); // en-CA gives YYYY-MM-DD
}

/**
 * Generate all possible start-time slots for a staff member on a given day,
 * excluding windows blocked by existing bookings.
 *
 * Returns an array of { time: "HH:MM", available: boolean }.
 */
export function generateSlots(
  staffId:    string,
  date:       string,   // "YYYY-MM-DD" local
  durationMins: number,
  allBookings: Booking[]
): { time: string; available: boolean }[] {
  // Bookings for this staff member on this day (ignore cancelled)
  const blocked = allBookings.filter(
    (b) =>
      b.staffId === staffId &&
      toLocalDate(b.startAt) === date &&
      b.status !== "cancelled"
  );

  const slots: { time: string; available: boolean }[] = [];
  const end = DAY_END_HOUR * 60;

  for (let t = DAY_START_HOUR * 60; t + durationMins <= end; t += SLOT_INTERVAL_MINS) {
    const slotEnd = t + durationMins;

    const conflict = blocked.some((b) => {
      const bStart = toLocalMins(b.startAt);
      const bEnd   = bStart + b.durationMinutes;
      return t < bEnd && slotEnd > bStart;
    });

    const h   = Math.floor(t / 60).toString().padStart(2, "0");
    const m   = (t % 60).toString().padStart(2, "0");
    slots.push({ time: `${h}:${m}`, available: !conflict });
  }

  return slots;
}

/* ── Calendar layout helpers ──────────────────────────────────── */

export const HOUR_HEIGHT = 80; // px per hour in time-grid views
export const DAY_START   = 7;  // 7 AM — grid start
export const DAY_END     = 21; // 9 PM — grid end

/** Top offset in px for a booking starting at `isoUtc` */
export function bookingTop(isoUtc: string): number {
  const d = new Date(isoUtc);
  const mins = d.getHours() * 60 + d.getMinutes() - DAY_START * 60;
  return Math.max(mins * (HOUR_HEIGHT / 60), 0);
}

/** Height in px for `durationMinutes` */
export function bookingHeight(durationMinutes: number): number {
  return Math.max(durationMinutes * (HOUR_HEIGHT / 60), 24);
}

/** Whether two bookings overlap in time */
export function overlaps(a: Booking, b: Booking): boolean {
  const aStart = new Date(a.startAt).getTime();
  const aEnd   = new Date(a.endAt).getTime();
  const bStart = new Date(b.startAt).getTime();
  const bEnd   = new Date(b.endAt).getTime();
  return aStart < bEnd && aEnd > bStart;
}

export interface LayoutBooking {
  booking:    Booking;
  lane:       number;
  totalLanes: number;
}

/**
 * Assign non-overlapping horizontal lanes to bookings in a day column.
 *
 * Uses a two-pass algorithm:
 *  1. Greedy column assignment (each booking goes into the first free lane)
 *  2. Per-booking totalLanes = max lane index across all bookings that
 *     temporally overlap with it + 1
 *
 * This ensures non-overlapping bookings always use the full column width,
 * and only bookings that genuinely conflict share the available space.
 */
export function layoutBookings(bookings: Booking[]): LayoutBooking[] {
  if (bookings.length === 0) return [];

  const sorted = [...bookings].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );

  // Pass 1: assign each booking to the first lane whose last booking has ended
  const laneEnds: number[] = []; // end-time (ms) of the last booking in each lane
  const assignments: { booking: Booking; lane: number }[] = [];

  for (const booking of sorted) {
    const bStart = new Date(booking.startAt).getTime();
    const bEnd   = new Date(booking.endAt).getTime();

    let lane = laneEnds.findIndex((end) => end <= bStart);
    if (lane === -1) lane = laneEnds.length;

    laneEnds[lane] = bEnd;
    assignments.push({ booking, lane });
  }

  // Pass 2: for each booking, find the maximum lane index among all bookings
  // that overlap with it — that gives the true width divisor for its overlap group
  return assignments.map(({ booking, lane }) => {
    const bStart = new Date(booking.startAt).getTime();
    const bEnd   = new Date(booking.endAt).getTime();

    const overlapLanes = assignments
      .filter(({ booking: other }) => {
        if (other === booking) return false;
        const oStart = new Date(other.startAt).getTime();
        const oEnd   = new Date(other.endAt).getTime();
        return bStart < oEnd && bEnd > oStart;
      })
      .map((a) => a.lane);

    const totalLanes = overlapLanes.length === 0
      ? 1
      : Math.max(lane, ...overlapLanes) + 1;

    return { booking, lane, totalLanes };
  });
}

/** Check if two Date objects represent the same calendar day */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

/** Monday-anchored start of week containing `date` */
export function weekStart(date: Date): Date {
  const d   = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Array of 7 Date objects starting from `monday` */
export function weekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/** Start of month */
export function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** End of month */
export function monthEnd(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** Every day between start and end (inclusive) */
export function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endMs = end.getTime();
  while (cur.getTime() <= endMs) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
}

export function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  const m = monday.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  const s = sunday.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  return `${m} – ${s}`;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}
