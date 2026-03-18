import { Send, TrendingDown, MailCheck, MessageSquare } from "lucide-react";
import type { ReminderStats, GlobalReminderSettings } from "@/types/reminders";

interface Props {
  stats:    ReminderStats;
  settings: GlobalReminderSettings;
}

export function RemindersStats({ stats, settings }: Props) {
  const noShowImprovement = stats.noShowRateBefore - stats.noShowRateAfter;

  const cards = [
    {
      label:   "Sent this month",
      value:   stats.totalSentThisMonth.toLocaleString(),
      sub:     `${settings.emailsUsedThisMonth} email · ${settings.smsCreditsUsedThisMonth} SMS · ${settings.pushUsedThisMonth} push`,
      icon:    Send,
      color:   "#1B3163",
    },
    {
      label:   "Email open rate",
      value:   `${stats.openRate}%`,
      sub:     `${stats.emailDeliveryRate}% delivered successfully`,
      icon:    MailCheck,
      color:   "#047857",
    },
    {
      label:   "SMS delivery rate",
      value:   `${stats.smsDeliveryRate}%`,
      sub:     `${settings.smsCreditsRemaining} credits remaining`,
      icon:    MessageSquare,
      color:   "#7C3AED",
    },
    {
      label:   "No-show rate",
      value:   `${stats.noShowRateAfter}%`,
      sub:     `↓ ${noShowImprovement}% since reminders enabled`,
      icon:    TrendingDown,
      color:   "#B45309",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: `${c.color}15` }}
          >
            <c.icon className="w-4 h-4" style={{ color: c.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium truncate">{c.label}</p>
            <p className="text-xl font-black text-gray-900 leading-tight">{c.value}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-snug">{c.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
