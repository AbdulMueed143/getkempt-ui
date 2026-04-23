"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Info, CheckCircle2, XCircle, X, Bell } from "lucide-react";
import { ALERTS } from "@/lib/mock/dashboard";
import type { AlertItem, AlertSeverity } from "@/types/dashboard";

/* ── Severity config ─────────────────────────────── */
const SEVERITY_CONFIG: Record<
  AlertSeverity,
  {
    icon: typeof Info;
    color: string;
    bg: string;
    border: string;
    iconBg: string;
  }
> = {
  warning: {
    icon: AlertTriangle,
    color: "#A16207",
    bg: "#FFFBEB",
    border: "#FDE68A",
    iconBg: "#FEF3C7",
  },
  error: {
    icon: XCircle,
    color: "#B91C1C",
    bg: "#FEF2F2",
    border: "#FECACA",
    iconBg: "#FEE2E2",
  },
  info: {
    icon: Info,
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    iconBg: "#DBEAFE",
  },
  success: {
    icon: CheckCircle2,
    color: "#047857",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    iconBg: "#D1FAE5",
  },
};

export function AlertsPanel() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = ALERTS.filter((a) => !dismissed.has(a.id));
  const unreadCount = visible.filter((a) => !a.read).length;

  return (
    <div
      className="bg-white rounded-2xl p-5 flex flex-col"
      style={{
        border: "1px solid #E8E4DA",
        boxShadow:
          "0 1px 2px rgba(11,18,32,0.04), 0 1px 3px rgba(11,18,32,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: "#FFFBEB",
              border: "1px solid #FDE68A",
            }}
          >
            <Bell size={16} className="text-[#A16207]" strokeWidth={2.25} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-[#0B1220] leading-tight">
                Alerts
              </h2>
              {unreadCount > 0 && (
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none"
                  style={{
                    background: "linear-gradient(135deg, #C4A882, #D5B584)",
                    color: "#0B1220",
                  }}
                >
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">
              Things that need your attention
            </p>
          </div>
        </div>
        {visible.length > 0 && (
          <button
            className="text-[11px] font-semibold text-[#4B5563] hover:text-[#0B1220] transition-colors"
            onClick={() => setDismissed(new Set(ALERTS.map((a) => a.id)))}
          >
            Clear all
          </button>
        )}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0" }}
          >
            <CheckCircle2 size={22} className="text-[#047857]" />
          </div>
          <p className="text-sm font-semibold text-[#0B1220]">
            You&apos;re all caught up
          </p>
          <p className="text-xs text-[#6B7280]">No alerts right now.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onDismiss={() =>
                setDismissed((prev) => new Set([...prev, alert.id]))
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Individual alert row ────────────────────────── */
function AlertRow({
  alert,
  onDismiss,
}: {
  alert: AlertItem;
  onDismiss: () => void;
}) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;

  return (
    <li
      className="flex gap-3 p-3.5 rounded-xl transition-all hover:shadow-sm"
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        opacity: alert.read ? 0.8 : 1,
      }}
    >
      {/* Severity icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: config.iconBg }}
      >
        <Icon size={15} style={{ color: config.color }} strokeWidth={2.25} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-bold text-[#0B1220] leading-tight">
            {alert.title}
          </p>
          <span className="text-[10px] font-medium shrink-0 text-[#6B7280]">
            {alert.time}
          </span>
        </div>
        <p className="text-xs mt-1 text-[#4B5563] leading-snug">
          {alert.description}
        </p>
        {alert.actionLabel && alert.actionHref && (
          <Link
            href={alert.actionHref}
            className="inline-flex items-center gap-1 text-[11px] font-bold mt-2 hover:underline"
            style={{ color: config.color }}
          >
            {alert.actionLabel} <span aria-hidden>→</span>
          </Link>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 h-fit rounded-md transition-all opacity-60 hover:opacity-100 hover:bg-black/5 text-[#4B5563]"
        aria-label="Dismiss alert"
      >
        <X size={13} />
      </button>
    </li>
  );
}
