import type {
  ReminderRule,
  GlobalReminderSettings,
  ReminderStats,
} from "@/types/reminders";

export const MOCK_GLOBAL_SETTINGS: GlobalReminderSettings = {
  masterEnabled:           true,
  smsCreditsRemaining:     843,
  smsCreditsUsedThisMonth: 157,
  emailsUsedThisMonth:     412,
  pushUsedThisMonth:       389,
};

export const MOCK_STATS: ReminderStats = {
  totalSentThisMonth: 958,
  emailDeliveryRate:  97.4,
  smsDeliveryRate:    98.1,
  openRate:           64.2,
  noShowRateBefore:   18,
  noShowRateAfter:    6,
};

export const MOCK_REMINDER_RULES: ReminderRule[] = [
  /* ── Booking confirmed ──────────────────────────── */
  {
    id:       "rule-confirm",
    event:    "booking_confirmed",
    timing:   { direction: "immediately", value: 0, unit: "minutes" },
    channels: ["email", "push"],
    enabled:  true,
    template: {
      emailSubject: "Your booking at {{shop_name}} is confirmed ✅",
      emailBody: `Hi {{client_name}},

Your appointment is confirmed! Here are the details:

📅 {{appointment_date}}
⏰ {{appointment_time}}
✂️ {{service_name}}
👤 with {{staff_name}}
📍 {{shop_address}}

Need to make changes? Manage your booking here:
{{manage_link}}

See you soon!
— The team at {{shop_name}}`,
      smsBody:    "Hi {{client_name}}, your booking at {{shop_name}} is confirmed for {{appointment_date}} at {{appointment_time}} with {{staff_name}}. Manage: {{manage_link}}",
      pushTitle:  "Booking confirmed 🎉",
      pushBody:   "{{service_name}} with {{staff_name}} on {{appointment_date}} at {{appointment_time}}.",
    },
  },

  /* ── Reminder 48 hrs ────────────────────────────── */
  {
    id:       "rule-reminder-48h",
    event:    "appointment_reminder",
    timing:   { direction: "before", value: 48, unit: "hours" },
    channels: ["email"],
    enabled:  true,
    template: {
      emailSubject: "Reminder: your appointment is in 2 days 📅",
      emailBody: `Hi {{client_name}},

Just a friendly reminder that you have an appointment coming up:

📅 {{appointment_date}}
⏰ {{appointment_time}}
✂️ {{service_name}} with {{staff_name}}
📍 {{shop_address}}

Need to reschedule or cancel?
{{manage_link}}

See you soon!
— {{shop_name}}`,
      smsBody:    "Reminder: {{client_name}}, your {{service_name}} at {{shop_name}} is on {{appointment_date}} at {{appointment_time}}. Manage: {{manage_link}}",
      pushTitle:  "Appointment in 2 days",
      pushBody:   "{{service_name}} with {{staff_name}} on {{appointment_date}} at {{appointment_time}}.",
    },
  },

  /* ── Reminder 2 hrs ─────────────────────────────── */
  {
    id:       "rule-reminder-2h",
    event:    "appointment_reminder",
    timing:   { direction: "before", value: 2, unit: "hours" },
    channels: ["sms", "push"],
    enabled:  true,
    template: {
      emailSubject: "You're up in 2 hours — see you soon!",
      emailBody: `Hi {{client_name}},

Your appointment is just 2 hours away:

⏰ {{appointment_time}} today
✂️ {{service_name}} with {{staff_name}}
📍 {{shop_address}}

Running late or need to cancel?
{{manage_link}}

— {{shop_name}}`,
      smsBody:    "Hey {{client_name}}! Your {{service_name}} at {{shop_name}} is in 2 hours ({{appointment_time}}). See you soon! Cancel: {{cancel_link}}",
      pushTitle:  "Your appointment is in 2 hours ⏰",
      pushBody:   "{{service_name}} with {{staff_name}} at {{appointment_time}}.",
    },
  },

  /* ── Post-visit follow-up ───────────────────────── */
  {
    id:       "rule-followup",
    event:    "appointment_followup",
    timing:   { direction: "after", value: 24, unit: "hours" },
    channels: ["email", "push"],
    enabled:  true,
    template: {
      emailSubject: "How was your visit, {{client_name}}? ⭐",
      emailBody: `Hi {{client_name}},

Hope you enjoyed your {{service_name}} with {{staff_name}} yesterday!

We'd love to hear how it went — it only takes 30 seconds and really helps us improve:

👉 Leave a review: {{manage_link}}

Thanks for choosing {{shop_name}}. We look forward to seeing you again soon!

— The team at {{shop_name}}`,
      smsBody:    "Hi {{client_name}}, hope you enjoyed your visit at {{shop_name}}! Got 30 seconds for a review? It means a lot: {{manage_link}}",
      pushTitle:  "How was your visit? ⭐",
      pushBody:   "Tap to leave a quick review for {{shop_name}}.",
    },
  },

  /* ── Booking cancelled ──────────────────────────── */
  {
    id:       "rule-cancelled",
    event:    "booking_cancelled",
    timing:   { direction: "immediately", value: 0, unit: "minutes" },
    channels: ["email", "push"],
    enabled:  true,
    template: {
      emailSubject: "Your booking has been cancelled",
      emailBody: `Hi {{client_name}},

Your appointment has been cancelled:

📅 {{appointment_date}}
⏰ {{appointment_time}}
✂️ {{service_name}} with {{staff_name}}

Want to book a new time?
{{manage_link}}

— {{shop_name}}`,
      smsBody:    "Hi {{client_name}}, your booking at {{shop_name}} on {{appointment_date}} at {{appointment_time}} has been cancelled. Book again: {{manage_link}}",
      pushTitle:  "Booking cancelled",
      pushBody:   "Your {{service_name}} on {{appointment_date}} has been cancelled.",
    },
  },

  /* ── Booking rescheduled ────────────────────────── */
  {
    id:       "rule-rescheduled",
    event:    "booking_rescheduled",
    timing:   { direction: "immediately", value: 0, unit: "minutes" },
    channels: ["email", "sms", "push"],
    enabled:  false,
    template: {
      emailSubject: "Your booking has been rescheduled 📅",
      emailBody: `Hi {{client_name}},

Your appointment has been moved to a new time:

📅 {{appointment_date}}
⏰ {{appointment_time}}
✂️ {{service_name}} with {{staff_name}}
📍 {{shop_address}}

Need to make further changes?
{{manage_link}}

— {{shop_name}}`,
      smsBody:    "Hi {{client_name}}, your {{service_name}} at {{shop_name}} has been rescheduled to {{appointment_date}} at {{appointment_time}}. Manage: {{manage_link}}",
      pushTitle:  "Appointment rescheduled 📅",
      pushBody:   "Your {{service_name}} is now on {{appointment_date}} at {{appointment_time}}.",
    },
  },
];
