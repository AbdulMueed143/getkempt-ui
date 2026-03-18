import type { Booking, BookingStatus, BookingSource } from "@/types/booking";

/* ── Helpers ──────────────────────────────────────────────────── */

/** Convert local AEDT (UTC+11) datetime to ISO UTC string */
function aedt(date: string, time: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, h - 11, min)).toISOString().replace(/\.\d+Z/, "Z");
}

let _id = 1;
function bk(
  client:   string,
  staff:    { id: string; name: string },
  svc:      { id: string; name: string; mins: number; price: number },
  date:     string,
  time:     string,
  status:   BookingStatus,
  source:   BookingSource = "app",
  phone?:   string,
  email?:   string,
  notes?:   string
): Booking {
  const startAt = aedt(date, time);
  const endAt   = new Date(new Date(startAt).getTime() + svc.mins * 60_000).toISOString();
  return {
    id: `bk${_id++}`,
    clientName: client,
    clientPhone: phone,
    clientEmail: email,
    staffId:    staff.id,
    staffName:  staff.name,
    serviceId:  svc.id,
    serviceName: svc.name,
    durationMinutes: svc.mins,
    price: svc.price,
    startAt,
    endAt,
    status,
    source,
    notes,
    createdAt: "2026-02-01T00:00:00Z",
  };
}

/* ── Staff ─────────────────────────────────────────────────────── */
const ALEX   = { id: "s1", name: "Alex Rivera" };
const JAMIE  = { id: "s2", name: "Jamie Chen" };
const CASEY  = { id: "s3", name: "Casey Williams" };
const MORGAN = { id: "s4", name: "Morgan Patel" };
const TAYLOR = { id: "s5", name: "Taylor Brown" };

/* ── Services (abbreviated) ─────────────────────────────────────── */
const HAIRCUT   = { id: "svc1",  name: "Haircut",           mins: 30,  price: 35  };
const FADE      = { id: "svc2",  name: "Fade / Skin Fade",  mins: 45,  price: 45  };
const BEARD     = { id: "svc3",  name: "Beard Trim",         mins: 20,  price: 25  };
const SHAVE     = { id: "svc4",  name: "Hot Towel Shave",    mins: 30,  price: 40  };
const GELNAILS  = { id: "svc5",  name: "Gel Nails",          mins: 60,  price: 65  };
const ACRYLIC   = { id: "svc6",  name: "Acrylic Nails",      mins: 75,  price: 85  };
const LASH_EXT  = { id: "svc7",  name: "Lash Extensions",    mins: 90,  price: 120 };
const BLOW_DRY  = { id: "svc8",  name: "Blow Dry",           mins: 30,  price: 45  };
const COLOUR    = { id: "svc9",  name: "Hair Colouring",     mins: 90,  price: 150 };
const BROW      = { id: "svc10", name: "Brow Shaping",       mins: 30,  price: 30  };
const LASH_LIFT = { id: "svc11", name: "Lash Lift & Tint",   mins: 60,  price: 85  };

/* ──────────────────────────────────────────────────────────────────
   Bookings — grouped by date (AEDT local), today = 28 Feb 2026
   ─────────────────────────────────────────────────────────────── */

export const MOCK_BOOKINGS: Booking[] = [

  /* ── Mon 23 Feb ───────────────────────────────────────────────── */
  bk("Liam Nguyen",     ALEX,   HAIRCUT,   "2026-02-23", "09:00", "completed", "app",    "0412 111 222", "liam@email.com"),
  bk("Zoe Anderson",    CASEY,  GELNAILS,  "2026-02-23", "09:30", "completed", "app"),
  bk("Noah Kim",        JAMIE,  COLOUR,    "2026-02-23", "10:00", "completed", "manual", "0411 333 444"),
  bk("Priya Sharma",    MORGAN, LASH_LIFT, "2026-02-23", "11:00", "completed", "app"),
  bk("Connor Walsh",    TAYLOR, FADE,      "2026-02-23", "11:30", "completed", "app"),

  /* ── Tue 24 Feb ───────────────────────────────────────────────── */
  bk("Sarah Johnson",   ALEX,   HAIRCUT,   "2026-02-24", "09:00", "completed", "app",    "0412 555 666", "sarah@email.com"),
  bk("Emma Liu",        CASEY,  ACRYLIC,   "2026-02-24", "09:00", "completed", "app"),
  bk("Ben Carter",      ALEX,   BEARD,     "2026-02-24", "09:45", "completed", "walk_in"),
  bk("Lily Park",       MORGAN, LASH_EXT,  "2026-02-24", "10:00", "no_show",   "app"),
  bk("Ava Martinez",    TAYLOR, BLOW_DRY,  "2026-02-24", "11:00", "completed", "app"),
  bk("Dylan Foster",    JAMIE,  COLOUR,    "2026-02-24", "11:00", "completed", "app"),

  /* ── Wed 25 Feb ───────────────────────────────────────────────── */
  bk("Marcus Lee",      ALEX,   FADE,      "2026-02-25", "09:00", "completed", "app"),
  bk("Chloe White",     CASEY,  GELNAILS,  "2026-02-25", "09:30", "completed", "manual", "0411 777 888"),
  bk("James Brown",     TAYLOR, BEARD,     "2026-02-25", "10:00", "cancelled", "app",    undefined, undefined, "Client requested cancel"),
  bk("Natalie Green",   MORGAN, BROW,      "2026-02-25", "10:30", "completed", "app"),
  bk("Oliver Stone",    JAMIE,  HAIRCUT,   "2026-02-25", "11:00", "completed", "app"),
  bk("Sophie Turner",   CASEY,  ACRYLIC,   "2026-02-25", "11:00", "completed", "app"),

  /* ── Thu 26 Feb ───────────────────────────────────────────────── */
  bk("Ethan Brooks",    ALEX,   SHAVE,     "2026-02-26", "09:00", "completed", "app"),
  bk("Mia Thompson",    JAMIE,  BLOW_DRY,  "2026-02-26", "09:30", "no_show",   "app"),
  bk("Ryan Mitchell",   TAYLOR, FADE,      "2026-02-26", "09:00", "completed", "manual", "0411 222 333"),
  bk("Grace Wilson",    CASEY,  GELNAILS,  "2026-02-26", "10:00", "completed", "app"),
  bk("Isabella Davis",  MORGAN, LASH_EXT,  "2026-02-26", "10:00", "completed", "app"),
  bk("Jack Taylor",     ALEX,   HAIRCUT,   "2026-02-26", "11:00", "completed", "app"),

  /* ── Fri 27 Feb ───────────────────────────────────────────────── */
  bk("Amelia Roberts",  ALEX,   FADE,      "2026-02-27", "09:00", "completed", "app"),
  bk("Luke Harris",     TAYLOR, HAIRCUT,   "2026-02-27", "09:30", "completed", "app"),
  bk("Charlotte Evans", CASEY,  ACRYLIC,   "2026-02-27", "09:00", "completed", "app"),
  bk("William Price",   ALEX,   BEARD,     "2026-02-27", "10:00", "completed", "walk_in"),
  bk("Ella Murphy",     MORGAN, LASH_LIFT, "2026-02-27", "11:00", "completed", "app"),
  bk("Henry Collins",   JAMIE,  COLOUR,    "2026-02-27", "11:00", "completed", "app"),

  /* ── Sat 28 Feb (today) — morning completed, afternoon confirmed ─ */
  bk("Nathan Scott",    ALEX,   FADE,      "2026-02-28", "09:00", "completed", "app",    "0412 888 999"),
  bk("Ruby Clarke",     CASEY,  GELNAILS,  "2026-02-28", "09:00", "completed", "app"),
  bk("Leo Patterson",   TAYLOR, HAIRCUT,   "2026-02-28", "09:30", "completed", "manual"),
  bk("Isla Bennett",    MORGAN, LASH_EXT,  "2026-02-28", "09:30", "completed", "app"),
  bk("Oscar Reid",      ALEX,   BEARD,     "2026-02-28", "10:00", "completed", "walk_in"),
  bk("Freya Morgan",    JAMIE,  BLOW_DRY,  "2026-02-28", "10:00", "completed", "app"),
  bk("Finn Wilson",     ALEX,   FADE,      "2026-02-28", "11:00", "completed", "app"),
  bk("Maya Nguyen",     CASEY,  ACRYLIC,   "2026-02-28", "11:00", "completed", "app"),
  // Afternoon — confirmed
  bk("Caleb Moore",     TAYLOR, HAIRCUT,   "2026-02-28", "14:00", "confirmed", "app",    "0412 100 200"),
  bk("Zara Ali",        MORGAN, BROW,      "2026-02-28", "14:00", "confirmed", "app"),
  bk("Eli Turner",      ALEX,   SHAVE,     "2026-02-28", "15:00", "confirmed", "manual", "0411 300 400"),
  bk("Mia Banks",       CASEY,  GELNAILS,  "2026-02-28", "15:00", "confirmed", "app"),
  bk("Kai Harrison",    TAYLOR, FADE,      "2026-02-28", "16:00", "confirmed", "app"),
  bk("Luna Patel",      MORGAN, LASH_LIFT, "2026-02-28", "16:00", "confirmed", "app"),

  /* ── Mon 2 Mar ────────────────────────────────────────────────── */
  bk("Felix Grant",     ALEX,   HAIRCUT,   "2026-03-02", "09:00", "confirmed", "app"),
  bk("Stella Adams",    CASEY,  ACRYLIC,   "2026-03-02", "09:30", "confirmed", "app"),
  bk("Jasper Brooks",   JAMIE,  COLOUR,    "2026-03-02", "10:00", "confirmed", "app"),
  bk("Aria Hayes",      MORGAN, LASH_EXT,  "2026-03-02", "10:00", "confirmed", "manual"),
  bk("Theo Wallace",    TAYLOR, FADE,      "2026-03-02", "11:00", "confirmed", "app"),

  /* ── Tue 3 Mar ────────────────────────────────────────────────── */
  bk("Cleo Foster",     CASEY,  GELNAILS,  "2026-03-03", "09:00", "confirmed", "app"),
  bk("Archer Singh",    ALEX,   BEARD,     "2026-03-03", "09:30", "confirmed", "walk_in"),
  bk("Nadia Chen",      MORGAN, LASH_LIFT, "2026-03-03", "10:00", "confirmed", "app",    "0412 500 600"),
  bk("Remy Davis",      TAYLOR, HAIRCUT,   "2026-03-03", "11:00", "confirmed", "app"),
  bk("Vera King",       JAMIE,  BLOW_DRY,  "2026-03-03", "11:30", "confirmed", "app"),

  /* ── Wed 4 Mar ────────────────────────────────────────────────── */
  bk("Sol Martinez",    ALEX,   FADE,      "2026-03-04", "09:00", "confirmed", "app"),
  bk("Pippa Hall",      CASEY,  ACRYLIC,   "2026-03-04", "09:00", "confirmed", "app"),
  bk("Nico Rivera",     JAMIE,  COLOUR,    "2026-03-04", "10:00", "pending",   "app"),
  bk("Dani Cooper",     MORGAN, BROW,      "2026-03-04", "10:30", "confirmed", "app"),
  bk("Kit Young",       TAYLOR, HAIRCUT,   "2026-03-04", "11:00", "confirmed", "app"),

  /* ── Thu 5 Mar ────────────────────────────────────────────────── */
  bk("Juno Wright",     CASEY,  GELNAILS,  "2026-03-05", "09:00", "confirmed", "app"),
  bk("Sable Ward",      ALEX,   SHAVE,     "2026-03-05", "09:30", "confirmed", "manual"),
  bk("Bex Torres",      MORGAN, LASH_EXT,  "2026-03-05", "10:00", "confirmed", "app"),
  bk("Cam Ellis",       TAYLOR, FADE,      "2026-03-05", "11:00", "confirmed", "app"),

  /* ── Fri 6 Mar ────────────────────────────────────────────────── */
  bk("Rue Parker",      ALEX,   HAIRCUT,   "2026-03-06", "09:00", "confirmed", "app"),
  bk("Ash Collins",     CASEY,  ACRYLIC,   "2026-03-06", "09:00", "confirmed", "app"),
  bk("Dawn Evans",      JAMIE,  COLOUR,    "2026-03-06", "10:00", "pending",   "app"),
  bk("Sam Hughes",      TAYLOR, FADE,      "2026-03-06", "11:00", "confirmed", "app"),
];
