import { z } from "zod";

export const campaignSchema = z
  .object({
    audience: z.enum(["all", "upcoming", "staff", "selected"], {
      message: "Select a recipient group",
    }),

    staffId: z.string().nullable(),

    channel: z.enum(["email"]),

    subject: z
      .string()
      .min(1, "Subject is required")
      .max(150, "Keep the subject under 150 characters"),

    message: z
      .string()
      .min(10, "Message must be at least 10 characters")
      .max(2000, "Maximum 2 000 characters"),

    scheduledAt: z.string().nullable(),
  })
  /* When targeting a staff's clients, a staffId is required */
  .refine((d) => d.audience !== "staff" || d.staffId != null, {
    message: "Select a staff member",
    path:    ["staffId"],
  });

export type CampaignSchema = z.infer<typeof campaignSchema>;
