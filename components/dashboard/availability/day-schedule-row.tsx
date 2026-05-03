"use client";

import { useState } from "react";
import { Plus, X, Coffee, ChevronDown, Clock4 } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils/cn";
import type { DaySchedule, TimeSlot, DayOfWeek, SlotType } from "@/types/availability";
import { DAY_NAMES, DAY_SHORT } from "@/types/availability";

interface DayScheduleRowProps {
  day: DaySchedule;
  onToggle: () => void;
  onAddSlot: (type: SlotType) => void;
  onUpdateSlot: (
    slotId: string,
    field: keyof Pick<TimeSlot, "startTime" | "endTime" | "label">,
    value: string,
  ) => void;
  onRemoveSlot: (slotId: string) => void;
  /** Controlled expansion state owned by the parent */
  expanded: boolean;
  /** Toggle expansion (parent owns the source of truth) */
  onExpandedChange: (next: boolean) => void;
}

const WEEKEND: DayOfWeek[] = [0, 6];

/* ────────────────────────────────────────────────────────────────────
 * Helpers — kept pure & local so the component stays focused.
 * ──────────────────────────────────────────────────────────────────── */

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

function formatTime12h(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  // Drop trailing :00 to keep the summary tight ("9am" instead of "9:00am").
  return m === 0 ? `${hour}${suffix}` : `${hour}:${m.toString().padStart(2, "0")}${suffix}`;
}

function formatDuration(totalMin: number): string {
  if (totalMin <= 0) return "0h";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function summarizeSlots(slots: TimeSlot[]): {
  range: string | null;
  workMinutes: number;
  breakCount: number;
} {
  const work = slots.filter((s) => (s.type ?? "work") === "work");
  const breaks = slots.filter((s) => (s.type ?? "work") === "break");

  if (work.length === 0) return { range: null, workMinutes: 0, breakCount: breaks.length };

  const sorted = [...work].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const earliest = sorted[0].startTime;
  const latest = sorted[sorted.length - 1].endTime;

  // Sum each work slot's duration; subtract any break that falls inside that slot.
  let workMinutes = 0;
  for (const s of sorted) {
    workMinutes += Math.max(0, toMinutes(s.endTime) - toMinutes(s.startTime));
  }
  for (const b of breaks) {
    workMinutes -= Math.max(0, toMinutes(b.endTime) - toMinutes(b.startTime));
  }
  workMinutes = Math.max(0, workMinutes);

  return {
    range: `${formatTime12h(earliest)} – ${formatTime12h(latest)}`,
    workMinutes,
    breakCount: breaks.length,
  };
}

/* ────────────────────────────────────────────────────────────────────
 * DayScheduleRow
 * Collapsible card. Header is always visible and gives an at-a-glance
 * summary; details/editor are revealed on demand.
 * ──────────────────────────────────────────────────────────────────── */

export function DayScheduleRow({
  day,
  onToggle,
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot,
  expanded,
  onExpandedChange,
}: DayScheduleRowProps) {
  const isWeekend = WEEKEND.includes(day.dayOfWeek);

  function toggleExpanded() {
    onExpandedChange(!expanded);
  }

  const sortedSlots = [...day.slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const workSlots = sortedSlots.filter((s) => (s.type ?? "work") === "work");
  const summary = summarizeSlots(day.slots);

  function canRemove(slot: TimeSlot): boolean {
    return (slot.type ?? "work") === "break" || workSlots.length > 1;
  }

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all",
        day.isWorking
          ? "bg-white border-[#E5E2D9] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          : "bg-[#F4F2EC] border-[#E5E2D9]",
      )}
    >
      {/* ─────────── HEADER (always visible) ─────────── */}
      <div className="flex items-center gap-3 sm:gap-4 px-3 py-3 sm:px-4 sm:py-3.5">
        {/* Day badge — square block, fixed width so rows align */}
        <div
          className={cn(
            "shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center",
            day.isWorking
              ? isWeekend
                ? "bg-[#EEF1F8] text-[#1B3163]"
                : "bg-[#1B3163] text-white"
              : "bg-white border border-[#E5E2D9] text-[#94A3B8]",
          )}
        >
          <span className="text-[10px] font-semibold tracking-wider uppercase opacity-80">
            {DAY_SHORT[day.dayOfWeek]}
          </span>
          {day.isWorking ? (
            <span className="text-[11px] sm:text-xs font-bold leading-tight">
              {workSlots.length}{workSlots.length === 1 ? "" : "x"}
            </span>
          ) : (
            <span className="text-[10px] font-medium leading-tight">Off</span>
          )}
        </div>

        {/* Day name + summary */}
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${DAY_NAMES[day.dayOfWeek]} schedule`}
          className="flex-1 min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3163]/30 rounded-md"
        >
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-sm sm:text-base font-semibold truncate",
                day.isWorking ? "text-[#0F172A]" : "text-[#94A3B8]",
              )}
            >
              {DAY_NAMES[day.dayOfWeek]}
            </p>
            {day.isWorking ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Open
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                Closed
              </span>
            )}
          </div>

          {/* Summary line — most important visual change for scanability */}
          <div className="mt-1 flex items-center gap-2 text-xs sm:text-[13px]">
            {day.isWorking ? (
              summary.range ? (
                <>
                  <Clock4 className="w-3.5 h-3.5 text-[#1B3163] shrink-0" />
                  <span className="font-semibold text-[#1B3163]">{summary.range}</span>
                  <span className="text-[#94A3B8]">·</span>
                  <span className="text-[#475569] tabular-nums">
                    {formatDuration(summary.workMinutes)}
                  </span>
                  {summary.breakCount > 0 && (
                    <>
                      <span className="text-[#94A3B8]">·</span>
                      <span className="inline-flex items-center gap-0.5 text-amber-700">
                        <Coffee className="w-3 h-3" />
                        {summary.breakCount}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span className="text-[#94A3B8] italic">No hours set yet</span>
              )
            ) : (
              <span className="text-[#94A3B8]">Not scheduled</span>
            )}
          </div>
        </button>

        {/* Toggle + chevron */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Toggle
            checked={day.isWorking}
            onChange={onToggle}
            label={`Toggle ${DAY_NAMES[day.dayOfWeek]} working`}
            hideLabel
          />
          <button
            type="button"
            onClick={toggleExpanded}
            aria-label={expanded ? "Collapse" : "Expand"}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-[#475569] transition-transform",
              "hover:bg-[#F1EFE8]",
              expanded && "rotate-180",
            )}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─────────── EXPANDED EDITOR ─────────── */}
      {expanded && (
        <div className="border-t border-[#EAE7DE] px-3 sm:px-4 py-3 sm:py-4 space-y-2.5">
          {!day.isWorking ? (
            <div className="flex items-start gap-3 rounded-xl bg-white border border-dashed border-[#E5E2D9] px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-[#F4F2EC] flex items-center justify-center shrink-0">
                <Clock4 className="w-4 h-4 text-[#94A3B8]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#0F172A]">Closed all day</p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Turn the switch on to add working hours for {DAY_NAMES[day.dayOfWeek]}.
                </p>
              </div>
            </div>
          ) : (
            <>
              {sortedSlots.map((slot) => (
                <SlotRow
                  key={slot.id}
                  slot={slot}
                  onUpdate={(field, value) => onUpdateSlot(slot.id, field, value)}
                  onRemove={() => onRemoveSlot(slot.id)}
                  canRemove={canRemove(slot)}
                />
              ))}

              {/* Action buttons — bigger, mobile-first tap targets */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onAddSlot("work")}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-dashed border-[#1B3163]/40 text-[#1B3163] bg-[#1B3163]/[0.03] hover:bg-[#1B3163]/[0.07] active:scale-[.99] transition"
                >
                  <Plus className="w-4 h-4" />
                  Add work slot
                </button>
                <button
                  type="button"
                  onClick={() => onAddSlot("break")}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-dashed border-amber-400/60 text-amber-700 bg-amber-50 hover:bg-amber-100 active:scale-[.99] transition"
                >
                  <Coffee className="w-4 h-4" />
                  Add break
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
 * SlotRow
 * One time slot. Clearer hierarchy: type pill on the left, big times,
 * remove on the right. Label tucked into a second row only when needed.
 * ──────────────────────────────────────────────────────────────────── */

interface SlotRowProps {
  slot: TimeSlot;
  onUpdate: (
    field: keyof Pick<TimeSlot, "startTime" | "endTime" | "label">,
    value: string,
  ) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function SlotRow({ slot, onUpdate, onRemove, canRemove }: SlotRowProps) {
  const isBreak = (slot.type ?? "work") === "break";
  const [showLabel, setShowLabel] = useState(Boolean(slot.label));

  // Compute slot duration to show a tiny secondary cue.
  const minutes = Math.max(0, toMinutes(slot.endTime) - toMinutes(slot.startTime));

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        isBreak
          ? "bg-amber-50 border-amber-200"
          : "bg-white border-[#E5E2D9] hover:border-[#1B3163]/40",
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 px-3 py-2.5">
        {/* Type indicator */}
        <span
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
            isBreak ? "bg-amber-100 text-amber-700" : "bg-[#1B3163]/10 text-[#1B3163]",
          )}
          aria-hidden
        >
          {isBreak ? <Coffee className="w-3.5 h-3.5" /> : <Clock4 className="w-3.5 h-3.5" />}
        </span>

        {/* Time pickers — big, tappable */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <input
            type="time"
            value={slot.startTime}
            onChange={(e) => onUpdate("startTime", e.target.value)}
            aria-label="Start time"
            className={cn(
              "min-w-0 flex-1 sm:flex-none sm:w-28 text-base sm:text-sm font-bold text-[#0F172A] tabular-nums",
              "rounded-lg px-2.5 py-2 border focus:outline-none focus:ring-2 focus:border-transparent",
              isBreak
                ? "border-amber-200 focus:ring-amber-400 bg-white"
                : "border-[#CBD5E1] focus:ring-[#1B3163] bg-white",
            )}
            style={{ colorScheme: "light" }}
          />

          <span
            className={cn(
              "text-sm font-bold select-none shrink-0 px-0.5",
              isBreak ? "text-amber-500" : "text-[#94A3B8]",
            )}
            aria-hidden
          >
            →
          </span>

          <input
            type="time"
            value={slot.endTime}
            onChange={(e) => onUpdate("endTime", e.target.value)}
            aria-label="End time"
            className={cn(
              "min-w-0 flex-1 sm:flex-none sm:w-28 text-base sm:text-sm font-bold text-[#0F172A] tabular-nums",
              "rounded-lg px-2.5 py-2 border focus:outline-none focus:ring-2 focus:border-transparent",
              isBreak
                ? "border-amber-200 focus:ring-amber-400 bg-white"
                : "border-[#CBD5E1] focus:ring-[#1B3163] bg-white",
            )}
            style={{ colorScheme: "light" }}
          />
        </div>

        {/* Duration pill (desktop only — keep mobile clean) */}
        <span
          className={cn(
            "hidden md:inline-flex text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full shrink-0",
            isBreak ? "bg-amber-100 text-amber-700" : "bg-[#EEF1F8] text-[#1B3163]",
          )}
        >
          {formatDuration(minutes)}
        </span>

        {/* Remove */}
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove slot"
            className={cn(
              "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              isBreak
                ? "text-amber-500 hover:bg-amber-100 hover:text-amber-700"
                : "text-[#94A3B8] hover:bg-rose-50 hover:text-rose-500",
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Label — collapsed by default to reduce noise. */}
      {showLabel ? (
        <div className="px-3 pb-2.5 -mt-1">
          <input
            type="text"
            value={slot.label ?? ""}
            onChange={(e) => onUpdate("label", e.target.value)}
            placeholder={isBreak ? "Lunch, prayer, school run…" : "Morning shift, evening shift…"}
            maxLength={40}
            autoFocus={!slot.label}
            className={cn(
              "w-full text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-[#94A3B8]",
              isBreak
                ? "border-amber-200 focus:ring-amber-300 bg-white text-[#0F172A]"
                : "border-[#E2E8F0] focus:ring-[#1B3163] bg-white text-[#0F172A]",
            )}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowLabel(true)}
          className={cn(
            "ml-12 mb-2 -mt-0.5 text-[11px] font-medium underline-offset-2 hover:underline",
            isBreak ? "text-amber-700" : "text-[#64748B]",
          )}
        >
          + Add label
        </button>
      )}
    </div>
  );
}

