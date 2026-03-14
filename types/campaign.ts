/**
 * Campaign / broadcast types.
 *
 * From the front end we build a CampaignPayload and POST it to the
 * backend. The backend is a distributed async system that handles
 * fan-out, rate limiting, and delivery — we never enumerate recipients
 * client-side for large audiences.
 */

/** Which group of clients should receive this campaign */
export type CampaignAudience =
  | "all"        // every client
  | "upcoming"   // clients with a future booking
  | "staff"      // clients of a specific staff member
  | "selected";  // manually chosen client IDs

/** Delivery channel — extend as new channels are supported */
export type CampaignChannel = "email"; // "sms" | "push" to come

/**
 * The filter descriptor sent to the backend.
 * The backend resolves the actual recipient list server-side,
 * keeping PII out of the request payload for "all" / "upcoming" / "staff" audiences.
 */
export interface CampaignFilter {
  audience:   CampaignAudience;
  staffId?:   string | null;     // required when audience === "staff"
  clientIds?: string[];           // required when audience === "selected"
}

/**
 * Full payload POSTed to /api/v1/campaigns (or equivalent).
 * The backend queues a job and returns a jobId immediately.
 */
export interface CampaignPayload {
  filter:       CampaignFilter;
  channel:      CampaignChannel;
  subject:      string;
  message:      string;
  scheduledAt:  string | null;   // ISO-8601 or null → send immediately
}

/** Response from the dispatch API */
export interface CampaignResult {
  jobId:          string;
  estimatedCount: number;
  scheduledAt:    string | null;
}
