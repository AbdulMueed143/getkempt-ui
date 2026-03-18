export type BookingStatus =
  | "confirmed"   // booked and confirmed
  | "pending"     // awaiting confirmation
  | "completed"   // service delivered
  | "cancelled"   // cancelled before appointment
  | "no_show";    // client did not arrive

export type BookingSource = "app" | "manual" | "walk_in";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  pending:   "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show:   "No-show",
};

export const BOOKING_STATUS_STYLES: Record<
  BookingStatus,
  { bg: string; text: string; border: string }
> = {
  confirmed: { bg: "#EEF1F8", text: "#1B3163", border: "#C3CEE8" },
  pending:   { bg: "#FEF9C3", text: "#92400E", border: "#FDE68A" },
  completed: { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" },
  cancelled: { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
  no_show:   { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
};

/** One calendar colour per staff member, used in the time-grid views */
export const STAFF_CAL_COLORS: Record<string, string> = {
  s1: "#1B3163", // Alex   — Royal Indigo
  s2: "#7C3AED", // Jamie  — Violet
  s3: "#0369A1", // Casey  — Teal-Blue
  s4: "#047857", // Morgan — Emerald
  s5: "#B45309", // Taylor — Amber
};

export interface Booking {
  id: string;

  clientName:   string;
  clientId?:    string;
  clientPhone?: string;
  clientEmail?: string;

  staffId:   string;
  staffName: string;

  serviceId?:  string;
  packageId?:  string;
  serviceName: string;
  durationMinutes: number;
  price: number;

  /** ISO-8601 UTC — use local timezone for display */
  startAt: string;
  endAt:   string;

  status: BookingStatus;
  source: BookingSource;
  notes?: string;

  createdAt: string;
}

/** Minimal shape used inside the create-booking form */
export interface BookingFormValues {
  staffId:    string;
  serviceId:  string;
  isPackage:  boolean;
  date:       string; // YYYY-MM-DD (local)
  startTime:  string; // HH:MM (24h local)
  clientName:  string;
  clientPhone: string;
  clientEmail: string;
  notes:       string;
}
