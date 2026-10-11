import { z } from "zod";

export const productSchema = z
  .object({
    image: z.string().optional(),

    name: z
      .string()
      .min(1, "Product name is required")
      .max(80, "Too long"),

    category: z.enum(
      [
        "hair_care",
        "skin_care",
        "styling",
        "grooming",
        "tools",
        "accessories",
        "gift",
        "other",
      ],
      { message: "Select a category" }
    ),

    description: z.string().max(500, "Keep it under 500 characters"),

    sku: z.string().max(40, "Too long"),

    brand: z.string().max(60, "Too long").optional(),

    price: z
      .number({ message: "Price is required" })
      .min(0, "Price must be 0 or more"),

    cost: z
      .number({ message: "Enter a valid cost" })
      .min(0, "Cost must be 0 or more")
      .nullable(),

    taxable: z.boolean(),

    trackInventory: z.boolean(),

    stockQuantity: z
      .number({ message: "Enter a valid quantity" })
      .int("Whole numbers only")
      .min(0, "Cannot be negative")
      .nullable(),

    lowStockThreshold: z
      .number({ message: "Enter a valid number" })
      .int("Whole numbers only")
      .min(0, "Cannot be negative")
      .nullable(),

    status: z.enum(["active", "inactive"]),
  })
  .refine(
    (v) => !v.trackInventory || v.stockQuantity != null,
    { message: "Stock quantity is required when tracking inventory", path: ["stockQuantity"] }
  );

export type ProductSchema = z.infer<typeof productSchema>;
