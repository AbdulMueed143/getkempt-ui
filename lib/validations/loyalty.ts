import { z } from "zod";

export const loyaltyProgramSchema = z
  .object({
    name: z
      .string()
      .min(1, "Program name is required")
      .max(80, "Keep it under 80 characters"),

    description: z.string().max(500, "Keep it under 500 characters"),

    /* ── Reward ── */
    rewardType: z.enum(
      ["percentage", "fixed", "free_visit", "free_item"],
      { message: "Select a reward type" }
    ),

    rewardValue: z
      .number({ message: "Enter a valid number" })
      .min(0, "Must be 0 or more")
      .nullable(),

    rewardLabel: z
      .string()
      .min(1, "Describe the reward for your clients")
      .max(200, "Keep it under 200 characters"),

    /* ── Location ── */
    redeemLocation: z.enum(["own_shop", "partner"], {
      message: "Select where the reward can be redeemed",
    }),

    partnerName:    z.string().max(100).nullable(),
    partnerAddress: z.string().max(200).nullable(),

    /* ── Trigger ── */
    triggerType: z.enum(["visits", "spend"], {
      message: "Select a trigger type",
    }),

    triggerValue: z
      .number({ message: "Enter a value" })
      .min(1, "Must be at least 1"),

    /* ── Expiry ── */
    programExpiryDate: z.string().nullable(),
    rewardExpiryDays:  z
      .number({ message: "Enter a number of days" })
      .min(1, "Must be at least 1 day")
      .nullable(),

    status: z.enum(["active", "inactive", "draft"]),
  })
  /* % discount must be 1–100 */
  .refine(
    (d) =>
      d.rewardType !== "percentage" ||
      (d.rewardValue != null && d.rewardValue > 0 && d.rewardValue <= 100),
    { message: "Enter a percentage between 1 and 100", path: ["rewardValue"] }
  )
  /* Fixed discount must be > 0 */
  .refine(
    (d) => d.rewardType !== "fixed" || (d.rewardValue != null && d.rewardValue > 0),
    { message: "Enter a discount amount greater than 0", path: ["rewardValue"] }
  )
  /* Partner shop name required when location = partner */
  .refine(
    (d) =>
      d.redeemLocation !== "partner" ||
      (d.partnerName != null && d.partnerName.trim().length > 0),
    { message: "Enter the partner shop name", path: ["partnerName"] }
  );

export type LoyaltyProgramSchema = z.infer<typeof loyaltyProgramSchema>;
