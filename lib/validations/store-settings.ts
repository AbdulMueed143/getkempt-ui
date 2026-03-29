import { z } from "zod";

const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const holidaySchema = z.object({
  id:           z.string(),
  name:         z.string().min(1, "Name is required").max(80),
  date:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  appliesTo:    z.union([z.literal("all"), z.array(z.string())]),
  hasSurcharge: z.boolean(),
  surchargeType:  z.enum(["percentage", "fixed_aud"]).optional(),
  surchargeValue: z.number().min(0).max(10000).optional(),
}).refine(
  (v) => !v.hasSurcharge || (v.surchargeType !== undefined && (v.surchargeValue ?? 0) > 0),
  { message: "Enter a surcharge type and amount", path: ["surchargeValue"] }
);

export const surchargeRuleSchema = z.object({
  id:       z.string(),
  name:     z.string().min(1, "Rule name is required").max(60),
  isActive: z.boolean(),
  days:     z.array(z.enum(DAYS)),
  timeStart: z.string().regex(TIME_RE).optional().or(z.literal("")),
  timeEnd:   z.string().regex(TIME_RE).optional().or(z.literal("")),
  surchargeType:  z.enum(["percentage", "fixed_aud"]),
  surchargeValue: z.number().min(0.01, "Enter a surcharge amount").max(10000),
}).refine(
  (v) => {
    if (v.timeStart && v.timeEnd) {
      const [sh, sm] = v.timeStart.split(":").map(Number);
      const [eh, em] = v.timeEnd.split(":").map(Number);
      return eh * 60 + em > sh * 60 + sm;
    }
    return true;
  },
  { message: "End time must be after start time", path: ["timeEnd"] }
);

export const cancellationFeeRuleSchema = z.object({
  id:          z.string(),
  label:       z.string().min(1, "Label required").max(60),
  withinHours: z.number({ message: "Required" }).int().min(1, "Must be at least 1 hour").max(720),
  feeType:     z.enum(["percentage", "fixed_aud"]),
  feeValue:    z.number().min(0.01, "Enter a fee amount").max(100000),
}).refine(
  (v) => v.feeType !== "percentage" || v.feeValue <= 100,
  { message: "Percentage cannot exceed 100%", path: ["feeValue"] }
);

export const storeSettingsSchema = z.object({
  /* Scheduling */
  bookingWindowValue: z
    .number({ message: "Required" })
    .int()
    .min(1, "Must be at least 1")
    .max(365, "Max 365"),
  bookingWindowUnit: z.enum(["days", "weeks", "months"]),
  slotInterval: z
    .number({ message: "Required" })
    .int()
    .min(5, "Minimum 5 minutes")
    .max(60, "Maximum 60 minutes"),

  holidays:       z.array(holidaySchema),
  surchargeRules: z.array(surchargeRuleSchema),

  /* Payment setup */
  paymentMode:    z.enum(["in_store", "deposit", "full_upfront"]),
  depositType:    z.enum(["percentage", "fixed_aud"]),
  depositValue:   z.number().min(0).max(100000),
  inStoreMethods: z.array(z.enum(["card", "cash", "bank_transfer"])),
  stripeConnected: z.boolean(),

  /* No-show & cancellation fees */
  noShowFeeType:        z.enum(["percentage", "fixed_aud", "none"]),
  noShowFeeValue:       z.number().min(0).max(100000),
  autoCharge:           z.boolean(),
  cancellationFeeRules: z.array(cancellationFeeRuleSchema),

  /* Text policies */
  cancellationPolicy: z.string().max(3000),
  privacyPolicy:      z.string().max(5000),
}).refine(
  (v) => {
    if (v.paymentMode !== "in_store" && v.depositValue === 0) return false;
    return true;
  },
  {
    message: "Enter a deposit amount greater than 0",
    path: ["depositValue"],
  }
).refine(
  (v) => v.noShowFeeType === "none" || v.noShowFeeValue > 0,
  { message: "Enter a no-show fee amount", path: ["noShowFeeValue"] }
).refine(
  (v) => v.noShowFeeType !== "percentage" || v.noShowFeeValue <= 100,
  { message: "Percentage cannot exceed 100%", path: ["noShowFeeValue"] }
);

export type StoreSettingsSchema = z.infer<typeof storeSettingsSchema>;
