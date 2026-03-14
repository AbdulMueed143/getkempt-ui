/**
 * Mock client data — mirrors what GET /api/v1/clients would return.
 *
 * Dates are relative to 28 Feb 2026 (today).
 * Staff IDs reference MOCK_STAFF: s1–s5.
 */

import type { Client } from "@/types/client";

export const MOCK_CLIENTS: Client[] = [
  /* ── Frequent / VIP ────────────────────────────── */
  {
    id: "c1",
    firstName: "Ethan",     lastName: "Brown",
    email: "ethan.brown@gmail.com",   phone: "0412 344 891",
    totalBookings: 24, lastBookingDate: "2026-02-15", nextBookingDate: "2026-03-15",
    preferredStaffId: "s1", joinedAt: "2022-06-10",
  },
  {
    id: "c2",
    firstName: "Michael",  lastName: "Nguyen",
    email: "m.nguyen@outlook.com",    phone: "0423 711 205",
    totalBookings: 22, lastBookingDate: "2026-02-22", nextBookingDate: "2026-03-08",
    preferredStaffId: "s1", joinedAt: "2022-09-03",
  },
  {
    id: "c3",
    firstName: "Zoe",       lastName: "Harris",
    email: "zoe.harris@icloud.com",   phone: "0401 988 312",
    totalBookings: 20, lastBookingDate: "2026-02-10", nextBookingDate: "2026-03-10",
    preferredStaffId: "s3", joinedAt: "2023-01-14",
  },
  {
    id: "c4",
    firstName: "Jacob",    lastName: "Hall",
    email: "jacob.hall@gmail.com",    phone: "0415 622 447",
    totalBookings: 16, lastBookingDate: "2026-01-28", nextBookingDate: "2026-03-04",
    preferredStaffId: "s3", joinedAt: "2022-11-22",
  },
  {
    id: "c5",
    firstName: "Marcus",   lastName: "Johnson",
    email: "marcus.j@hotmail.com",    phone: "0432 501 169",
    totalBookings: 18, lastBookingDate: "2026-02-18", nextBookingDate: null,
    preferredStaffId: "s5", joinedAt: "2023-03-07",
  },

  /* ── Regular ────────────────────────────────────── */
  {
    id: "c6",
    firstName: "Sarah",    lastName: "Mitchell",
    email: "sarah.mitchell@gmail.com", phone: "0418 234 567",
    totalBookings: 15, lastBookingDate: "2026-02-05", nextBookingDate: "2026-03-19",
    preferredStaffId: "s2", joinedAt: "2023-05-17",
  },
  {
    id: "c7",
    firstName: "Amelia",   lastName: "Patel",
    email: "amelia.patel@gmail.com",  phone: "0444 882 231",
    totalBookings: 13, lastBookingDate: "2026-01-20", nextBookingDate: "2026-03-20",
    preferredStaffId: "s3", joinedAt: "2023-04-02",
  },
  {
    id: "c8",
    firstName: "Isabella", lastName: "Tanaka",
    email: "isa.tanaka@gmail.com",    phone: "0407 349 001",
    totalBookings: 11, lastBookingDate: "2026-02-01", nextBookingDate: null,
    preferredStaffId: "s3", joinedAt: "2023-06-28",
  },
  {
    id: "c9",
    firstName: "Benjamin", lastName: "Thompson",
    email: "ben.thompson@live.com",   phone: "0422 765 311",
    totalBookings: 11, lastBookingDate: "2026-01-10", nextBookingDate: null,
    preferredStaffId: "s5", joinedAt: "2023-08-15",
  },
  {
    id: "c10",
    firstName: "Caleb",    lastName: "White",
    email: "caleb.white@yahoo.com",   phone: "0436 210 744",
    totalBookings: 10, lastBookingDate: "2026-02-20", nextBookingDate: "2026-03-06",
    preferredStaffId: "s2", joinedAt: "2023-07-04",
  },
  {
    id: "c11",
    firstName: "Priya",    lastName: "Sharma",
    email: "priya.sharma@gmail.com",  phone: "0410 556 892",
    totalBookings: 9,  lastBookingDate: "2026-01-15", nextBookingDate: "2026-03-22",
    preferredStaffId: "s2", joinedAt: "2023-09-11",
  },
  {
    id: "c12",
    firstName: "Mia",      lastName: "Young",
    email: "mia.young@icloud.com",    phone: "0428 103 675",
    totalBookings: 9,  lastBookingDate: "2025-12-20", nextBookingDate: null,
    preferredStaffId: "s2", joinedAt: "2023-10-30",
  },
  {
    id: "c13",
    firstName: "Daniel",   lastName: "Kowalski",
    email: "d.kowalski@gmail.com",    phone: "0455 678 920",
    totalBookings: 7,  lastBookingDate: "2026-02-12", nextBookingDate: "2026-03-12",
    preferredStaffId: "s1", joinedAt: "2024-01-08",
  },
  {
    id: "c14",
    firstName: "Natalie",  lastName: "Lewis",
    email: "natalie.lewis@outlook.com", phone: "0411 334 788",
    totalBookings: 7,  lastBookingDate: "2025-11-28", nextBookingDate: null,
    preferredStaffId: "s1", joinedAt: "2024-02-14",
  },
  {
    id: "c15",
    firstName: "Hannah",   lastName: "Wilson",
    email: "hannah.w@gmail.com",      phone: "0443 901 234",
    totalBookings: 8,  lastBookingDate: "2026-01-25", nextBookingDate: "2026-03-25",
    preferredStaffId: "s4", joinedAt: "2024-01-20",
  },
  {
    id: "c16",
    firstName: "Emma",     lastName: "Thompson",
    email: "emma.t@icloud.com",       phone: "0419 456 123",
    totalBookings: 12, lastBookingDate: "2026-02-08", nextBookingDate: null,
    preferredStaffId: "s2", joinedAt: "2023-11-05",
  },
  {
    id: "c17",
    firstName: "James",    lastName: "Chen",
    email: "james.chen@gmail.com",    phone: "0431 827 390",
    totalBookings: 8,  lastBookingDate: "2026-02-25", nextBookingDate: "2026-03-28",
    preferredStaffId: "s1", joinedAt: "2024-03-12",
  },
  {
    id: "c18",
    firstName: "Lily",     lastName: "Allen",
    email: "lily.allen@gmail.com",    phone: "0448 213 566",
    totalBookings: 6,  lastBookingDate: "2026-01-05", nextBookingDate: null,
    preferredStaffId: "s1", joinedAt: "2024-04-07",
  },
  {
    id: "c19",
    firstName: "Grace",    lastName: "Robinson",
    email: "grace.r@hotmail.com",     phone: "0404 781 330",
    totalBookings: 4,  lastBookingDate: "2025-12-14", nextBookingDate: null,
    preferredStaffId: "s5", joinedAt: "2024-05-22",
  },

  /* ── Occasional ─────────────────────────────────── */
  {
    id: "c20",
    firstName: "Charlotte", lastName: "Lee",
    email: "charlotte.lee@gmail.com", phone: "0427 654 019",
    totalBookings: 5,  lastBookingDate: "2026-01-30", nextBookingDate: "2026-04-01",
    preferredStaffId: "s4", joinedAt: "2024-07-10",
  },
  {
    id: "c21",
    firstName: "Tyler",    lastName: "Walker",
    email: "tyler.walker@yahoo.com",  phone: "0439 502 871",
    totalBookings: 5,  lastBookingDate: "2025-11-10", nextBookingDate: null,
    preferredStaffId: "s5", joinedAt: "2024-06-15",
  },
  {
    id: "c22",
    firstName: "Liam",     lastName: "O'Brien",
    email: "liam.obrien@gmail.com",   phone: "0414 333 900",
    totalBookings: 4,  lastBookingDate: "2025-10-22", nextBookingDate: null,
    preferredStaffId: "s1", joinedAt: "2024-06-01",
  },
  {
    id: "c23",
    firstName: "Olivia",   lastName: "Anderson",
    email: "olivia.a@gmail.com",      phone: "0456 112 345",
    totalBookings: 3,  lastBookingDate: "2025-12-05", nextBookingDate: null,
    preferredStaffId: "s3", joinedAt: "2024-09-18",
  },
  {
    id: "c24",
    firstName: "Lucas",    lastName: "Martinez",
    email: "lucas.m@outlook.com",     phone: "0420 890 677",
    totalBookings: 3,  lastBookingDate: "2025-10-08", nextBookingDate: null,
    preferredStaffId: "s2", joinedAt: "2024-08-02",
  },
  {
    id: "c25",
    firstName: "Mason",    lastName: "Scott",
    email: "mason.scott@gmail.com",   phone: "0445 723 118",
    totalBookings: 3,  lastBookingDate: "2026-01-15", nextBookingDate: "2026-03-30",
    preferredStaffId: "s4", joinedAt: "2024-10-25",
  },

  /* ── New clients ────────────────────────────────── */
  {
    id: "c26",
    firstName: "Sophie",   lastName: "Williams",
    email: "sophie.w@gmail.com",      phone: "0408 991 234",
    totalBookings: 1,  lastBookingDate: "2026-02-20", nextBookingDate: "2026-03-07",
    preferredStaffId: "s4", joinedAt: "2026-02-20",
    notes: "First visit — requested full colour consultation",
  },
  {
    id: "c27",
    firstName: "Ryan",     lastName: "Kim",
    email: "ryan.kim@icloud.com",     phone: "0433 445 810",
    totalBookings: 1,  lastBookingDate: "2026-02-24", nextBookingDate: null,
    preferredStaffId: "s1", joinedAt: "2026-02-24",
  },
  {
    id: "c28",
    firstName: "Aiden",    lastName: "Clark",
    email: "aiden.clark@gmail.com",   phone: "0421 300 556",
    totalBookings: 2,  lastBookingDate: "2026-02-18", nextBookingDate: "2026-03-18",
    preferredStaffId: "s4", joinedAt: "2026-01-22",
  },
  {
    id: "c29",
    firstName: "Noah",     lastName: "Taylor",
    email: "noah.taylor@outlook.com", phone: "0417 660 228",
    totalBookings: 2,  lastBookingDate: "2026-02-14", nextBookingDate: null,
    preferredStaffId: "s5", joinedAt: "2026-01-10",
  },
  {
    id: "c30",
    firstName: "Chloe",    lastName: "Martin",
    email: "chloe.martin@gmail.com",  phone: "0449 101 774",
    totalBookings: 1,  lastBookingDate: "2026-02-26", nextBookingDate: null,
    preferredStaffId: "s2", joinedAt: "2026-02-26",
    notes: "Walk-in — interested in loyalty card",
  },
];
