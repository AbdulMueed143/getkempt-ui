"use client";

import { Plus, X, Coffee } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils/cn";
import type { DaySchedule, TimeSlot, DayOfWeek, SlotType } from "@/types/availability";
import { DAY_SHORT } from "@/types/availability";

interface DayScheduleRowProps {
  day: DaySchedule;
  onToggle: () => void;
  onAddSlot: (type: SlotType) => void;
  onUpdateSlot: (
    slotId: string,
    field: keyof Pick<TimeSlot, "startTime" | "endTime" | "label">,
    value: string
  ) => void;
  onRemoveSlot: (slotId: string) => void;
}

const WEEKEND: DayOfWeek[] = [0, 6];

export function DayScheduleRow({
  day,
  onToggle,
  onAddSlot,
  onUpdateSlot,
  onRemoveSlot,
}: DayScheduleRowProps) {
  const isWeekend = WEEKEND.includes(day.dayOfWeek);
  const sortedSlots = [...day.slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const workSlotCount = day.slots.filter((s) => (s.type ?? "work") === "work").length;

  function canRemove(slot: TimeSlot): boolean {
    return (slot.type ?? "work") === "break" || workSlotCount > 1;
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        day.isWorking ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"
      )}
    >
      {/* Day header */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "w-12 text-center text-xs font-semibold py-1 rounded-full shrink-0",
            isWeekend ? "bg-[#EEF1F8] text-[#1B3163]" : "bg-gray-100 text-gray-600"
          )}
        >
          {DAY_SHORT[day.dayOfWeek]}
        </span>

        <Toggle checked={day.isWorking} onChange={onToggle} />

        <span className="text-sm text-gray-500 select-none">
          {day.isWorking ? "Working" : "Day off"}
        </span>

        {day.isWorking && (
          <span className="ml-auto text-xs text-gray-400 hidden sm:block">
            {workSlotCount} work · {day.slots.length - workSlotCount} break
          </span>
        )}
      </div>

      {/* Slots */}
      {day.isWorking && (
        <div className="mt-3 pl-1 space-y-2">
          {sortedSlots.map((slot) => (
            <SlotRow
              key={slot.id}
              slot={slot}
              onUpdate={(field, value) => onUpdateSlot(slot.id, field, value)}
              onRemove={() => onRemoveSlot(slot.id)}
              canRemove={canRemove(slot)}
            />
          ))}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onAddSlot("work")}
              className="flex items-center gap-1.5 text-xs text-[#1B3163] hover:text-[#15285A] font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add time slot
            </button>
            <span className="text-gray-200 select-none">|</span>
            <button
              type="button"
              onClick={() => onAddSlot("break")}
              className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              <Coffee className="w-3.5 h-3.5" />
              Add break
            </button>
          </div>
        </div>
      )}

      {!day.isWorking && (
        <p className="mt-2 pl-1 text-xs text-gray-400 italic">
          Not scheduled — toggle to set working hours
        </p>
      )}
    </div>
  );
}

/* ── Single time slot row ─────────────────────────────────────────────
 * Layout:
 *   Line 1 — [badge?] [start →  end] [remove]    (always on one line)
 *   Line 2 — [label input, full width]             (always below times)
 * Works cleanly on all screen widths.
 * ─────────────────────────────────────────────────────────────────── */

interface SlotRowProps {
  slot: TimeSlot;
  onUpdate: (
    field: keyof Pick<TimeSlot, "startTime" | "endTime" | "label">,
    value: string
  ) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const timeInputClass = (isBreak: boolean) =>
  cn(
    "w-28 text-sm font-semibold text-gray-900 rounded-lg px-2 py-1.5",
    "border focus:outline-none focus:ring-2 focus:border-transparent",
    isBreak
      ? "border-amber-300 focus:ring-amber-400 bg-white"
      : "border-gray-400 focus:ring-[#1B3163] bg-white"
  );

function SlotRow({ slot, onUpdate, onRemove, canRemove }: SlotRowProps) {
  const isBreak = (slot.type ?? "work") === "break";

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5 space-y-2",
        isBreak ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"
      )}
    >
      {/* ── Line 1: times + remove ── */}
      <div className="flex items-center gap-2">
        {isBreak && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
            <Coffee className="w-3 h-3" />
            Break
          </span>
        )}

        <input
          type="time"
          value={slot.startTime}
          onChange={(e) => onUpdate("startTime", e.target.value)}
          className={timeInputClass(isBreak)}
          style={{ colorScheme: "light" }}
        />

        <span className={cn("text-sm select-none shrink-0", isBreak ? "text-amber-400" : "text-gray-400")}>
          →
        </span>

        <input
          type="time"
          value={slot.endTime}
          onChange={(e) => onUpdate("endTime", e.target.value)}
          className={timeInputClass(isBreak)}
          style={{ colorScheme: "light" }}
        />

        {/* Remove pushed to the right */}
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove slot"
            className={cn(
              "ml-auto shrink-0 transition-colors",
              isBreak ? "text-amber-300 hover:text-amber-600" : "text-gray-300 hover:text-rose-500"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Line 2: optional label (full width) ── */}
      <input
        type="text"
        value={slot.label ?? ""}
        onChange={(e) => onUpdate("label", e.target.value)}
        placeholder={isBreak ? "Label, e.g. Lunch, Prayer…" : "Label (optional)"}
        maxLength={40}
        className={cn(
          "w-full text-xs rounded-md px-2 py-1.5 border focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-gray-300",
          isBreak
            ? "border-amber-200 focus:ring-amber-300 bg-white text-gray-700"
            : "border-gray-200 focus:ring-[#1B3163] bg-white text-gray-600"
        )}
      />
    </div>
  );
}
