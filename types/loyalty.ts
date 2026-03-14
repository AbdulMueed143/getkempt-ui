/* ── Reward ─────────────────────────────────────────────────── */

/** What the client receives when they earn the reward */
export type RewardType = "percentage" | "fixed" | "free_visit" | "free_item";

export const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  percentage: "% Discount",
  fixed:      "$ Discount",
  free_visit: "Free Visit",
  free_item:  "Free Item",
};

export const REWARD_TYPE_DESCRIPTIONS: Record<RewardType, string> = {
  percentage: "A percentage off their next booking",
  fixed:      "A fixed dollar amount off their next booking",
  free_visit: "A completely free service at your shop",
  free_item:  "A free product or item (yours or a partner's)",
};

/* ── Trigger ────────────────────────────────────────────────── */

/** What the client must do to earn the reward */
export type TriggerType = "visits" | "spend";

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  visits: "Number of visits",
  spend:  "Total amount spent",
};

/* ── Redemption location ────────────────────────────────────── */

export type RedeemLocation = "own_shop" | "partner";

/* ── Program status ─────────────────────────────────────────── */

export type ProgramStatus = "active" | "inactive" | "draft";

/* ── Core record ────────────────────────────────────────────── */

/**
 * A LoyaltyProgram defines one "rung" in the shop's loyalty ladder.
 *
 * Clients always work toward the next program they haven't yet earned —
 * there is no concept of being on multiple programs simultaneously.
 *
 * Programs are ordered by `sequenceOrder` (owner-controlled).
 * At runtime, the eligible program for a client is the lowest-sequenceOrder
 * active program whose trigger they have NOT yet met.
 */
export interface LoyaltyProgram {
  id:             string;
  sequenceOrder:  number;      // 1 = first to earn, 2 = second, etc.

  /* Identity */
  name:           string;
  description:    string;

  /* Reward */
  rewardType:     RewardType;
  rewardValue:    number | null;  // % or $ — null for free_visit / free_item
  rewardLabel:    string;          // human-readable, shown to the client

  /* Redemption location */
  redeemLocation: RedeemLocation;
  partnerName:    string | null;   // shop name when location === "partner"
  partnerAddress: string | null;

  /* Eligibility trigger */
  triggerType:    TriggerType;
  triggerValue:   number;          // e.g. 10 (visits) or 300 (dollars)

  /* Expiry */
  programExpiryDate:  string | null;  // ISO date — null = no expiry on the program itself
  rewardExpiryDays:   number | null;  // days the earned reward is valid (null = no limit)

  /* Lifecycle */
  status:         ProgramStatus;

  /* Analytics — would come from the API */
  totalEarned:    number;    // how many times clients have earned this reward
  totalRedeemed:  number;    // how many times it has been redeemed
  createdAt:      string;
}

/* ── Sequence colours ───────────────────────────────────────── */

const SEQUENCE_PALETTE = [
  { accent: "#D97706", accentBg: "#FEF3C7", label: "Bronze" },
  { accent: "#1B3163", accentBg: "#EEF1F8", label: "Silver" },
  { accent: "#B45309", accentBg: "#FDE8C8", label: "Gold"   },
  { accent: "#6B21A8", accentBg: "#F3E8FF", label: "Platinum" },
  { accent: "#0F766E", accentBg: "#CCFBF1", label: "Diamond" },
];

export function programTierColor(order: number) {
  return SEQUENCE_PALETTE[(order - 1) % SEQUENCE_PALETTE.length];
}
