"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { AppointmentRecord, AppointmentStatus } from "@/types/visits";
import { STATUS_LABELS, STATUS_STYLES } from "@/types/visits";

interface AppointmentRowProps {
  appointment: AppointmentRecord;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus, note?: string) => void;
}

function formatTime(isoUtc: string): string {
  return new Date(isoUtc).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function AppointmentRow({
  appointment: appt,
  isSelected,
  onToggleSelect,
  onUpdateStatus,
}: AppointmentRowProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState(appt.note ?? "");
  const [showChange, setShowChange] = useState(false);

  const isPending   = appt.status === "pending";
  const isCancelled = appt.status === "cancelled";
  const style = STATUS_STYLES[appt.status];

  function markAs(status: AppointmentStatus) {
    onUpdateStatus(appt.id, status, note || undefined);
    setShowNoteInput(false);
    setShowChange(false);
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-4 py-3 transition-colors border-b border-gray-50 last:border-0",
        isSelected ? "bg-[#EEF1F8]" : "hover:bg-gray-50/70",
        isCancelled && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(appt.id)}
        className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1B3163] accent-[#1B3163] shrink-0 cursor-pointer"
      />

      {/* Time column */}
      <div className="w-16 shrink-0 text-right hidden sm:block">
        <p className="text-sm font-semibold text-gray-700">{formatTime(appt.scheduledAt)}</p>
        <p className="text-xs text-gray-400">{formatDuration(appt.durationMinutes)}</p>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Client + service */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900">{appt.clientName}</p>
          <span className="text-gray-300 hidden sm:inline">·</span>
          <p className="text-sm text-gray-500">{appt.serviceName}</p>
          {/* Time on mobile */}
          <span className="text-xs text-gray-400 sm:hidden ml-auto">
            {formatTime(appt.scheduledAt)}
          </span>
        </div>

        {/* Staff + duration on mobile */}
        <p className="text-xs text-gray-400">
          {appt.staffName}
          <span className="sm:hidden"> · {formatDuration(appt.durationMinutes)}</span>
        </p>

        {/* Note (if present) */}
        {appt.note && !isPending && (
          <p className="text-xs text-gray-400 italic mt-0.5">"{appt.note}"</p>
        )}

        {/* Note input (visible while adding) */}
        {showNoteInput && (
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (e.g. called to cancel)…"
            maxLength={120}
            className="mt-1.5 w-full max-w-xs text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B3163] bg-white"
            autoFocus
          />
        )}
      </div>

      {/* Staff column — desktop only */}
      <div className="hidden lg:block w-28 shrink-0">
        <p className="text-xs text-gray-500 truncate">{appt.staffName}</p>
      </div>

      {/* Action / status column */}
      <div className="shrink-0 flex flex-col items-end gap-1.5">

        {/* ── Pending: quick-mark buttons ── */}
        {isPending && !showNoteInput && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => markAs("completed")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Attended</span>
            </button>
            <button
              type="button"
              onClick={() => setShowNoteInput(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">No-show</span>
            </button>
          </div>
        )}

        {/* ── Note input confirm / cancel ── */}
        {showNoteInput && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => markAs("no_show")}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              Confirm No-show
            </button>
            <button
              type="button"
              onClick={() => { setShowNoteInput(false); setNote(appt.note ?? ""); }}
              className="px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Marked: status badge + change ── */}
        {!isPending && !showNoteInput && (
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border"
              style={{ color: style.color, backgroundColor: style.bg, borderColor: style.border }}
            >
              {appt.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
              {appt.status === "no_show"   && <XCircle      className="w-3 h-3" />}
              {appt.status === "cancelled" && <Clock        className="w-3 h-3" />}
              {STATUS_LABELS[appt.status]}
            </span>

            {/* Change status (not for cancelled) */}
            {!isCancelled && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowChange((v) => !v)}
                  className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Change status"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showChange && (
                  <div className="absolute right-0 top-6 z-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-36">
                    {appt.status !== "completed" && (
                      <DropdownItem
                        icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        label="Mark attended"
                        onClick={() => markAs("completed")}
                      />
                    )}
                    {appt.status !== "no_show" && (
                      <DropdownItem
                        icon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                        label="Mark no-show"
                        onClick={() => markAs("no_show")}
                      />
                    )}
                    <DropdownItem
                      icon={<RotateCcw className="w-3.5 h-3.5 text-gray-400" />}
                      label="Undo / pending"
                      onClick={() => markAs("pending")}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Tiny dropdown item ─────────────────────────────────────── */
function DropdownItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}
