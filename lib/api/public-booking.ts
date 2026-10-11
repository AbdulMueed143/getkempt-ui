/**
 * Public booking data access layer.
 *
 * TODAY: returns mock data with a small simulated network delay.
 * LATER: swap each function body for a `fetch(`${API_URL}/public/...`)` call.
 * The function signatures and return shapes are the contract the backend
 * must honour, so UI code never changes when the real API lands.
 */

import { MOCK_STORE_PROFILE } from "@/lib/mock/store-profile";
import { MOCK_STAFF } from "@/lib/mock/staff";
import { MOCK_SERVICES } from "@/lib/mock/services";
import { MOCK_PACKAGES } from "@/lib/mock/packages";
import { MOCK_BOOKINGS } from "@/lib/mock/bookings";
import { generateSlots } from "@/lib/utils/booking-slots";
import {
  calculateBasePrice,
  calculateFinalPrice,
} from "@/lib/utils/package-calculations";
import { slugify } from "@/lib/utils/slug";
import type { BusinessType } from "@/types/store-profile";
import type { ServiceCategory } from "@/types/service";
import type {
  BusinessPublicProfile,
  BookableService,
  BookableStaff,
  BookablePackage,
  BookingSelection,
  TimeSlot,
  DayAvailability,
  CreatePublicBookingInput,
  PublicBookingResult,
  PaymentIntent,
} from "@/types/public-booking";

/* ── Simulated latency so loading states are real during development ─────── */
const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));

/**
 * Which service categories each business type surfaces. This keeps the demo
 * business-type-agnostic: a nail salon shows nail/beauty work, a barbershop
 * shows barber/hair, etc. Unlisted types fall back to "everything".
 */
const CATEGORIES_BY_TYPE: Partial<Record<BusinessType, ServiceCategory[]>> = {
  barbershop:      ["barber", "hair"],
  hair_salon:      ["hair"],
  nail_salon:      ["nails", "beauty"],
  beauty_salon:    ["beauty", "lash_brow", "nails"],
  day_spa:         ["beauty", "massage", "lash_brow"],
  massage_studio:  ["massage", "beauty"],
  wellness_centre: ["massage", "beauty"],
  cosmetic_studio: ["beauty", "lash_brow"],
};

function allowedCategories(type: BusinessType): ServiceCategory[] | null {
  return CATEGORIES_BY_TYPE[type] ?? null; // null → allow all
}

/* ── Mock business registry (keyed by slug) ──────────────────────────────── */
const PRIMARY_SLUG = slugify(MOCK_STORE_PROFILE.shopName); // "the-kempt-studio"
const NAIL_SLUG = "polished-nail-lounge";

const MOCK_BUSINESSES: Record<string, BusinessPublicProfile> = {
  [PRIMARY_SLUG]: {
    slug:         PRIMARY_SLUG,
    shopName:     MOCK_STORE_PROFILE.shopName,
    businessType: MOCK_STORE_PROFILE.businessType,
    description:  MOCK_STORE_PROFILE.description,
    logo:         MOCK_STORE_PROFILE.logo,
    phone:        MOCK_STORE_PROFILE.phone,
    email:        MOCK_STORE_PROFILE.email,
    website:      MOCK_STORE_PROFILE.website,
    address:      MOCK_STORE_PROFILE.address,
    instagram:    MOCK_STORE_PROFILE.instagram,
    facebook:     MOCK_STORE_PROFILE.facebook,
    tiktok:       MOCK_STORE_PROFILE.tiktok,
    rating:       4.9,
    reviewCount:  212,
    timezone:     "Australia/Melbourne",
    bookingHorizonDays: 35, // ~5 weeks
    payments: {
      enabled:      true,
      captureMode:  "deposit",
      depositType:  "percentage",
      depositValue: 20,
      currency:     "AUD",
      methods:      ["apple_pay", "google_pay", "card"],
    },
    cancellation: {
      summary:
        "Free cancellation up to 24 hours before. Inside 24 hours your deposit is retained; no-shows are charged in full.",
      policyText:
        "We understand plans change. You can reschedule or cancel free of charge up to 24 hours before your appointment. Cancellations within 24 hours forfeit the deposit, and no-shows are charged the full service price.",
      freeUntilHours: 24,
    },
  },

  // Second business — demonstrates the flow is not barber-specific.
  [NAIL_SLUG]: {
    slug:         NAIL_SLUG,
    shopName:     "Polished Nail Lounge",
    businessType: "nail_salon",
    description:
      "Boutique nail & beauty studio in the heart of Fitzroy. Gel, acrylics, and lash artistry by an award-winning team.",
    logo:         undefined,
    phone:        "+61 3 9411 8820",
    email:        "hello@polishednails.com.au",
    website:      "https://polishednails.com.au",
    address: {
      line1:    "58 Brunswick Street",
      suburb:   "Fitzroy",
      state:    "VIC",
      postcode: "3065",
      country:  "Australia",
    },
    instagram:    "polishednaillounge",
    facebook:     "",
    tiktok:       "polishednails",
    rating:       4.8,
    reviewCount:  164,
    timezone:     "Australia/Melbourne",
    bookingHorizonDays: 21, // ~3 weeks
    payments: {
      enabled:      true,
      captureMode:  "deposit",
      depositType:  "fixed",
      depositValue: 20,
      currency:     "AUD",
      methods:      ["apple_pay", "google_pay", "card"],
    },
    cancellation: {
      summary:
        "Free cancellation up to 48 hours before. Inside 48 hours a 50% fee applies; no-shows are charged in full.",
      policyText:
        "Please give us at least 48 hours' notice to cancel or reschedule. Cancellations within 48 hours incur a 50% fee, and no-shows are charged the full booking amount.",
      freeUntilHours: 48,
    },
  },
};

/* ── Business ────────────────────────────────────────────────────────────── */

/** All known business slugs — used by generateStaticParams at build time. */
export function getAllBusinessSlugs(): string[] {
  return Object.keys(MOCK_BUSINESSES);
}

export async function getBusinessBySlug(
  slug: string
): Promise<BusinessPublicProfile | null> {
  await delay(300);
  // TODO(api): GET `${API_URL}/public/businesses/${slug}`
  return MOCK_BUSINESSES[slug] ?? null;
}

/* ── Catalogue ───────────────────────────────────────────────────────────── */

export async function getBookableServices(
  slug: string
): Promise<BookableService[]> {
  await delay();
  // TODO(api): GET `${API_URL}/public/businesses/${slug}/services`
  const business = MOCK_BUSINESSES[slug];
  const cats = business ? allowedCategories(business.businessType) : null;

  return MOCK_SERVICES.filter(
    (s) =>
      s.status === "active" &&
      s.onlineBookingEnabled &&
      (!cats || cats.includes(s.category))
  ).map((s) => ({
    id:              s.id,
    name:            s.name,
    description:     s.description,
    category:        s.category,
    durationMinutes: s.durationMinutes,
    price:           s.price,
    image:           s.image,
  }));
}

export async function getBookablePackages(
  slug: string
): Promise<BookablePackage[]> {
  await delay();
  // TODO(api): GET `${API_URL}/public/businesses/${slug}/packages`
  const business = MOCK_BUSINESSES[slug];
  const cats = business ? allowedCategories(business.businessType) : null;

  return MOCK_PACKAGES.filter((p) => {
    if (p.status !== "active" || !p.onlineBookingEnabled) return false;
    if (!cats) return true;
    // Keep packages whose services all fall within the allowed categories.
    return p.serviceIds.every((id) => {
      const svc = MOCK_SERVICES.find((s) => s.id === id);
      return svc ? cats.includes(svc.category) : false;
    });
  }).map((p) => {
    const services = p.serviceIds
      .map((id) => MOCK_SERVICES.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));

    const basePrice = calculateBasePrice(services);
    const price = p.discountEnabled
      ? calculateFinalPrice(basePrice, p.discountType, p.discountValue)
      : basePrice;

    const duration =
      p.customDurationMinutes ??
      services.reduce((sum, s) => sum + s.durationMinutes, 0);

    return {
      id:              p.id,
      name:            p.name,
      description:     p.description,
      durationMinutes: duration,
      price,
      basePrice,
      serviceNames:    services.map((s) => s.name),
      image:           p.image,
    };
  });
}

/* ── Staff eligibility ───────────────────────────────────────────────────── */

const activeStaff = () => MOCK_STAFF.filter((s) => s.status === "active");

/** Staff ids that can perform a single selection (empty list → anyone). */
function eligibleIdsForSelection(sel: BookingSelection): string[] {
  const allActive = activeStaff().map((s) => s.id);
  if (sel.kind === "service") {
    const svc = MOCK_SERVICES.find((s) => s.id === sel.id);
    const ids = svc?.staffIds ?? [];
    return ids.length ? ids.filter((id) => allActive.includes(id)) : allActive;
  }
  const pkg = MOCK_PACKAGES.find((p) => p.id === sel.id);
  const ids = pkg?.staffIds ?? [];
  return ids.length ? ids.filter((id) => allActive.includes(id)) : allActive;
}

/** Staff who can perform EVERY selected item (intersection). */
function eligibleIdsForSelections(selections: BookingSelection[]): string[] {
  if (selections.length === 0) return activeStaff().map((s) => s.id);
  let ids = eligibleIdsForSelection(selections[0]);
  for (const sel of selections.slice(1)) {
    const next = new Set(eligibleIdsForSelection(sel));
    ids = ids.filter((id) => next.has(id));
  }
  return ids;
}

function toBookableStaff(id: string): BookableStaff | null {
  const s = MOCK_STAFF.find((m) => m.id === id);
  if (!s) return null;
  return {
    id:             s.id,
    name:           `${s.firstName} ${s.lastName}`,
    specialization: s.specialization,
    avatarImage:    s.avatarImage,
    avatarColor:    s.avatarColor,
  };
}

/**
 * Staff a customer can pick given everything in their basket. A single staff
 * member performs the whole appointment, so this is the intersection of the
 * eligible staff for each selected service/package.
 */
export async function getEligibleStaff(
  _slug: string,
  selections: BookingSelection[]
): Promise<BookableStaff[]> {
  await delay();
  // TODO(api): GET `${API_URL}/public/businesses/${slug}/staff?serviceIds=...`
  return eligibleIdsForSelections(selections)
    .map(toBookableStaff)
    .filter((s): s is BookableStaff => Boolean(s));
}

/* ── Availability ────────────────────────────────────────────────────────── */

/** Synchronous slot computation shared by the day + slot endpoints. */
function computeSlots(
  staffId: string | null,
  eligibleStaffIds: string[],
  date: string,
  durationMinutes: number
): TimeSlot[] {
  if (durationMinutes <= 0) return [];

  if (staffId) {
    return generateSlots(staffId, date, durationMinutes, MOCK_BOOKINGS);
  }

  // "Any available": union of every eligible staff member's free slots.
  const perStaff = eligibleStaffIds.map((id) =>
    generateSlots(id, date, durationMinutes, MOCK_BOOKINGS)
  );
  if (perStaff.length === 0) return [];

  return perStaff[0].map((slot, i) => ({
    time:      slot.time,
    available: perStaff.some((slots) => slots[i]?.available),
  }));
}

function toLocalYmd(d: Date): string {
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

/**
 * Day-by-day availability from today up to the business booking horizon.
 * `staffId === null` → a day counts as available if ANY eligible staff is free.
 */
export async function getAvailableDays(params: {
  slug:             string;
  staffId:          string | null;
  eligibleStaffIds: string[];
  durationMinutes:  number;
  horizonDays:      number;
}): Promise<DayAvailability[]> {
  await delay(400);
  // TODO(api): GET `${API_URL}/public/businesses/${slug}/available-days?...`
  const { staffId, eligibleStaffIds, durationMinutes, horizonDays } = params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: Math.max(1, horizonDays) }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const ymd = toLocalYmd(d);
    const slots = computeSlots(staffId, eligibleStaffIds, ymd, durationMinutes);
    return { date: ymd, available: slots.some((s) => s.available) };
  });
}

/** Available start times for a specific day. */
export async function getAvailableSlots(params: {
  slug:             string;
  staffId:          string | null;
  eligibleStaffIds: string[];
  date:             string;   // YYYY-MM-DD
  durationMinutes:  number;
}): Promise<TimeSlot[]> {
  await delay(350);
  // TODO(api): GET `${API_URL}/public/businesses/${slug}/availability?...`
  return computeSlots(
    params.staffId,
    params.eligibleStaffIds,
    params.date,
    params.durationMinutes
  );
}

/* ── Create booking ──────────────────────────────────────────────────────── */

function makeReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `KMPT-${out}`;
}

/** Convert a business-local date+time to an ISO UTC string (mock: AEDT UTC+11). */
function toUtcIso(date: string, time: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min]  = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, h - 11, min)).toISOString();
}

function sumDuration(selections: BookingSelection[]): number {
  return selections.reduce((sum, s) => sum + s.durationMinutes, 0);
}

function sumPrice(selections: BookingSelection[]): number {
  return selections.reduce((sum, s) => sum + s.price, 0);
}

export async function createPublicBooking(
  input: CreatePublicBookingInput
): Promise<PublicBookingResult> {
  await delay(700);
  // TODO(api): POST `${API_URL}/public/bookings`

  const business = MOCK_BUSINESSES[input.businessSlug];
  const eligible = await getEligibleStaff(input.businessSlug, input.selections);

  const staff =
    input.staffId != null
      ? eligible.find((s) => s.id === input.staffId) ?? eligible[0]
      : eligible[0];

  const totalDuration = sumDuration(input.selections);
  const price = sumPrice(input.selections);

  const startAt = toUtcIso(input.date, input.startTime);
  const endAt = new Date(
    new Date(startAt).getTime() + totalDuration * 60_000
  ).toISOString();

  const payments = business?.payments;
  const amountPaid = payments ? computeAmountDueNow(price, payments) : 0;

  return {
    bookingId:       `bk_${Date.now()}`,
    reference:       makeReference(),
    businessName:    business?.shopName ?? "Your appointment",
    staffName:       staff?.name ?? "Any available",
    serviceNames:    input.selections.map((s) => s.name),
    durationMinutes: totalDuration,
    price,
    startAt,
    endAt,
    status:          "confirmed",
    amountPaid,
    amountDue:       Math.max(0, price - amountPaid),
    currency:        payments?.currency ?? "AUD",
  };
}

/* ── Payment (Stripe-ready stub) ─────────────────────────────────────────── */

/**
 * Creates a PaymentIntent for the amount due now.
 *
 * STUB: returns a fake client secret so the UI flow works end-to-end.
 * REAL: this MUST call the backend — a PaymentIntent can only be created
 * server-side with the Stripe secret key. The frontend then confirms it with
 * Stripe.js using the returned clientSecret.
 *   POST `${API_URL}/public/payments/intent`  { slug, bookingDraft } → { clientSecret }
 */
export async function createPaymentIntent(params: {
  slug:     string;
  amount:   number;   // major units, e.g. dollars
  currency: string;
}): Promise<PaymentIntent> {
  await delay(500);
  return {
    clientSecret: `pi_mock_${Math.random().toString(36).slice(2)}_secret`,
    amount:       Math.round(params.amount * 100),
    currency:     params.currency.toLowerCase(),
  };
}

/** Amount the customer pays now, based on the business payment settings. */
export function computeAmountDueNow(
  price: number,
  payments: BusinessPublicProfile["payments"]
): number {
  if (!payments.enabled || payments.captureMode === "none") return 0;
  if (payments.captureMode === "full") return price;
  if (payments.captureMode === "deposit" && payments.depositValue != null) {
    return payments.depositType === "percentage"
      ? Math.round(price * (payments.depositValue / 100) * 100) / 100
      : Math.min(price, payments.depositValue);
  }
  return 0;
}
