"use client";

import type { UseFormReturn } from "react-hook-form";
import { Clock, CalendarRange, AlertCircle } from "lucide-react";
import type { StoreSettingsSchema } from "@/lib/validations/store-settings";
import { SLOT_INTERVALS } from "@/types/store-settings";
import { cn } from "@/lib/utils/cn";

interface Props {
  form: UseFormReturn<StoreSettingsSchema>;
}

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

function toWindowDays(value: number, unit: "days" | "weeks" | "months"): number {
  if (unit === "days")   return value;
  if (unit === "weeks")  return value * 7;
  return value * 30;
}

function slotExamples(interval: number): string {
  const start = 9 * 60;
  const slots: string[] = [];
  for (let i = 0; i < 5; i++) {
    const m = start + i * interval;
    const h = Math.floor(m / 60);
    const min = m % 60;
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    slots.push(`${h12}:${min.toString().padStart(2, "0")} ${ampm}`);
  }
  return slots.join("  ·  ") + "  ·  …";
}

const inputCls = (err?: boolean) =>
  cn(
    "w-full text-sm text-gray-900 border rounded-xl px-3 py-2.5 bg-white transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:border-transparent placeholder:text-gray-400",
    err ? "border-rose-300 bg-rose-50/30" : "border-gray-200 hover:border-gray-300"
  );

export function SchedulingSection({ form }: Props) {
  const { register, watch, setValue, formState: { errors } } = form;

  const windowValue = watch("bookingWindowValue") ?? 4;
  const windowUnit  = watch("bookingWindowUnit")  ?? "weeks";
  const interval    = watch("slotInterval")        ?? 15;

  const deadlineDate = addDays(toWindowDays(Number(windowValue), windowUnit));

  return (
    <div id="scheduling" className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EEF1F8] flex items-center justify-center shrink-0">
          <CalendarRange className="w-4 h-4 text-[#1B3163]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Scheduling Limits</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Control how far in advance clients can book and the granularity of time slots
          </p>
        </div>
      </div>

      <div className="p-5 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 space-y-6">
        {/* ── Booking window ── */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700">
            Booking Window
            <span className="text-rose-500 ml-0.5">*</span>
          </label>

          <div className="flex items-center gap-2">
            <div className="w-24">
              <input
                {...register("bookingWindowValue", { valueAsNumber: true })}
                type="number"
                min={1}
                max={365}
                className={inputCls(!!errors.bookingWindowValue)}
              />
            </div>
            <select
              {...register("bookingWindowUnit")}
              className={cn(inputCls(!!errors.bookingWindowUnit), "w-32")}
            >
              <option value="days">days</option>
              <option value="weeks">weeks</option>
              <option value="months">months</option>
            </select>
            <span className="text-sm text-gray-500">in advance</span>
          </div>

          {errors.bookingWindowValue && (
            <p className="flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle className="w-3 h-3" />
              {errors.bookingWindowValue.message}
            </p>
          )}

          {/* Live preview */}
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-[#EEF1F8] rounded-lg px-3 py-2 mt-1">
            <CalendarRange className="w-3.5 h-3.5 text-[#1B3163] shrink-0" />
            <span>
              Clients can book until{" "}
              <strong className="text-[#1B3163]">{deadlineDate}</strong>
            </span>
          </div>
        </div>

        {/* ── Slot interval ── */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-700">
            Time Slot Interval
            <span className="text-rose-500 ml-0.5">*</span>
          </label>

          {/* Segmented control */}
          <div className="flex flex-wrap gap-2">
            {SLOT_INTERVALS.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setValue("slotInterval", mins, { shouldDirty: true })}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                  interval === mins
                    ? "bg-[#1B3163] text-white border-[#1B3163] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1B3163] hover:text-[#1B3163]"
                )}
              >
                {mins} min
              </button>
            ))}
          </div>

          {/* Live slot example */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
              <Clock className="w-3.5 h-3.5 text-[#1B3163] shrink-0" />
              <span className="font-medium text-gray-600">Example&nbsp;&nbsp;</span>
              <span className="font-mono text-gray-700">{slotExamples(interval)}</span>
            </div>
            <p className="text-xs text-gray-400 pl-1">
              Slots are generated from your staff's working hours using this interval
            </p>
          </div>

          {errors.slotInterval && (
            <p className="flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle className="w-3 h-3" />
              {errors.slotInterval.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
