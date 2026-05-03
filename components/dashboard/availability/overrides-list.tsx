"use client";

import { Plus, Pencil, Trash2, CalendarOff, Clock, AlarmClockOff, RefreshCw } from "lucide-react";
import type { AvailabilityOverride } from "@/types/availability";
import { cn } from "@/lib/utils/cn";

interface OverridesListProps {
  overrides: AvailabilityOverride[];
  onAdd: () => void;
  onEdit: (override: AvailabilityOverride) => void;
  onDelete: (id: string) => void;
}

/* ── Date / time helpers ─────────────────────────────────────────────── */

function formatDateLong(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateBlocks(dateStr: string): { weekday: string; day: string; month: string } {
  const d = new Date(dateStr + "T00:00:00");
  return {
    weekday: d.toLocaleDateString("en-AU", { weekday: "short" }).toUpperCase(),
    day: d.toLocaleDateString("en-AU", { day: "numeric" }),
    month: d.toLocaleDateString("en-AU", { month: "short" }).toUpperCase(),
  };
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0
    ? `${hour}${suffix}`
    : `${hour}:${m.toString().padStart(2, "0")}${suffix}`;
}

/* ── Component ───────────────────────────────────────────────────────── */

export function OverridesList({ overrides, onAdd, onEdit, onDelete }: OverridesListProps) {
  const today = new Date().toISOString().split("T")[0];

  const sorted = [...overrides].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((o) => o.date >= today);
  const past = sorted.filter((o) => o.date < today);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E2D9] overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-[#EAE7DE] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
          <RefreshCw className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[#0F172A] text-sm sm:text-base leading-tight">
            Date Overrides
          </h3>
          <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5">
            One-off days that change the regular schedule
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#1B3163] text-white hover:bg-[#15285A] transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Override</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div>
        {upcoming.length === 0 && past.length === 0 && (
          <div className="px-5 py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F2EC] mx-auto flex items-center justify-center mb-3">
              <CalendarOff className="w-5 h-5 text-[#94A3B8]" />
            </div>
            <p className="text-sm font-semibold text-[#0F172A]">No date overrides yet</p>
            <p className="text-xs text-[#64748B] mt-1 max-w-[18rem] mx-auto">
              Mark a day as closed (sick day, holiday) or change hours for a single date.
            </p>
            <button
              type="button"
              onClick={onAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#1B3163] text-white hover:bg-[#15285A] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add your first override
            </button>
          </div>
        )}

        {upcoming.length > 0 && (
          <div>
            <div className="px-5 pt-3 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Upcoming ({upcoming.length})
              </p>
            </div>
            <ul className="px-3 pb-2">
              {upcoming.map((o) => (
                <OverrideCard
                  key={o.id}
                  override={o}
                  onEdit={() => onEdit(o)}
                  onDelete={() => onDelete(o.id)}
                />
              ))}
            </ul>
          </div>
        )}

        {past.length > 0 && (
          <div className="border-t border-[#EAE7DE]">
            <div className="px-5 pt-3 pb-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                Past ({past.length})
              </p>
            </div>
            <ul className="px-3 pb-3">
              {past.map((o) => (
                <OverrideCard
                  key={o.id}
                  override={o}
                  onEdit={() => onEdit(o)}
                  onDelete={() => onDelete(o.id)}
                  dimmed
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Single override card
 *   Layout — left: date block, middle: state + slots, right: actions
 *   Strong color cue:
 *     Working → blue (altered hours)
 *     Closed  → rose (day off)
 * ───────────────────────────────────────────────────────────── */

interface OverrideCardProps {
  override: AvailabilityOverride;
  onEdit: () => void;
  onDelete: () => void;
  dimmed?: boolean;
}

function OverrideCard({ override, onEdit, onDelete, dimmed }: OverrideCardProps) {
  const blocks = formatDateBlocks(override.date);
  const isWorking = override.isWorking;

  return (
    <li
      className={cn(
        "group relative rounded-xl border my-1 transition-colors",
        dimmed && "opacity-60",
        isWorking
          ? "bg-white border-[#E5E2D9] hover:border-[#1B3163]/30"
          : "bg-rose-50/50 border-rose-200/70 hover:border-rose-300",
      )}
    >
      <div className="flex items-stretch gap-3 px-3 py-2.5 sm:px-4 sm:py-3">
        {/* Date block — calendar-like glanceable card */}
        <div
          className={cn(
            "shrink-0 w-12 sm:w-14 rounded-lg flex flex-col items-center justify-center text-center px-1 py-1.5",
            isWorking ? "bg-[#EEF1F8] text-[#1B3163]" : "bg-rose-100 text-rose-700",
          )}
        >
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 leading-none">
            {blocks.month}
          </span>
          <span className="text-lg sm:text-xl font-bold leading-none mt-0.5 tabular-nums">
            {blocks.day}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider opacity-70 leading-none mt-0.5">
            {blocks.weekday}
          </span>
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          {/* Status pill */}
          {isWorking ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1B3163] bg-[#EEF1F8] px-2 py-0.5 rounded-full leading-none">
              <Clock className="w-2.5 h-2.5" />
              Custom hours
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full leading-none">
              <AlarmClockOff className="w-2.5 h-2.5" />
              Closed
            </span>
          )}

          {/* Time slots or rest text */}
          {isWorking && override.slots.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {override.slots.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums text-[#0F172A] bg-white border border-[#E5E2D9] px-2 py-0.5 rounded-md"
                >
                  {formatTime(s.startTime)} – {formatTime(s.endTime)}
                  {s.label && <span className="text-[#64748B] font-normal">· {s.label}</span>}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-xs text-[#64748B]">
              {isWorking ? "No hours set" : "Day off — not bookable"}
            </p>
          )}

          {/* Full date for clarity */}
          <p className="mt-1.5 text-[11px] text-[#94A3B8]">{formatDateLong(override.date)}</p>

          {override.note && (
            <p className="mt-1 text-[11px] text-[#64748B] italic line-clamp-2">
              “{override.note}”
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit override"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#1B3163] hover:bg-[#EEF1F8] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete override"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#475569] hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}
