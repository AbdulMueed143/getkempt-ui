export type BookingWindowUnit = "days" | "weeks" | "months";

export const BOOKING_WINDOW_UNIT_LABELS: Record<BookingWindowUnit, string> = {
  days:   "days",
  weeks:  "weeks",
  months: "months",
};

/** Allowed slot interval values in minutes */
export const SLOT_INTERVALS = [5, 10, 15, 20, 30, 45, 60] as const;
export type SlotInterval = (typeof SLOT_INTERVALS)[number];

export type SurchargeType = "percentage" | "fixed_aud";

export const SURCHARGE_TYPE_LABELS: Record<SurchargeType, string> = {
  percentage: "% of service price",
  fixed_aud:  "Fixed amount (AUD)",
};

export type SurchargeDay =
  | "monday" | "tuesday" | "wednesday"
  | "thursday" | "friday" | "saturday" | "sunday";

export const ALL_DAYS: SurchargeDay[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

export const DAY_LABELS: Record<SurchargeDay, string> = {
  monday:    "Mon",
  tuesday:   "Tue",
  wednesday: "Wed",
  thursday:  "Thu",
  friday:    "Fri",
  saturday:  "Sat",
  sunday:    "Sun",
};

/** A named holiday or custom closure */
export interface Holiday {
  id: string;
  name:     string;
  date:     string;   // "YYYY-MM-DD"
  /** "all" = every staff member; array = specific staff IDs */
  appliesTo: "all" | string[];
  hasSurcharge:    boolean;
  surchargeType?:  SurchargeType;
  surchargeValue?: number;
}

/**
 * A rule that applies a surcharge based on the day of the week
 * and/or a time window within that day.
 */
export interface SurchargeRule {
  id:      string;
  name:    string;
  isActive: boolean;

  /** Days of the week this rule fires on (empty = every day) */
  days: SurchargeDay[];

  /** If set, rule only applies during this time window (HH:MM) */
  timeStart?: string;
  timeEnd?:   string;

  surchargeType:  SurchargeType;
  surchargeValue: number;
}

export interface StoreSettings {
  /* Scheduling */
  bookingWindowValue: number;
  bookingWindowUnit:  BookingWindowUnit;
  slotInterval:       number;

  /* Holidays & closures */
  holidays: Holiday[];

  /* Surcharge rules */
  surchargeRules: SurchargeRule[];

  /* Policies */
  cancellationPolicy:      string;
  minCancellationHours:    number;  // 0 = no minimum
  cancellationFeePercent:  number;  // 0 = no fee
  privacyPolicy:           string;
}
