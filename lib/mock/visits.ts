import type { AppointmentRecord, AppointmentStatus } from "@/types/visits";

/**
 * Mock appointment records for the Visits page.
 * Dates are relative to "today" = 2026-02-28.
 * Times are ISO UTC (AEDT = UTC+11, so 9 am AEDT = T22:00:00Z prev day).
 */

let _id = 1;
const uid = () => `appt-${_id++}`;

function appt(
  clientName: string,
  serviceName: string,
  durationMinutes: number,
  staffId: string,
  staffName: string,
  scheduledAt: string,
  status: AppointmentStatus,
  note?: string
): AppointmentRecord {
  return {
    id: uid(),
    clientName,
    serviceName,
    durationMinutes,
    staffId,
    staffName,
    scheduledAt,
    status,
    note,
    statusUpdatedAt: status !== "pending" ? "2026-02-28T00:00:00Z" : undefined,
  };
}

/* ── Shorthand helpers ──────────────────────────────────────── */
// Staff: s1=Alex, s2=Jamie, s3=Casey, s4=Morgan, s5=Taylor
const ALEX   = { id: "s1", name: "Alex Rivera" };
const JAMIE  = { id: "s2", name: "Jamie Chen" };
const CASEY  = { id: "s3", name: "Casey Williams" };
const MORGAN = { id: "s4", name: "Morgan Patel" };
const TAYLOR = { id: "s5", name: "Taylor Brown" };

export const MOCK_APPOINTMENTS: AppointmentRecord[] = [
  /* ── Today — 28 Feb 2026 (past hours, awaiting review) ─────── */
  appt("Liam Nguyen",      "Haircut",          30, ALEX.id,   ALEX.name,   "2026-02-27T22:00:00Z", "pending"),
  appt("Zoe Anderson",     "Gel Nails",        60, CASEY.id,  CASEY.name,  "2026-02-27T23:30:00Z", "pending"),
  appt("Ethan Brooks",     "Beard Trim",       20, ALEX.id,   ALEX.name,   "2026-02-28T00:30:00Z", "pending"),
  appt("Priya Sharma",     "Lash Lift & Tint", 60, MORGAN.id, MORGAN.name, "2026-02-28T01:00:00Z", "pending"),
  appt("Connor Walsh",     "Fade / Skin Fade", 40, TAYLOR.id, TAYLOR.name, "2026-02-28T02:00:00Z", "completed"),
  appt("Mia Thompson",     "Blow Dry",         30, JAMIE.id,  JAMIE.name,  "2026-02-28T03:00:00Z", "no_show",   "Called to cancel last minute"),

  /* ── Yesterday — 27 Feb 2026 ───────────────────────────────── */
  appt("Sarah Johnson",    "Haircut",          45, ALEX.id,   ALEX.name,   "2026-02-26T22:00:00Z", "completed"),
  appt("Ben Carter",       "Hot Towel Shave",  30, ALEX.id,   ALEX.name,   "2026-02-27T00:00:00Z", "completed"),
  appt("Lily Park",        "Acrylic Nails",    75, CASEY.id,  CASEY.name,  "2026-02-27T00:30:00Z", "completed"),
  appt("Dylan Foster",     "Haircut",          30, TAYLOR.id, TAYLOR.name, "2026-02-27T01:00:00Z", "no_show"),
  appt("Ava Martinez",     "Brow Shaping",     30, MORGAN.id, MORGAN.name, "2026-02-27T02:00:00Z", "completed"),
  appt("Noah Kim",         "Hair Colouring",   90, JAMIE.id,  JAMIE.name,  "2026-02-27T03:00:00Z", "completed"),
  appt("Isabella Davis",   "Lash Extensions",  90, MORGAN.id, MORGAN.name, "2026-02-27T04:00:00Z", "cancelled", "Client reschedule request"),

  /* ── 26 Feb 2026 ───────────────────────────────────────────── */
  appt("Marcus Lee",       "Fade / Skin Fade", 45, ALEX.id,   ALEX.name,   "2026-02-25T22:30:00Z", "completed"),
  appt("Chloe White",      "Manicure",         45, CASEY.id,  CASEY.name,  "2026-02-25T23:30:00Z", "completed"),
  appt("James Brown",      "Beard Trim",       20, TAYLOR.id, TAYLOR.name, "2026-02-26T00:00:00Z", "no_show",   "Second no-show this month"),
  appt("Olivia Chen",      "Blow Dry",         30, JAMIE.id,  JAMIE.name,  "2026-02-26T01:00:00Z", "completed"),
  appt("Aiden Scott",      "Scalp Treatment",  45, TAYLOR.id, TAYLOR.name, "2026-02-26T02:00:00Z", "completed"),

  /* ── 25 Feb 2026 ───────────────────────────────────────────── */
  appt("Sophie Turner",    "Highlights / Balayage", 120, JAMIE.id,  JAMIE.name,  "2026-02-24T22:00:00Z", "completed"),
  appt("Ryan Mitchell",    "Haircut",          30, ALEX.id,   ALEX.name,   "2026-02-24T23:00:00Z", "completed"),
  appt("Grace Wilson",     "Pedicure",         50, CASEY.id,  CASEY.name,  "2026-02-25T00:00:00Z", "completed"),
  appt("Jack Taylor",      "Clean Shave",      30, ALEX.id,   ALEX.name,   "2026-02-25T01:00:00Z", "no_show"),
  appt("Amelia Roberts",   "Lash Lift & Tint", 60, MORGAN.id, MORGAN.name, "2026-02-25T02:00:00Z", "completed"),

  /* ── 24 Feb 2026 ───────────────────────────────────────────── */
  appt("Luke Harris",      "Haircut",          30, TAYLOR.id, TAYLOR.name, "2026-02-23T22:00:00Z", "completed"),
  appt("Emma Liu",         "Gel Nails",        60, CASEY.id,  CASEY.name,  "2026-02-23T23:00:00Z", "completed"),
  appt("Adam Clarke",      "Beard Trim",       20, ALEX.id,   ALEX.name,   "2026-02-24T00:00:00Z", "completed"),
  appt("Natalie Green",    "Brow Tint",        20, MORGAN.id, MORGAN.name, "2026-02-24T01:30:00Z", "cancelled"),
  appt("Oliver Stone",     "Hair Colouring",   90, JAMIE.id,  JAMIE.name,  "2026-02-24T02:00:00Z", "completed"),

  /* ── 22 Feb 2026 ───────────────────────────────────────────── */
  appt("Charlotte Evans",  "Manicure",         45, CASEY.id,  CASEY.name,  "2026-02-21T23:00:00Z", "completed"),
  appt("William Price",    "Haircut",          30, ALEX.id,   ALEX.name,   "2026-02-22T00:00:00Z", "completed"),
  appt("Ella Murphy",      "Lash Extensions",  90, MORGAN.id, MORGAN.name, "2026-02-22T01:00:00Z", "no_show"),
  appt("Henry Collins",    "Fade / Skin Fade", 45, TAYLOR.id, TAYLOR.name, "2026-02-22T02:00:00Z", "completed"),
];
