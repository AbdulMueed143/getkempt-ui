import { z } from "zod";

export const staffSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "Too long"),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Too long"),

  email: z
    .string()
    .email("Enter a valid email address"),

  phone: z
    .string()
    .min(8, "Enter a valid phone number")
    .max(20, "Too long"),

  bio: z
    .string()
    .max(250, "Keep it under 250 characters"),

  specialization: z
    .string()
    .max(100, "Too long"),

  /** Data URL or CDN URL — optional, falls back to avatarColor initials */
  avatarImage:   z.string().optional(),
  avatarColor:   z.string().min(1),
  calendarColor: z.string().min(1),

  role: z.enum(["owner", "manager", "staff"]),

  status: z.enum(["active", "on_leave", "inactive"]),

  services: z
    .array(z.string())
    .min(1, "Select at least one service"),

  commissionType: z.enum(["hourly", "commission", "salary"]),

  commissionRate: z
    .number({ message: "Enter a valid number" })
    .min(0)
    .nullable(),

  startDate: z.string().min(1, "Start date is required"),
});

export type StaffSchema = z.infer<typeof staffSchema>;
