/* ── Channels ─────────────────────────────────────── */
export type ReminderChannel = "email" | "sms" | "push";

export const CHANNEL_LABELS: Record<ReminderChannel, string> = {
  email: "Email",
  sms:   "SMS",
  push:  "Push notification",
};

export const CHANNEL_COLORS: Record<ReminderChannel, { bg: string; text: string; border: string }> = {
  email: { bg: "#EEF1F8", text: "#1B3163", border: "#C7D2E8" },
  sms:   { bg: "#F5F0FF", text: "#7C3AED", border: "#DDD6FE" },
  push:  { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
};

/* ── Timing ───────────────────────────────────────── */
export type TimingDirection = "immediately" | "before" | "after";
export type TimingUnit      = "minutes" | "hours" | "days";

export interface ReminderTiming {
  direction: TimingDirection;
  value:     number;
  unit:      TimingUnit;
}

export const TIMING_PRESETS: { label: string; timing: ReminderTiming }[] = [
  { label: "Immediately",  timing: { direction: "immediately", value: 0,  unit: "minutes" } },
  { label: "30 min before", timing: { direction: "before",     value: 30, unit: "minutes" } },
  { label: "1 hr before",  timing: { direction: "before",     value: 1,  unit: "hours"   } },
  { label: "2 hrs before", timing: { direction: "before",     value: 2,  unit: "hours"   } },
  { label: "4 hrs before", timing: { direction: "before",     value: 4,  unit: "hours"   } },
  { label: "24 hrs before", timing: { direction: "before",    value: 24, unit: "hours"   } },
  { label: "48 hrs before", timing: { direction: "before",    value: 48, unit: "hours"   } },
  { label: "1 hr after",   timing: { direction: "after",      value: 1,  unit: "hours"   } },
  { label: "24 hrs after", timing: { direction: "after",      value: 24, unit: "hours"   } },
  { label: "48 hrs after", timing: { direction: "after",      value: 48, unit: "hours"   } },
];

/* ── Events ───────────────────────────────────────── */
export type ReminderEvent =
  | "booking_confirmed"
  | "appointment_reminder"
  | "appointment_followup"
  | "booking_cancelled"
  | "booking_rescheduled";

export const EVENT_META: Record<
  ReminderEvent,
  { label: string; description: string; color: string; icon: string; canHaveMultiple: boolean }
> = {
  booking_confirmed: {
    label:           "Booking Confirmed",
    description:     "Sent immediately when a booking is created or accepted",
    color:           "#047857",
    icon:            "✅",
    canHaveMultiple: false,
  },
  appointment_reminder: {
    label:           "Appointment Reminder",
    description:     "Sent before the appointment — add multiple reminders at different lead times",
    color:           "#1B3163",
    icon:            "🔔",
    canHaveMultiple: true,
  },
  appointment_followup: {
    label:           "Post-visit Follow-up",
    description:     "Sent after the appointment — ask for a review or share loyalty progress",
    color:           "#B45309",
    icon:            "⭐",
    canHaveMultiple: false,
  },
  booking_cancelled: {
    label:           "Booking Cancelled",
    description:     "Sent when a booking is cancelled by owner or client",
    color:           "#DC2626",
    icon:            "❌",
    canHaveMultiple: false,
  },
  booking_rescheduled: {
    label:           "Booking Rescheduled",
    description:     "Sent when an appointment is moved to a new date or time",
    color:           "#7C3AED",
    icon:            "📅",
    canHaveMultiple: false,
  },
};

/* ── Template variables ───────────────────────────── */
export interface TemplateVariable {
  key:         string;
  label:       string;
  example:     string;
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: "{{client_name}}",       label: "Client name",        example: "Marcus" },
  { key: "{{service_name}}",      label: "Service",            example: "Fade + Beard Trim" },
  { key: "{{staff_name}}",        label: "Staff member",       example: "Alex" },
  { key: "{{appointment_date}}", label: "Appointment date",   example: "Friday, 6 Mar" },
  { key: "{{appointment_time}}", label: "Appointment time",   example: "2:30 PM" },
  { key: "{{shop_name}}",         label: "Shop name",          example: "Heritage Barbershop" },
  { key: "{{shop_address}}",      label: "Shop address",       example: "42 Smith St, Fitzroy" },
  { key: "{{manage_link}}",       label: "Manage booking link", example: "https://book.getsquire.com/…" },
  { key: "{{cancel_link}}",       label: "Cancel link",        example: "https://book.getsquire.com/…" },
];

/* ── Rule ─────────────────────────────────────────── */
export interface ReminderTemplate {
  emailSubject: string;
  emailBody:    string;
  smsBody:      string;
  pushTitle:    string;
  pushBody:     string;
}

export interface ReminderRule {
  id:       string;
  event:    ReminderEvent;
  timing:   ReminderTiming;
  channels: ReminderChannel[];
  enabled:  boolean;
  template: ReminderTemplate;
}

/* ── Global settings ──────────────────────────────── */
export interface GlobalReminderSettings {
  masterEnabled:           boolean;
  smsCreditsRemaining:     number;
  smsCreditsUsedThisMonth: number;
  emailsUsedThisMonth:     number;
  pushUsedThisMonth:       number;
}

/* ── Stats ────────────────────────────────────────── */
export interface ReminderStats {
  totalSentThisMonth:    number;
  emailDeliveryRate:     number; // percentage 0-100
  smsDeliveryRate:       number;
  openRate:              number;
  noShowRateBefore:      number;
  noShowRateAfter:       number;
}
