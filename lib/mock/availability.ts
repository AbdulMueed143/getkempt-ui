import type { WeeklySchedule, AvailabilityOverride, DayOfWeek } from "@/types/availability";

/* ── Factory helpers ─────────────────────────────────────────────────── */

let _id = 1;
const uid = (prefix: string) => `${prefix}-${_id++}`;

function slot(start: string, end: string, type: "work" | "break" = "work", label?: string) {
  return { id: uid("sl"), startTime: start, endTime: end, type, label };
}

function brk(start: string, end: string, label = "Break") {
  return slot(start, end, "break", label);
}

function day(dow: DayOfWeek, working: boolean, ...slots: ReturnType<typeof slot>[]) {
  return { dayOfWeek: dow, isWorking: working, slots: working ? slots : [] };
}

/* ── Weekly schedules ────────────────────────────────────────────────── */
// Days: 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat

export const MOCK_WEEKLY_SCHEDULES: WeeklySchedule[] = [
  {
    // Alex Rivera — Owner, Mon–Sat, split lunch on Mon/Wed
    staffId: "s1",
    timezone: "Australia/Melbourne",
    updatedAt: "2026-01-10T09:00:00Z",
    days: [
      day(0, false),
      day(1, true, slot("09:00", "18:00"), brk("12:30", "13:30")),  // Mon – lunch break
      day(2, true, slot("09:00", "18:00")),                          // Tue – straight
      day(3, true, slot("09:00", "18:00"), brk("12:30", "13:30")),  // Wed – lunch break
      day(4, true, slot("09:00", "18:00")),                          // Thu – straight
      day(5, true, slot("09:00", "17:00")),                          // Fri – early finish
      day(6, true, slot("10:00", "15:00")),                          // Sat – half day
    ],
  },
  {
    // Jamie Chen — Manager, Tue–Sat, starts later
    staffId: "s2",
    timezone: "Australia/Melbourne",
    updatedAt: "2026-01-12T09:00:00Z",
    days: [
      day(0, false),
      day(1, false),
      day(2, true, slot("10:00", "19:00")),  // Tue
      day(3, true, slot("10:00", "19:00")),  // Wed
      day(4, true, slot("10:00", "19:00"), brk("13:00", "14:00")), // Thu – lunch
      day(5, true, slot("10:00", "19:00")),  // Fri
      day(6, true, slot("09:00", "17:00")),  // Sat
    ],
  },
  {
    // Casey Williams — Nails, Mon–Wed + Fri
    staffId: "s3",
    timezone: "Australia/Melbourne",
    updatedAt: "2026-01-20T09:00:00Z",
    days: [
      day(0, false),
      day(1, true, slot("09:00", "17:00")),  // Mon
      day(2, true, slot("09:00", "17:00")),  // Tue
      day(3, true, slot("09:00", "13:00")),  // Wed – morning only
      day(4, false),                          // Thu – off
      day(5, true, slot("09:00", "17:00")),  // Fri
      day(6, false),                          // Sat – off
    ],
  },
  {
    // Morgan Patel — On leave; minimal schedule
    staffId: "s4",
    timezone: "Australia/Melbourne",
    updatedAt: "2025-12-15T09:00:00Z",
    days: [
      day(0, false),
      day(1, true, slot("10:00", "16:00")),
      day(2, true, slot("10:00", "16:00")),
      day(3, true, slot("10:00", "16:00")),
      day(4, true, slot("10:00", "16:00")),
      day(5, true, slot("10:00", "16:00")),
      day(6, false),
    ],
  },
  {
    // Taylor Brown — Wed–Sun, afternoon bias
    staffId: "s5",
    timezone: "Australia/Melbourne",
    updatedAt: "2026-02-01T09:00:00Z",
    days: [
      day(0, true, slot("11:00", "18:00")),  // Sun
      day(1, false),                          // Mon
      day(2, false),                          // Tue
      day(3, true, slot("11:00", "20:00")),  // Wed
      day(4, true, slot("11:00", "20:00")),  // Thu
      day(5, true, slot("11:00", "20:00")),  // Fri
      day(6, true, slot("10:00", "18:00")),  // Sat
    ],
  },
];

/* ── Date overrides ──────────────────────────────────────────────────── */
// Dates relative to today (2026-02-28)

export const MOCK_OVERRIDES: AvailabilityOverride[] = [
  {
    id: "ov-1",
    staffId: "s1",
    date: "2026-03-06", // Alex: taking a Friday off
    isWorking: false,
    slots: [],
    note: "Annual leave",
    createdAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "ov-2",
    staffId: "s1",
    date: "2026-03-14", // Alex: short Saturday
    isWorking: true,
    slots: [slot("10:00", "13:00")],
    note: "Leaving early for family event",
    createdAt: "2026-02-22T11:00:00Z",
  },
  {
    id: "ov-3",
    staffId: "s2",
    date: "2026-03-04", // Jamie: extra Wednesday evening slot
    isWorking: true,
    slots: [slot("10:00", "13:00"), slot("14:00", "21:00")],
    note: "Late night by request — open until 9 pm",
    createdAt: "2026-02-25T09:00:00Z",
  },
  {
    id: "ov-4",
    staffId: "s3",
    date: "2026-03-07", // Casey: added Saturday (usually off)
    isWorking: true,
    slots: [slot("09:00", "14:00")],
    note: "Covering for a colleague",
    createdAt: "2026-02-26T14:00:00Z",
  },
  {
    id: "ov-5",
    staffId: "s5",
    date: "2026-03-02", // Taylor: taking Monday off (planned leave)
    isWorking: false,
    slots: [],
    note: "Medical appointment",
    createdAt: "2026-02-24T08:00:00Z",
  },
  {
    id: "ov-6",
    staffId: "s2",
    date: "2026-03-28", // Jamie: taking a Saturday off
    isWorking: false,
    slots: [],
    note: "Public holiday swap",
    createdAt: "2026-02-27T16:00:00Z",
  },
];
