import type { ReminderRule, GlobalReminderSettings } from "@/types/reminders";

const FAKE_DELAY = () => new Promise((r) => setTimeout(r, 600));

/** Persist the master on/off toggle */
export async function updateGlobalSettings(
  settings: Partial<GlobalReminderSettings>
): Promise<void> {
  await FAKE_DELAY();
  console.log("[API] updateGlobalSettings", settings);
}

/** Create or update a single reminder rule */
export async function saveReminderRule(rule: ReminderRule): Promise<ReminderRule> {
  await FAKE_DELAY();
  console.log("[API] saveReminderRule", rule);
  return rule;
}

/** Toggle a single rule on/off */
export async function toggleReminderRule(
  ruleId: string,
  enabled: boolean
): Promise<void> {
  await FAKE_DELAY();
  console.log("[API] toggleReminderRule", ruleId, enabled);
}

/** Delete a rule (for deletable duplicate reminders) */
export async function deleteReminderRule(ruleId: string): Promise<void> {
  await FAKE_DELAY();
  console.log("[API] deleteReminderRule", ruleId);
}

/** Send a test reminder to the current user's email/phone */
export async function sendTestReminder(
  ruleId: string,
  channel: "email" | "sms" | "push"
): Promise<void> {
  await FAKE_DELAY();
  console.log("[API] sendTestReminder", ruleId, channel);
}
