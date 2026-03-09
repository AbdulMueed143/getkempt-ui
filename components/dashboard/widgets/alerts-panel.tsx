"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Info, CheckCircle2, XCircle, X } from "lucide-react";
import { ALERTS } from "@/lib/mock/dashboard";
import type { AlertItem, AlertSeverity } from "@/types/dashboard";

/* ── Severity config ─────────────────────────────── */
const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { icon: typeof Info; color: string; bg: string; border: string }
> = {
  warning: { icon: AlertTriangle, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  error:   { icon: XCircle,       color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  info:    { icon: Info,          color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  success: { icon: CheckCircle2,  color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0" },
};

export function AlertsPanel() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = ALERTS.filter((a) => !dismissed.has(a.id));
  const unreadCount = visible.filter((a) => !a.read).length;

  return (
    <div
      className="bg-white rounded-2xl p-5 flex flex-col"
      style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(27,49,99,0.06)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold" style={{ color: "#1B3163" }}>
            Alerts
          </h2>
          {unreadCount > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "#D5B584", color: "#1B3163" }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        {visible.length > 0 && (
          <button
            className="text-xs transition-colors"
            style={{ color: "#8E95A5" }}
            onClick={() => setDismissed(new Set(ALERTS.map((a) => a.id)))}
          >
            Clear all
          </button>
        )}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
          <CheckCircle2 size={28} style={{ color: "#16A34A" }} />
          <p className="text-sm font-medium" style={{ color: "#8E95A5" }}>
            All clear — no alerts
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onDismiss={() => setDismissed((prev) => new Set([...prev, alert.id]))}
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
      className="flex gap-3 p-3 rounded-xl"
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        opacity: alert.read ? 0.75 : 1,
      }}
    >
      {/* Severity icon */}
      <Icon size={16} className="shrink-0 mt-0.5" style={{ color: config.color }} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className="text-xs font-semibold" style={{ color: "#1B3163" }}>
            {alert.title}
          </p>
          <span className="text-[10px] shrink-0 ml-1" style={{ color: "#8E95A5" }}>
            {alert.time}
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "#6B7A99" }}>
          {alert.description}
        </p>
        {alert.actionLabel && alert.actionHref && (
          <Link
            href={alert.actionHref}
            className="text-[11px] font-semibold mt-1.5 inline-block"
            style={{ color: config.color }}
          >
            {alert.actionLabel} →
          </Link>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="shrink-0 p-0.5 rounded transition-opacity opacity-50 hover:opacity-100"
        style={{ color: "#8E95A5" }}
        aria-label="Dismiss alert"
      >
        <X size={13} />
      </button>
    </li>
  );
}
