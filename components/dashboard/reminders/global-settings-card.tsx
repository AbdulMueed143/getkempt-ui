"use client";

import { BellRing, BellOff, MessageSquare, Mail, Smartphone, ExternalLink } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import type { GlobalReminderSettings, ReminderChannel } from "@/types/reminders";
import { CHANNEL_COLORS, CHANNEL_LABELS } from "@/types/reminders";
import { cn } from "@/lib/utils/cn";

interface Props {
  settings:  GlobalReminderSettings;
  onChange:  (updated: Partial<GlobalReminderSettings>) => void;
}

const CHANNEL_ICONS: Record<ReminderChannel, React.ElementType> = {
  email: Mail,
  sms:   MessageSquare,
  push:  Smartphone,
};

export function GlobalSettingsCard({ settings, onChange }: Props) {
  const creditsLow = settings.smsCreditsRemaining < 100;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header row */}
      <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: settings.masterEnabled ? "#EEF1F8" : "#F3F4F6" }}
          >
            {settings.masterEnabled
              ? <BellRing className="w-4 h-4 text-[#1B3163]" />
              : <BellOff  className="w-4 h-4 text-gray-400"  />
            }
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Automated reminders</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {settings.masterEnabled
                ? "All active rules are running"
                : "All reminders are paused — no messages are being sent"}
            </p>
          </div>
        </div>
        <Toggle
          checked={settings.masterEnabled}
          onChange={(v) => onChange({ masterEnabled: v })}
          label="Master switch"
          hideLabel
        />
      </div>

      {/* Channel info row */}
      <div className="px-5 py-4 grid sm:grid-cols-3 gap-4">
        {(["email", "sms", "push"] as ReminderChannel[]).map((ch) => {
          const colors = CHANNEL_COLORS[ch];
          const Icon   = CHANNEL_ICONS[ch];
          const isSms  = ch === "sms";

          return (
            <div
              key={ch}
              className="rounded-xl border p-3.5 flex items-start gap-3"
              style={{ borderColor: colors.border, backgroundColor: `${colors.bg}80` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
              >
                <Icon className="w-4 h-4" style={{ color: colors.text }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold" style={{ color: colors.text }}>
                  {CHANNEL_LABELS[ch]}
                </p>
                {isSms ? (
                  <div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className={cn("font-semibold", creditsLow ? "text-rose-600" : "text-gray-700")}>
                        {settings.smsCreditsRemaining.toLocaleString()}
                      </span>{" "}
                      credits remaining
                    </p>
                    {creditsLow && (
                      <p className="text-[10px] text-rose-500 mt-0.5 font-medium">
                        Low — top up soon
                      </p>
                    )}
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-[10px] font-semibold mt-1"
                      style={{ color: colors.text }}
                    >
                      Top up credits <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ch === "email" ? "Unlimited — included free" : "Free with app install"}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
