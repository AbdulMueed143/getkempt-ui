import { z } from "zod";

/* ── Helpers ─────────────────────────────────────────────────────────── */

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/* ── Time slot ───────────────────────────────────────────────────────── */

export const timeSlotSchema = z
  .object({
    startTime: z
      .string()
      .regex(TIME_RE, { message: "Enter a valid time (HH:MM)" }),
    endTime: z
      .string()
      .regex(TIME_RE, { message: "Enter a valid time (HH:MM)" }),
    type: z.enum(["work", "break"]),
    label: z.string().max(40, "Label too long").optional(),
  })
  .refine((s) => toMinutes(s.endTime) > toMinutes(s.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

/* ── Override form ───────────────────────────────────────────────────── */

export const overrideFormSchema = z
  .object({
    staffId: z.string().min(1, "Staff member is required"),
    date: z
      .string()
      .min(1, "Date is required")
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format" }),
    isWorking: z.boolean(),
    slots: z.array(timeSlotSchema),
    note: z.string().max(200, "Note must be 200 characters or less").optional(),
  })
  .refine((v) => !v.isWorking || v.slots.length > 0, {
    message: "Add at least one time slot for a working day",
    path: ["slots"],
  });

export type OverrideFormValues = z.infer<typeof overrideFormSchema>;
