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

// ── Payment types ──────────────────────────────────────────────────

/** How the shop requires clients to pay */
export type PaymentMode = "in_store" | "deposit" | "full_upfront";

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  in_store:    "Pay in store",
  deposit:     "Deposit required",
  full_upfront: "Full payment at booking",
};

export const PAYMENT_MODE_DESCRIPTIONS: Record<PaymentMode, string> = {
  in_store:    "Clients pay on the day. No upfront charge.",
  deposit:     "Clients pay a deposit to hold the slot. Balance collected in store.",
  full_upfront: "Clients pay the full service price when they book.",
};

export type DepositType = "percentage" | "fixed_aud";

export const DEPOSIT_TYPE_LABELS: Record<DepositType, string> = {
  percentage: "% of service price",
  fixed_aud:  "Fixed amount (AUD)",
};

export type FeeType = "percentage" | "fixed_aud" | "none";

export const FEE_TYPE_LABELS: Record<FeeType, string> = {
  percentage: "% of service price",
  fixed_aud:  "Fixed amount (AUD)",
  none:       "No charge",
};

export type InStoreMethod = "card" | "cash" | "bank_transfer";

export const IN_STORE_METHOD_LABELS: Record<InStoreMethod, string> = {
  card:          "Card / EFTPOS",
  cash:          "Cash",
  bank_transfer: "Bank Transfer",
};

// ── Cancellation fee rule ──────────────────────────────────────────

/**
 * A single tier in the cancellation fee ladder.
 * "If a client cancels within `withinHours` hours of the appointment,
 *  charge them `feeValue` (`feeType`)."
 *
 * Rules are evaluated from tightest window outward. The first matching
 * rule wins. Cancellations outside all rules are free.
 */
export interface CancellationFeeRule {
  id:         string;
  label:      string;      // e.g. "Same day", "Within 24 hours"
  withinHours: number;     // e.g. 2, 24, 48
  feeType:    Exclude<FeeType, "none">;
  feeValue:   number;      // percentage (0-100) or AUD amount
}

// ── Preset cancellation templates ─────────────────────────────────

export interface CancellationTemplate {
  label:        string;
  description:  string;
  rules:        Omit<CancellationFeeRule, "id">[];
  noShowFeeType:  Exclude<FeeType, "none">;
  noShowFeeValue: number;
  autoCharge:   boolean;
}

export const CANCELLATION_TEMPLATES: CancellationTemplate[] = [
  {
    label:       "Strict",
    description: "Same-day 100%, within 24 h 50%, no-show 100%",
    rules: [
      { label: "Same day (within 2 h)",   withinHours: 2,  feeType: "percentage", feeValue: 100 },
      { label: "Within 24 hours",          withinHours: 24, feeType: "percentage", feeValue: 50  },
    ],
    noShowFeeType:  "percentage",
    noShowFeeValue: 100,
    autoCharge:     true,
  },
  {
    label:       "Moderate",
    description: "Within 6 h 100%, within 48 h 25%, no-show 100%",
    rules: [
      { label: "Within 6 hours",  withinHours: 6,  feeType: "percentage", feeValue: 100 },
      { label: "Within 48 hours", withinHours: 48, feeType: "percentage", feeValue: 25  },
    ],
    noShowFeeType:  "percentage",
    noShowFeeValue: 100,
    autoCharge:     false,
  },
  {
    label:       "Relaxed",
    description: "Within 2 h 25%, no-show 50%, no auto-charge",
    rules: [
      { label: "Within 2 hours", withinHours: 2, feeType: "percentage", feeValue: 25 },
    ],
    noShowFeeType:  "percentage",
    noShowFeeValue: 50,
    autoCharge:     false,
  },
  {
    label:       "No fees",
    description: "Free cancellations at any time",
    rules:          [],
    noShowFeeType:  "percentage",
    noShowFeeValue: 0,
    autoCharge:     false,
  },
];

// ── Store settings ─────────────────────────────────────────────────

export interface StoreSettings {
  /* Scheduling */
  bookingWindowValue: number;
  bookingWindowUnit:  BookingWindowUnit;
  slotInterval:       number;

  /* Holidays & closures */
  holidays: Holiday[];

  /* Surcharge rules */
  surchargeRules: SurchargeRule[];

  /* Payment setup */
  paymentMode:     PaymentMode;
  depositType:     DepositType;
  depositValue:    number;
  inStoreMethods:  InStoreMethod[];
  stripeConnected: boolean;

  /* No-show & cancellation fees */
  noShowFeeType:        FeeType;
  noShowFeeValue:       number;
  autoCharge:           boolean;
  cancellationFeeRules: CancellationFeeRule[];

  /* Text policies */
  cancellationPolicy: string;
  privacyPolicy:      string;
}
