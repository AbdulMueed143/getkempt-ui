import { z } from "zod";

export const packageSchema = z
  .object({
    name: z
      .string()
      .min(1, "Package name is required")
      .max(80, "Name must be 80 characters or less"),

    description: z.string().max(500, "Keep description under 500 characters"),

    serviceIds: z
      .array(z.string())
      .min(2, "A package must include at least 2 services"),

    /* Duration override — null means "auto from services" */
    customDurationMinutes: z
      .number({ message: "Enter a valid number of minutes" })
      .min(1, "Must be at least 1 minute")
      .nullable(),

    /* Discount fields */
    discountEnabled: z.boolean(),

    discountType: z.enum(["percentage", "fixed"]).nullable(),

    discountValue: z
      .number({ message: "Enter a valid discount amount" })
      .min(0, "Discount cannot be negative")
      .nullable(),

    /* Availability */
    status: z.enum(["active", "inactive"]),

    onlineBookingEnabled: z.boolean(),

    staffIds: z.array(z.string()),
  })
  /* Rule 1 — when discount is enabled, type and value are required */
  .refine(
    (d) =>
      !d.discountEnabled ||
      (d.discountType != null &&
        d.discountValue != null &&
        d.discountValue > 0),
    {
      message: "Enter a discount amount greater than 0",
      path:    ["discountValue"],
    }
  )
  /* Rule 2 — percentage discount cannot exceed 100 */
  .refine(
    (d) =>
      !(
        d.discountEnabled &&
        d.discountType === "percentage" &&
        d.discountValue != null &&
        d.discountValue > 100
      ),
    {
      message: "Percentage discount cannot exceed 100%",
      path:    ["discountValue"],
    }
  );

export type PackageSchema = z.infer<typeof packageSchema>;
