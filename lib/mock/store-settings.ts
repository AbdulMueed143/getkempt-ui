import type { StoreSettings, Holiday } from "@/types/store-settings";


/** 2026 Victorian public holidays */
export const VIC_PUBLIC_HOLIDAYS_2026: Omit<Holiday, "id">[] = [
  { name: "New Year's Day",        date: "2026-01-01", appliesTo: "all", hasSurcharge: false },
  { name: "Australia Day",         date: "2026-01-26", appliesTo: "all", hasSurcharge: false },
  { name: "Labour Day (VIC)",      date: "2026-03-09", appliesTo: "all", hasSurcharge: false },
  { name: "Good Friday",           date: "2026-04-03", appliesTo: "all", hasSurcharge: false },
  { name: "Easter Saturday",       date: "2026-04-04", appliesTo: "all", hasSurcharge: false },
  { name: "Easter Sunday",         date: "2026-04-05", appliesTo: "all", hasSurcharge: false },
  { name: "Easter Monday",         date: "2026-04-06", appliesTo: "all", hasSurcharge: false },
  { name: "ANZAC Day",             date: "2026-04-25", appliesTo: "all", hasSurcharge: false },
  { name: "King's Birthday (VIC)", date: "2026-06-08", appliesTo: "all", hasSurcharge: false },
  { name: "AFL Grand Final Eve",   date: "2026-09-25", appliesTo: "all", hasSurcharge: false },
  { name: "Melbourne Cup Day",     date: "2026-11-03", appliesTo: "all", hasSurcharge: false },
  { name: "Christmas Day",         date: "2026-12-25", appliesTo: "all", hasSurcharge: false },
  { name: "Boxing Day",            date: "2026-12-26", appliesTo: "all", hasSurcharge: false },
];

export const MOCK_STORE_SETTINGS: StoreSettings = {
  /* Scheduling */
  bookingWindowValue: 4,
  bookingWindowUnit:  "weeks",
  slotInterval:       15,

  /* Holidays */
  holidays: [
    {
      id: "h1",
      name: "Easter Monday",
      date: "2026-04-06",
      appliesTo: "all",
      hasSurcharge: true,
      surchargeType: "percentage",
      surchargeValue: 15,
    },
    {
      id: "h2",
      name: "ANZAC Day",
      date: "2026-04-25",
      appliesTo: "all",
      hasSurcharge: true,
      surchargeType: "percentage",
      surchargeValue: 15,
    },
    {
      id: "h3",
      name: "Melbourne Cup Day",
      date: "2026-11-03",
      appliesTo: "all",
      hasSurcharge: false,
    },
  ],

  /* Surcharge rules */
  surchargeRules: [
    {
      id: "sr1",
      name: "Weekend Surcharge",
      isActive: true,
      days: ["saturday", "sunday"],
      surchargeType: "percentage",
      surchargeValue: 10,
    },
    {
      id: "sr2",
      name: "After-Hours Surcharge",
      isActive: true,
      days: [],
      timeStart: "18:00",
      timeEnd: "21:00",
      surchargeType: "percentage",
      surchargeValue: 15,
    },
  ],

  /* Payment setup */
  paymentMode:    "deposit",
  depositType:    "percentage",
  depositValue:   25,
  inStoreMethods: ["card", "cash"],
  stripeConnected: false,

  /* No-show & cancellation fees */
  noShowFeeType:  "percentage",
  noShowFeeValue: 100,
  autoCharge:     false,
  cancellationFeeRules: [
    { id: "cfr1", label: "Same day (within 2 hours)", withinHours: 2,  feeType: "percentage", feeValue: 100 },
    { id: "cfr2", label: "Within 24 hours",           withinHours: 24, feeType: "percentage", feeValue: 50  },
  ],

  /* Text policies */
  cancellationPolicy: `We understand that plans change. We kindly ask for at least 24 hours' notice if you need to cancel or reschedule your appointment.

Cancellations made with less than 24 hours' notice may incur a cancellation fee of 50% of the scheduled service cost.

No-shows will be charged 100% of the service cost. This policy allows us to offer your slot to other clients.

To cancel or reschedule, please call us or use the online booking portal.`,

  privacyPolicy: `Your privacy is important to us. We collect only the personal information necessary to provide our services, including your name, contact details, and appointment history.

We will never sell or share your personal information with third parties without your consent, except where required by law.

You may request access to, correction of, or deletion of your personal data at any time by contacting us directly.

By booking with us you consent to us storing your information for the purposes of managing your appointments and sending you service-related communications.`,
};
