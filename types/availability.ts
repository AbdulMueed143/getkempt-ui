/**
 * Availability domain types.
 *
 * Weekly schedules define recurring shifts per staff member.
 * Date-specific overrides supersede the weekly schedule for a single day.
 *
 * Times in the UI are in the shop's local timezone; the backend stores
 * everything as UTC so the system works across timezones.
 */

/** 0 = Sunday … 6 = Saturday (matches JS Date.prototype.getDay()) */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const DAY_SHORT: Record<DayOfWeek, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

/** Mon → Sun — ISO week order used in AU/UK */
export const WEEK_DISPLAY_ORDER: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

/**
 * Slot type determines bookability.
 * - "work"  → bookable time, shown on the public calendar
 * - "break" → blocked time (e.g. lunch), shown to staff only — cannot be booked
 */
export type SlotType = "work" | "break";

/** A contiguous period within a working day */
export interface TimeSlot {
  id: string;
  /** "HH:MM" 24-hour in shop timezone. Backend converts to UTC before persisting. */
  startTime: string;
  /** "HH:MM" 24-hour in shop timezone. Must be after startTime. */
  endTime: string;
  /** Defaults to "work" when omitted */
  type: SlotType;
  /** Optional human label, e.g. "Morning session", "Lunch break" */
  label?: string;
}

/** One day in a staff member's weekly schedule */
export interface DaySchedule {
  dayOfWeek: DayOfWeek;
  isWorking: boolean;
  /** Empty array when isWorking = false. Multiple slots = split shift with gaps. */
  slots: TimeSlot[];
}

/** Recurring weekly schedule for a staff member */
export interface WeeklySchedule {
  staffId: string;
  /** IANA timezone identifier, e.g. "Australia/Melbourne" */
  timezone: string;
  /** Exactly 7 entries — one per day of the week */
  days: DaySchedule[];
  /** ISO UTC — when the schedule was last saved */
  updatedAt: string;
}

/** Overrides the weekly schedule for a specific calendar date */
export interface AvailabilityOverride {
  id: string;
  staffId: string;
  /**
   * "YYYY-MM-DD" in the shop's local timezone.
   * Backend persists this as UTC midnight of that local date.
   */
  date: string;
  /** false = staff is unavailable all day (e.g. sick day, public holiday) */
  isWorking: boolean;
  /** Empty when isWorking = false */
  slots: TimeSlot[];
  note?: string;
  /** ISO UTC */
  createdAt: string;
}
