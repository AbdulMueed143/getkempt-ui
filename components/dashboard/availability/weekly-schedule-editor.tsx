"use client";

import { useState, useCallback } from "react";
import { Save, Clock, Info } from "lucide-react";
import { DayScheduleRow } from "./day-schedule-row";
import type { WeeklySchedule, DayOfWeek, TimeSlot, SlotType } from "@/types/availability";
import { WEEK_DISPLAY_ORDER } from "@/types/availability";

interface WeeklyScheduleEditorProps {
  initialSchedule: WeeklySchedule;
  onSave: (updated: WeeklySchedule) => Promise<void>;
}

function newSlotId() {
  return `sl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function WeeklyScheduleEditor({ initialSchedule, onSave }: WeeklyScheduleEditorProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /* ── Helpers ── */

  const updateDay = useCallback(
    (dayOfWeek: DayOfWeek, updater: (prev: WeeklySchedule["days"][number]) => WeeklySchedule["days"][number]) => {
      setSchedule((prev) => ({
        ...prev,
        days: prev.days.map((d) => (d.dayOfWeek === dayOfWeek ? updater(d) : d)),
      }));
      setIsDirty(true);
    },
    []
  );

  /* ── Day toggle ── */

  function handleToggle(dayOfWeek: DayOfWeek) {
    updateDay(dayOfWeek, (d) => ({
      ...d,
      isWorking: !d.isWorking,
      // Add a default work slot when turning on with no existing slots
      slots:
        !d.isWorking && d.slots.length === 0
          ? [{ id: newSlotId(), startTime: "09:00", endTime: "17:00", type: "work" as SlotType }]
          : d.slots,
    }));
  }

  /* ── Slot operations ── */

  function handleAddSlot(dayOfWeek: DayOfWeek, type: SlotType) {
    updateDay(dayOfWeek, (d) => {
      // Find a sensible default start time based on last slot end
      const sorted = [...d.slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
      const last = sorted[sorted.length - 1];
      const startTime = last ? addMinutes(last.endTime, 15) : "09:00";
      const endTime = addMinutes(startTime, type === "break" ? 30 : 60);
      return {
        ...d,
        slots: [...d.slots, { id: newSlotId(), startTime, endTime, type }],
      };
    });
  }

  function handleUpdateSlot(
    dayOfWeek: DayOfWeek,
    slotId: string,
    field: keyof Pick<TimeSlot, "startTime" | "endTime" | "label">,
    value: string
  ) {
    updateDay(dayOfWeek, (d) => ({
      ...d,
      slots: d.slots.map((s) => (s.id === slotId ? { ...s, [field]: value } : s)),
    }));
  }

  function handleRemoveSlot(dayOfWeek: DayOfWeek, slotId: string) {
    updateDay(dayOfWeek, (d) => ({
      ...d,
      slots: d.slots.filter((s) => s.id !== slotId),
    }));
  }

  /* ── Save ── */

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave({ ...schedule, updatedAt: new Date().toISOString() });
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#1B3163]" />
          <h3 className="font-semibold text-gray-900 text-sm">Weekly Schedule</h3>
        </div>
        {isDirty && (
          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
            Unsaved changes
          </span>
        )}
      </div>

      {/* Timezone note */}
      <div className="px-5 py-2.5 bg-[#EEF1F8] flex items-center gap-2 text-xs text-[#1B3163]">
        <Info className="w-3.5 h-3.5 shrink-0" />
        Times shown in {schedule.timezone} — stored as UTC on the backend
      </div>

      {/* Day rows */}
      <div className="p-5 space-y-3">
        {WEEK_DISPLAY_ORDER.map((dow) => {
          const dayData = schedule.days.find((d) => d.dayOfWeek === dow);
          if (!dayData) return null;
          return (
            <DayScheduleRow
              key={dow}
              day={dayData}
              onToggle={() => handleToggle(dow)}
              onAddSlot={(type) => handleAddSlot(dow, type)}
              onUpdateSlot={(slotId, field, value) => handleUpdateSlot(dow, slotId, field, value)}
              onRemoveSlot={(slotId) => handleRemoveSlot(dow, slotId)}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
        <button
          type="button"
          disabled={!isDirty || isSaving}
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#1B3163] text-white hover:bg-[#15285A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving…" : "Save Schedule"}
        </button>
      </div>
    </div>
  );
}

/* ── Utility: add minutes to an HH:MM string ─────────────────────────── */

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59);
  const hh = Math.floor(total / 60).toString().padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}
