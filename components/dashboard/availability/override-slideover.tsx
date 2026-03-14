"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Trash2, CalendarDays, Info, Coffee } from "lucide-react";
import { overrideFormSchema, type OverrideFormValues } from "@/lib/validations/availability";
import type { AvailabilityOverride } from "@/types/availability";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils/cn";

interface OverrideSlideoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: OverrideFormValues, editingId?: string) => void;
  staffId: string;
  staffName: string;
  editing?: AvailabilityOverride | null;
}

const DEFAULT_VALUES: OverrideFormValues = {
  staffId: "",
  date: "",
  isWorking: false,
  slots: [],
  note: "",
};

const DEFAULT_WORK_SLOT = { startTime: "09:00", endTime: "17:00", type: "work" as const, label: "" };

export function OverrideSlideover({
  isOpen,
  onClose,
  onSave,
  staffId,
  staffName,
  editing,
}: OverrideSlideoverProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OverrideFormValues>({
    resolver: zodResolver(overrideFormSchema),
    defaultValues: { ...DEFAULT_VALUES, staffId },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "slots" });

  const isWorking = watch("isWorking");

  /* ── Sync when editing object or staffId changes ── */
  useEffect(() => {
    if (editing) {
      reset({
        staffId: editing.staffId,
        date: editing.date,
        isWorking: editing.isWorking,
        slots: editing.slots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
          type: s.type ?? "work",
          label: s.label ?? "",
        })),
        note: editing.note ?? "",
      });
    } else {
      reset({ ...DEFAULT_VALUES, staffId });
    }
  }, [editing, staffId, reset]);

  /* ── Auto-add a default slot when toggling to working ── */
  function handleWorkingToggle(val: boolean) {
    setValue("isWorking", val);
    if (val && fields.length === 0) {
      append(DEFAULT_WORK_SLOT);
    }
  }

  function handleAddSlot(type: "work" | "break" = "work") {
    const last = fields[fields.length - 1];
    const startTime = last ? addMinutes(last.endTime, 15) : "09:00";
    const endTime = addMinutes(startTime, type === "break" ? 30 : 60);
    append({ startTime, endTime, type: type as "work" | "break", label: "" });
  }

  function onSubmit(values: OverrideFormValues) {
    onSave(values, editing?.id);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50",
          "flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#1B3163]" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {editing ? "Edit Override" : "Add Date Override"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{staffName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* UTC notice */}
            <div className="flex items-start gap-2 bg-[#EEF1F8] rounded-lg p-3 text-xs text-[#1B3163]">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              Times are in your shop timezone (Australia/Melbourne). Stored as UTC on the backend.
            </div>

            {/* ── Date ── */}
            <section>
              <SectionHeader label="Override Date" />
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className={cn(
                    "w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:border-transparent bg-white",
                    errors.date ? "border-rose-400" : "border-gray-200"
                  )}
                />
                {errors.date && (
                  <p className="mt-1 text-xs text-rose-500">{errors.date.message}</p>
                )}
              </div>
            </section>

            {/* ── Working / Off ── */}
            <section>
              <SectionHeader label="Availability" />
              <div className="mt-3 flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isWorking ? "Working this day" : "Not available"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isWorking
                      ? "Set custom hours below"
                      : "Staff will be marked unavailable for the full day"}
                  </p>
                </div>
                <Controller
                  control={control}
                  name="isWorking"
                  render={({ field }) => (
                    <Toggle
                      checked={field.value}
                      onChange={handleWorkingToggle}
                    />
                  )}
                />
              </div>
            </section>

            {/* ── Time slots (only when working) ── */}
            {isWorking && (
              <section>
                <SectionHeader label="Time Slots" />
                <p className="text-xs text-gray-400 mb-3">
                  Add multiple slots for split shifts or breaks between sessions.
                </p>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3"
                    >
                      {/* Slot header: type + remove */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">
                            Slot {index + 1}
                          </span>
                          {/* Type toggle */}
                          <select
                            {...register(`slots.${index}.type`)}
                            className="text-xs border border-gray-200 rounded-md px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1B3163]"
                          >
                            <option value="work">Work</option>
                            <option value="break">Break</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-gray-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Start</label>
                          <input
                            type="time"
                            {...register(`slots.${index}.startTime`)}
                            className={cn(
                              "w-full text-sm font-semibold text-gray-900 border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B3163] bg-white",
                              errors.slots?.[index]?.startTime ? "border-rose-400" : "border-gray-400"
                            )}
                            style={{ colorScheme: "light" }}
                          />
                          {errors.slots?.[index]?.startTime && (
                            <p className="mt-1 text-xs text-rose-500">
                              {errors.slots[index]?.startTime?.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">End</label>
                          <input
                            type="time"
                            {...register(`slots.${index}.endTime`)}
                            className={cn(
                              "w-full text-sm font-semibold text-gray-900 border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B3163] bg-white",
                              errors.slots?.[index]?.endTime ? "border-rose-400" : "border-gray-400"
                            )}
                            style={{ colorScheme: "light" }}
                          />
                          {errors.slots?.[index]?.endTime && (
                            <p className="mt-1 text-xs text-rose-500">
                              {errors.slots[index]?.endTime?.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Label <span className="text-gray-300">(optional)</span>
                        </label>
                        <input
                          type="text"
                          {...register(`slots.${index}.label`)}
                          placeholder="e.g. Morning session, Lunch…"
                          maxLength={40}
                          className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1B3163] bg-white placeholder:text-gray-300"
                        />
                      </div>
                    </div>
                  ))}

                  {/* Slot-level error (e.g. "at least one slot" message) */}
                  {errors.slots?.root && (
                    <p className="text-xs text-rose-500">{errors.slots.root.message}</p>
                  )}
                  {typeof errors.slots?.message === "string" && (
                    <p className="text-xs text-rose-500">{errors.slots.message}</p>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleAddSlot("work")}
                      className="flex items-center gap-1.5 text-sm text-[#1B3163] hover:text-[#15285A] font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add time slot
                    </button>
                    <span className="text-gray-200 select-none">|</span>
                    <button
                      type="button"
                      onClick={() => handleAddSlot("break")}
                      className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
                    >
                      <Coffee className="w-4 h-4" />
                      Add break
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ── Note ── */}
            <section>
              <SectionHeader label="Note" optional />
              <textarea
                {...register("note")}
                rows={3}
                placeholder="e.g. Annual leave, medical appointment, covering for colleague…"
                maxLength={200}
                className="mt-3 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:border-transparent bg-white placeholder:text-gray-300"
              />
              {errors.note && (
                <p className="mt-1 text-xs text-rose-500">{errors.note.message}</p>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium bg-[#1B3163] text-white rounded-lg hover:bg-[#15285A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Saving…" : editing ? "Update Override" : "Save Override"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/* ── Section header ──────────────────────────────────────────────────── */

function SectionHeader({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-0.5">
      <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{label}</h4>
      {optional && <span className="text-xs text-gray-400">(optional)</span>}
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

/* ── Utility ─────────────────────────────────────────────────────────── */

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59);
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
}
