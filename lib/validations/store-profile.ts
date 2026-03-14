import { z } from "zod";

const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/;
const PHONE_RE = /^[\d\s().+\-]{7,20}$/;

export const storeProfileSchema = z.object({
  shopName: z
    .string()
    .min(1, "Shop name is required")
    .max(80, "Shop name must be 80 characters or less"),

  businessType: z.enum([
    "barbershop", "hair_salon", "nail_salon", "beauty_salon",
    "day_spa", "massage_studio", "wellness_centre", "cosmetic_studio", "other",
  ], { message: "Select a business type" }),

  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),

  logo: z.string().optional(),

  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(PHONE_RE, "Enter a valid phone number"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  website: z
    .string()
    .regex(URL_RE, "Enter a valid URL (e.g. https://example.com)")
    .optional()
    .or(z.literal("")),

  address: z.object({
    line1:    z.string().min(1, "Street address is required"),
    line2:    z.string().optional(),
    suburb:   z.string().min(1, "Suburb / city is required"),
    state:    z.string().min(1, "State is required"),
    postcode: z.string().min(3, "Postcode is required").max(10, "Postcode too long"),
    country:  z.string().min(1, "Country is required"),
  }),

  instagram: z.string().max(60).optional().or(z.literal("")),
  facebook:  z.string().max(100).optional().or(z.literal("")),
  tiktok:    z.string().max(60).optional().or(z.literal("")),
});

export type StoreProfileSchema = z.infer<typeof storeProfileSchema>;
