import { z } from "zod";

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, "Service name is required")
    .max(80, "Too long"),

  category: z.enum(
    ["hair", "barber", "nails", "beauty", "lash_brow", "massage", "other"],
    { message: "Select a category" }
  ),

  description: z
    .string()
    .max(500, "Keep it under 500 characters"),

  durationMinutes: z
    .number({ message: "Duration is required" })
    .min(5,    "Minimum 5 minutes")
    .max(480,  "Maximum 8 hours"),

  bufferMinutes: z
    .number({ message: "Enter a valid number" })
    .min(0)
    .max(120, "Maximum 2 hours buffer"),

  price: z
    .number({ message: "Price is required" })
    .min(0, "Price must be 0 or more"),

  depositRequired: z.boolean(),

  depositAmount: z
    .number({ message: "Enter a valid deposit amount" })
    .min(0)
    .nullable(),

  status: z.enum(["active", "inactive"]),

  onlineBookingEnabled: z.boolean(),

  staffIds: z.array(z.string()),
});

export type ServiceSchema = z.infer<typeof serviceSchema>;
