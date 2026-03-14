/**
 * Campaign dispatch API.
 *
 * The backend is a distributed async system: it receives this payload,
 * resolves the recipient list server-side, and fans out messages via
 * email/SMS/push without exposing PII back to the client.
 *
 * Replace the stub below with a real fetch() call once the API is available:
 *
 *   const res = await fetch("/api/v1/campaigns", {
 *     method:  "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body:    JSON.stringify(payload),
 *   });
 *   if (!res.ok) throw new Error(await res.text());
 *   return res.json();
 */

import type { CampaignPayload, CampaignResult } from "@/types/campaign";

export async function dispatchCampaign(
  payload:        CampaignPayload,
  estimatedCount: number
): Promise<CampaignResult> {
  /* ── Stub: simulates ~800 ms of network latency ── */
  await new Promise<void>((resolve) => setTimeout(resolve, 800));

  return {
    jobId:          `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    estimatedCount,
    scheduledAt:    payload.scheduledAt,
  };
}
