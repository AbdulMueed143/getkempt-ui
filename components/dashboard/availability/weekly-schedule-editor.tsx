"use client";

import { useState, useCallback, useMemo } from "react";
import { Save, CalendarRange, ChevronsDown, ChevronsUp, Globe2 } from "lucide-react";
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

  /** Set of days the user has expanded. Empty = all collapsed. */
  const [expandedDays, setExpandedDays] = useState<Set<DayOfWeek>>(() => new Set());

  function toggleDayExpanded(dow: DayOfWeek, next: boolean) {
    setExpandedDays((prev) => {
      const updated = new Set(prev);
      if (next) updated.add(dow);
      else updated.delete(dow);
      return updated;
    });
  }

  /* ── Helpers ── */
  const updateDay = useCallback(
    (
      dayOfWeek: DayOfWeek,
      updater: (prev: WeeklySchedule["days"][number]) => WeeklySchedule["days"][number],
    ) => {
      setSchedule((prev) => ({
        ...prev,
        days: prev.days.map((d) => (d.dayOfWeek === dayOfWeek ? updater(d) : d)),
      }));
      setIsDirty(true);
    },
    [],
  );

  /* ── Day toggle ── */
  function handleToggle(dayOfWeek: DayOfWeek) {
    updateDay(dayOfWeek, (d) => ({
      ...d,
      isWorking: !d.isWorking,
      slots:
        !d.isWorking && d.slots.length === 0
          ? [{ id: newSlotId(), startTime: "09:00", endTime: "17:00", type: "work" as SlotType }]
          : d.slots,
    }));
  }

  /* ── Slot operations ── */
  function handleAddSlot(dayOfWeek: DayOfWeek, type: SlotType) {
    updateDay(dayOfWeek, (d) => {
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
    value: string,
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

  /* ── Aggregate week summary for the header ── */
  const weekSummary = useMemo(() => {
    const open = schedule.days.filter((d) => d.isWorking).length;
    const totalMinutes = schedule.days.reduce((sum, d) => {
      if (!d.isWorking) return sum;
      const work = d.slots.filter((s) => (s.type ?? "work") === "work");
      const breaks = d.slots.filter((s) => (s.type ?? "work") === "break");
      const w = work.reduce((s, x) => s + diffMin(x.startTime, x.endTime), 0);
      const b = breaks.reduce((s, x) => s + diffMin(x.startTime, x.endTime), 0);
      return sum + Math.max(0, w - b);
    }, 0);
    const hours = Math.round(totalMinutes / 60);
    return { open, hours };
  }, [schedule]);

  /* ── Bulk expand / collapse ── */
  function handleExpandAll() {
    setExpandedDays(new Set(WEEK_DISPLAY_ORDER));
  }
  function handleCollapseAll() {
    setExpandedDays(new Set());
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E2D9] overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* ─── Header ─── */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-[#EAE7DE] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#1B3163] text-white flex items-center justify-center shrink-0">
          <CalendarRange className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[#0F172A] text-sm sm:text-base leading-tight">
            Weekly Schedule
          </h3>
          <p className="text-[11px] sm:text-xs text-[#64748B] mt-0.5 tabular-nums">
            {weekSummary.open}/7 days open · ~{weekSummary.hours}h / week
          </p>
        </div>
        {isDirty && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Unsaved
          </span>
        )}
      </div>

      {/* ─── Sub-header: timezone + bulk expand ─── */}
      <div className="px-4 sm:px-5 py-2.5 bg-[#F4F2EC] border-b border-[#EAE7DE] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-[#475569] min-w-0">
          <Globe2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">
            <span className="font-semibold text-[#0F172A]">{schedule.timezone}</span>
            <span className="hidden sm:inline text-[#94A3B8]"> · stored as UTC</span>
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleExpandAll}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1B3163] hover:bg-white px-2 py-1 rounded-md"
          >
            <ChevronsDown className="w-3 h-3" /> Expand all
          </button>
          <span className="text-[#CBD5E1]">·</span>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1B3163] hover:bg-white px-2 py-1 rounded-md"
          >
            <ChevronsUp className="w-3 h-3" /> Collapse
          </button>
        </div>
      </div>

      {/* ─── Day rows ─── */}
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-2.5 bg-[#FAF8F3]/40">
        {WEEK_DISPLAY_ORDER.map((dow) => {
          const dayData = schedule.days.find((d) => d.dayOfWeek === dow);
          if (!dayData) return null;
          return (
            <DayScheduleRow
              key={dow}
              day={dayData}
              expanded={expandedDays.has(dow)}
              onExpandedChange={(next) => toggleDayExpanded(dow, next)}
              onToggle={() => handleToggle(dow)}
              onAddSlot={(type) => handleAddSlot(dow, type)}
              onUpdateSlot={(slotId, field, value) =>
                handleUpdateSlot(dow, slotId, field, value)
              }
              onRemoveSlot={(slotId) => handleRemoveSlot(dow, slotId)}
            />
          );
        })}
      </div>

      {/* ─── Save bar ───
          Sticky on mobile when there are unsaved changes so it's
          always reachable without scrolling to the bottom.
      */}
      <div
        className={
          isDirty
            ? "sticky bottom-0 z-[5] bg-white/95 backdrop-blur-md border-t border-[#EAE7DE] px-4 sm:px-5 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_14px_rgba(15,23,42,0.05)]"
            : "px-4 sm:px-5 py-3 border-t border-[#EAE7DE] flex items-center justify-end gap-3"
        }
      >
        {isDirty && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 sm:hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Unsaved changes
          </span>
        )}
        <button
          type="button"
          disabled={!isDirty || isSaving}
          onClick={handleSave}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#1B3163] text-white hover:bg-[#15285A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving…" : "Save Schedule"}
        </button>
      </div>
    </div>
  );
}

/* ── Utility: time arithmetic ─────────────────────────────────────────── */

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59);
  const hh = Math.floor(total / 60).toString().padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

function diffMin(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}
