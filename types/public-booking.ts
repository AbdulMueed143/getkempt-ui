import type { BusinessType, StoreAddress } from "@/types/store-profile";

/**
 * Public-facing shapes for the customer booking experience
 * (bookings.getkempt.co/<slug>).
 *
 * These intentionally expose ONLY what a prospective customer should see —
 * no staff pay, no internal notes, no private contact rules. When the Java
 * backend is ready, `lib/api/public-booking.ts` will return these same shapes
 * from real endpoints.
 */

/* ── Payment configuration a business can toggle ─────────────────────────── */
export type PaymentMethod = "card" | "apple_pay" | "google_pay";

export interface BusinessPaymentSettings {
  /** Master switch — when false the booking completes without any payment step. */
  enabled: boolean;
  /**
   * How much the customer pays at the time of booking:
   *  - "full"    → the whole service price
   *  - "deposit" → a deposit only (see depositType/depositValue)
   *  - "none"    → nothing now, pay in-store (but card may still be held)
   */
  captureMode: "full" | "deposit" | "none";
  depositType:  "percentage" | "fixed" | null;
  depositValue: number | null;
  currency: string;           // ISO 4217, e.g. "AUD"
  methods: PaymentMethod[];   // which wallets/cards are offered
}

/* ── Cancellation policy (customer-facing subset) ────────────────────────── */
export interface PublicCancellationPolicy {
  /** One-line summary, e.g. "Free cancellation up to 24 hours before." */
  summary:        string;
  /** Full policy text the shop authored. */
  policyText:     string;
  /**
   * Hours before the appointment up to which cancelling is free. Inside this
   * window a fee may apply. `null` → always free / no fee configured.
   */
  freeUntilHours: number | null;
}

/* ── Business public profile ─────────────────────────────────────────────── */
export interface BusinessPublicProfile {
  slug:         string;
  shopName:     string;
  businessType: BusinessType;
  description?: string;
  logo?:        string;
  coverImage?:  string;

  phone:    string;
  email:    string;
  website?: string;

  address: StoreAddress;

  instagram?: string;
  facebook?:  string;
  tiktok?:    string;

  /** Aggregate review signal for social proof (optional). */
  rating?:      number;   // 0–5
  reviewCount?: number;

  timezone: string;       // IANA, e.g. "Australia/Melbourne"

  /**
   * How many days into the future customers may book. Comes from the business
   * (some shops only open bookings ~4 weeks out). Days beyond this are hidden.
   */
  bookingHorizonDays: number;

  payments: BusinessPaymentSettings;

  /** Cancellation terms surfaced to customers before they book. */
  cancellation: PublicCancellationPolicy;
}

/* ── Bookable catalogue items (trimmed of internal fields) ───────────────── */
export interface BookableService {
  id:              string;
  name:            string;
  description:     string;
  category:        string;
  durationMinutes: number;
  price:           number;
  image?:          string;
}

export interface BookableStaff {
  id:             string;
  name:           string;
  specialization: string;
  avatarImage?:   string;
  avatarColor:    string;
}

export interface BookablePackage {
  id:              string;
  name:            string;
  description:     string;
  durationMinutes: number;
  price:           number;         // final price after any discount
  basePrice:       number;         // pre-discount, for showing savings
  serviceNames:    string[];
  image?:          string;
}

/* ── Availability ────────────────────────────────────────────────────────── */
export interface TimeSlot {
  /** "HH:MM" 24h, local to the business timezone. */
  time:      string;
  available: boolean;
}

export interface DayAvailability {
  date:      string;   // YYYY-MM-DD (business-local)
  available: boolean;  // has at least one bookable slot
}

/* ── What the customer is assembling ─────────────────────────────────────── */
export type SelectionKind = "service" | "package";

export interface BookingSelection {
  kind:            SelectionKind;
  id:              string;   // service id or package id
  name:            string;
  durationMinutes: number;
  price:           number;
}

export interface CustomerDetails {
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  notes?:    string;
}

/** Payload sent to the backend to create a booking. */
export interface CreatePublicBookingInput {
  businessSlug: string;
  /** One or more services/packages booked into a single appointment. */
  selections:   BookingSelection[];
  /** null → "any available" staff. */
  staffId:      string | null;
  date:         string;   // YYYY-MM-DD (business-local)
  startTime:    string;   // HH:MM 24h (business-local)
  customer:     CustomerDetails;
}

/** What the backend returns after a booking is created. */
export interface PublicBookingResult {
  bookingId:       string;
  reference:       string;   // human-friendly, e.g. "KMPT-8F3A"
  businessName:    string;
  staffName:       string;
  serviceNames:    string[]; // every service/package in the appointment
  durationMinutes: number;
  price:           number;
  startAt:         string;   // ISO-8601 UTC
  endAt:           string;   // ISO-8601 UTC
  status:          "confirmed" | "pending_payment";
  amountPaid:      number;
  amountDue:       number;
  currency:        string;
}

/** Stripe-style payment intent (stubbed for now). */
export interface PaymentIntent {
  clientSecret: string;
  amount:       number;   // minor units (cents)
  currency:     string;
}
