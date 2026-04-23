"use client";

import { useState } from "react";
import { Plus, BellRing, BellOff, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import { RemindersStats }    from "./reminders-stats";
import { GlobalSettingsCard } from "./global-settings-card";
import { ReminderRuleCard }   from "./reminder-rule-card";
import { TemplateSlideover }  from "./template-slideover";
import type {
  ReminderRule, GlobalReminderSettings, ReminderChannel,
} from "@/types/reminders";
import { EVENT_META } from "@/types/reminders";
import type { ReminderStats } from "@/types/reminders";
import {
  MOCK_REMINDER_RULES, MOCK_GLOBAL_SETTINGS, MOCK_STATS,
} from "@/lib/mock/reminders";
import {
  saveReminderRule, toggleReminderRule, deleteReminderRule,
  sendTestReminder, updateGlobalSettings,
} from "@/lib/api/reminders";

const NEW_RULE_TEMPLATE: ReminderRule = {
  id:       "",
  event:    "appointment_reminder",
  timing:   { direction: "before", value: 24, unit: "hours" },
  channels: ["email"],
  enabled:  true,
  template: {
    emailSubject: "",
    emailBody:    "",
    smsBody:      "",
    pushTitle:    "",
    pushBody:     "",
  },
};

export function RemindersPageClient() {
  const toast   = useToast();
  const confirm = useConfirm();

  const [settings, setSettings] = useState<GlobalReminderSettings>(MOCK_GLOBAL_SETTINGS);
  const [stats]                  = useState<ReminderStats>(MOCK_STATS);
  const [rules, setRules]        = useState<ReminderRule[]>(MOCK_REMINDER_RULES);
  const [savingId, setSavingId]  = useState<string | null>(null);
  const [slideoverRule, setSlideoverRule] = useState<ReminderRule | null>(null);
  const [isNewRule, setIsNewRule]         = useState(false);

  /* ── Global toggle ── */
  async function handleMasterToggle(masterEnabled: boolean) {
    setSettings((s) => ({ ...s, masterEnabled }));
    await updateGlobalSettings({ masterEnabled });
    toast.success({
      title:   masterEnabled ? "Reminders enabled" : "Reminders paused",
      message: masterEnabled
        ? "All active rules will now send messages."
        : "No messages will be sent until you re-enable reminders.",
    });
  }

  /* ── Rule toggle ── */
  async function handleToggle(ruleId: string, enabled: boolean) {
    setSavingId(ruleId);
    setRules((rs) => rs.map((r) => r.id === ruleId ? { ...r, enabled } : r));
    await toggleReminderRule(ruleId, enabled);
    setSavingId(null);
    toast.success({ title: enabled ? "Rule enabled" : "Rule paused" });
  }

  /* ── Save (create / update) ── */
  async function handleSave(updated: ReminderRule) {
    const isNew = !updated.id;
    const finalRule = isNew
      ? { ...updated, id: `rule-${Date.now()}` }
      : updated;

    setSavingId(finalRule.id);
    await saveReminderRule(finalRule);
    setSavingId(null);

    setRules((rs) =>
      isNew
        ? [...rs, finalRule]
        : rs.map((r) => r.id === finalRule.id ? finalRule : r)
    );
    setSlideoverRule(null);
    toast.success({
      title:   isNew ? "Reminder rule added" : "Rule updated",
      message: `"${EVENT_META[finalRule.event].label}" saved.`,
    });
  }

  /* ── Delete ── */
  async function handleDelete(rule: ReminderRule) {
    const ok = await confirm({
      title:        "Delete this reminder rule?",
      message:      `The "${EVENT_META[rule.event].label}" rule will be permanently removed and no longer send messages.`,
      confirmLabel: "Delete",
      variant:      "danger",
    });
    if (!ok) return;
    await deleteReminderRule(rule.id);
    setRules((rs) => rs.filter((r) => r.id !== rule.id));
    toast.success({ title: "Rule deleted" });
  }

  /* ── Test send ── */
  async function handleTest(rule: ReminderRule, channel: ReminderChannel) {
    await sendTestReminder(rule.id, channel);
    toast.info({
      title:   `Test ${channel} sent`,
      message: "Check your inbox / phone for the test message.",
    });
  }

  /* ── Group rules by event ── */
  const rulesByEvent = rules.reduce<Record<string, ReminderRule[]>>((acc, r) => {
    acc[r.event] = [...(acc[r.event] ?? []), r];
    return acc;
  }, {});

  const eventOrder = [
    "booking_confirmed",
    "appointment_reminder",
    "appointment_followup",
    "booking_cancelled",
    "booking_rescheduled",
  ] as const;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Automated Reminders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Reduce no-shows and keep clients informed with automatic messages
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setIsNewRule(true); setSlideoverRule({ ...NEW_RULE_TEMPLATE }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3163] text-white text-sm font-bold rounded-xl hover:bg-[#243F80] transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add reminder rule
        </button>
      </div>

      {/* Master off banner */}
      {!settings.masterEnabled && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <BellOff className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            All automated reminders are currently paused. Enable the master switch below to start sending messages.
          </p>
        </div>
      )}

      {/* Stats */}
      <RemindersStats stats={stats} settings={settings} />

      {/* Global settings */}
      <GlobalSettingsCard
        settings={settings}
        onChange={(partial) => {
          if ("masterEnabled" in partial) {
            handleMasterToggle(partial.masterEnabled!);
          } else {
            setSettings((s) => ({ ...s, ...partial }));
          }
        }}
      />

      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-[#FAF8F3] border border-[#E5EAF4] rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-[#1B3163] shrink-0 mt-0.5" />
        <p className="text-xs text-[#1B3163]/80 leading-relaxed">
          <strong>Tip:</strong> You can add multiple "Appointment Reminder" rules at different lead times
          (e.g. 48 hours and 2 hours before). All other event types support only one rule each.
          Click <strong>Edit template</strong> to customise message content and insert dynamic variables
          like {"{{"}<span>client_name</span>{"}}"} and {"{{"}<span>appointment_time</span>{"}}"}.
        </p>
      </div>

      {/* Rules grouped by event */}
      <div className="space-y-8">
        {eventOrder.map((event) => {
          const eventRules = rulesByEvent[event] ?? [];
          const meta = EVENT_META[event];
          const canAdd = meta.canHaveMultiple || eventRules.length === 0;

          return (
            <div key={event}>
              {/* Event group header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{meta.icon}</span>
                  <h2 className="text-sm font-bold text-gray-700">{meta.label}</h2>
                  <span className="text-xs text-gray-400">
                    · {eventRules.length === 0 ? "no rules" : `${eventRules.length} rule${eventRules.length > 1 ? "s" : ""}`}
                  </span>
                </div>
                {canAdd && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewRule(true);
                      setSlideoverRule({
                        ...NEW_RULE_TEMPLATE,
                        event,
                        timing: event === "booking_confirmed" || event === "booking_cancelled" || event === "booking_rescheduled"
                          ? { direction: "immediately", value: 0, unit: "minutes" }
                          : event === "appointment_followup"
                            ? { direction: "after", value: 24, unit: "hours" }
                            : { direction: "before", value: 24, unit: "hours" },
                      });
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-[#1B3163] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {eventRules.length === 0 ? "Add rule" : "Add another"}
                  </button>
                )}
              </div>

              {eventRules.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl px-5 py-8 text-center">
                  <BellRing className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 font-medium">No rule configured</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Add a rule to send automatic messages for this event
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {eventRules.map((rule) => (
                    <ReminderRuleCard
                      key={rule.id}
                      rule={rule}
                      masterEnabled={settings.masterEnabled}
                      onToggle={(v) => handleToggle(rule.id, v)}
                      onEdit={() => { setIsNewRule(false); setSlideoverRule(rule); }}
                      onDelete={meta.canHaveMultiple ? () => handleDelete(rule) : undefined}
                      onTest={(ch) => handleTest(rule, ch)}
                      isSaving={savingId === rule.id}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Template slideover */}
      {slideoverRule && (
        <TemplateSlideover
          rule={slideoverRule}
          isNew={isNewRule}
          onSave={handleSave}
          onClose={() => setSlideoverRule(null)}
        />
      )}
    </div>
  );
}
