"use client";

import { Pencil, Trash2, Send, Mail, MessageSquare, Smartphone } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils/cn";
import type { ReminderRule, ReminderChannel } from "@/types/reminders";
import { EVENT_META, CHANNEL_LABELS, CHANNEL_COLORS } from "@/types/reminders";

interface Props {
  rule:          ReminderRule;
  masterEnabled: boolean;
  onToggle:      (enabled: boolean) => void;
  onEdit:        () => void;
  onDelete?:     () => void;
  onTest:        (channel: ReminderChannel) => void;
  isSaving?:     boolean;
}

const CHANNEL_ICONS: Record<ReminderChannel, React.ElementType> = {
  email: Mail,
  sms:   MessageSquare,
  push:  Smartphone,
};

function timingLabel(rule: ReminderRule): string {
  const { direction, value, unit } = rule.timing;
  if (direction === "immediately") return "Sent immediately";
  const u = value === 1 ? unit.replace(/s$/, "") : unit;
  return direction === "before"
    ? `${value} ${u} before appointment`
    : `${value} ${u} after appointment`;
}

export function ReminderRuleCard({
  rule, masterEnabled, onToggle, onEdit, onDelete, onTest, isSaving,
}: Props) {
  const meta    = EVENT_META[rule.event];
  const isLive  = masterEnabled && rule.enabled;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border transition-all duration-200",
        isLive
          ? "border-gray-100 hover:border-gray-200 hover:shadow-sm"
          : "border-gray-100 opacity-60"
      )}
    >
      {/* Coloured top accent */}
      <div className="h-1 rounded-t-xl" style={{ backgroundColor: meta.color }} />

      <div className="px-5 py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="text-xl mt-0.5 shrink-0">{meta.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{meta.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{meta.description}</p>
            </div>
          </div>
          <Toggle
            checked={rule.enabled}
            onChange={onToggle}
            label="Rule enabled"
            hideLabel
            disabled={isSaving}
          />
        </div>

        {/* Timing + channels */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {/* Timing pill */}
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full border"
            style={{ color: meta.color, backgroundColor: `${meta.color}12`, borderColor: `${meta.color}30` }}
          >
            ⏱ {timingLabel(rule)}
          </span>

          {/* Channel pills */}
          {rule.channels.map((ch) => {
            const colors = CHANNEL_COLORS[ch];
            const Icon   = CHANNEL_ICONS[ch];
            return (
              <span
                key={ch}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border"
                style={{ color: colors.text, backgroundColor: colors.bg, borderColor: colors.border }}
              >
                <Icon className="w-3 h-3" />
                {CHANNEL_LABELS[ch]}
              </span>
            );
          })}
        </div>

        {/* Template preview — email subject */}
        {rule.template.emailSubject && rule.channels.includes("email") && (
          <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
              Email subject
            </p>
            <p className="text-xs text-gray-600 font-medium truncate">
              {rule.template.emailSubject}
            </p>
          </div>
        )}
        {rule.channels.includes("sms") && !rule.channels.includes("email") && (
          <div className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 mb-4">
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wide mb-0.5">
              SMS message
            </p>
            <p className="text-xs text-violet-700 line-clamp-2">
              {rule.template.smsBody}
            </p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            {/* Test send buttons */}
            {rule.channels.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => onTest(ch)}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
                title={`Send test ${CHANNEL_LABELS[ch]}`}
              >
                <Send className="w-3 h-3" />
                Test {ch}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                title="Delete this rule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#EEF1F8] text-[#1B3163] hover:bg-[#1B3163] hover:text-white transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Edit template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
