/* ── Service categories ─────────────────────────── */
export type ServiceCategory =
  | "hair"
  | "barber"
  | "nails"
  | "beauty"
  | "lash_brow"
  | "massage"
  | "other";

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  hair:      "Hair",
  barber:    "Barber",
  nails:     "Nails",
  beauty:    "Beauty",
  lash_brow: "Lash & Brow",
  massage:   "Massage & Body",
  other:     "Other",
};

export const CATEGORY_COLORS: Record<ServiceCategory, { color: string; bg: string }> = {
  hair:      { color: "#1B3163", bg: "#EEF1F8" },
  barber:    { color: "#92400E", bg: "#FEF3C7" },
  nails:     { color: "#9D174D", bg: "#FCE7F3" },
  beauty:    { color: "#6B21A8", bg: "#F3E8FF" },
  lash_brow: { color: "#065F46", bg: "#D1FAE5" },
  massage:   { color: "#0F766E", bg: "#CCFBF1" },
  other:     { color: "#374151", bg: "#F3F4F6" },
};

/* ── Status ─────────────────────────────────────── */
export type ServiceStatus = "active" | "inactive";

/* ── Core service record ────────────────────────── */
export interface Service {
  id: string;

  /* Identity */
  name:        string;
  category:    ServiceCategory;
  description: string;
  /** Optional cover image — data URL or CDN URL */
  image?:      string;

  /* Timing */
  durationMinutes: number;   // service time
  bufferMinutes:   number;   // cleanup/prep gap after service

  /* Pricing */
  price:           number;
  depositRequired: boolean;
  depositAmount:   number | null;  // fixed $ amount

  /* Availability */
  status:               ServiceStatus;
  onlineBookingEnabled: boolean;

  /* Staff assignment */
  staffIds: string[];    // which staff can perform this

  /* Metadata */
  createdAt: string;
}

/* ── Form values ────────────────────────────────── */
export interface ServiceFormValues {
  name:                 string;
  category:             ServiceCategory;
  image?:               string;
  description:          string;
  durationMinutes:      number;
  bufferMinutes:        number;
  price:                number;
  depositRequired:      boolean;
  depositAmount:        number | null;
  status:               ServiceStatus;
  onlineBookingEnabled: boolean;
  staffIds:             string[];
}
