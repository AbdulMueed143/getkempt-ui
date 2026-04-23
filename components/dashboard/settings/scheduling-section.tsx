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
    "w-full text-sm text-[#0D1B2A] border rounded-2xl px-4 py-3 bg-white/80 backdrop-blur-sm transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[#C4A882]/50 focus:border-[#C4A882] focus:bg-white focus:shadow-sm",
    "placeholder:text-[#6B7280]",
    err ? "border-rose-300 bg-rose-50/30" : "border-[#E8E4DA] hover:border-[#C4A882]/40 hover:shadow-sm"
  );

export function SchedulingSection({ form }: Props) {
  const { register, watch, setValue, formState: { errors } } = form;

  const windowValue = watch("bookingWindowValue") ?? 4;
  const windowUnit  = watch("bookingWindowUnit")  ?? "weeks";
  const interval    = watch("slotInterval")        ?? 15;

  const deadlineDate = addDays(toWindowDays(Number(windowValue), windowUnit));

  return (
    <div id="scheduling" className="p-5 sm:p-6 space-y-6">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 space-y-6">
        {/* ── Booking window ── */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#0D1B2A] tracking-wide">
            Booking Window
            <span className="text-rose-400 ml-0.5">*</span>
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
            <span className="text-sm text-[#6B7280] font-medium">in advance</span>
          </div>

          {errors.bookingWindowValue && (
            <p className="flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle className="w-3 h-3" />
              {errors.bookingWindowValue.message}
            </p>
          )}

          {/* Live preview */}
          <div className="flex items-center gap-2.5 text-xs bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl px-4 py-3 border border-blue-100/60">
            <CalendarRange className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-blue-800">
              Clients can book until{" "}
              <strong className="font-bold">{deadlineDate}</strong>
            </span>
          </div>
        </div>

        {/* ── Slot interval ── */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#0D1B2A] tracking-wide">
            Time Slot Interval
            <span className="text-rose-400 ml-0.5">*</span>
          </label>

          {/* Segmented control */}
          <div className="flex flex-wrap gap-2">
            {SLOT_INTERVALS.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setValue("slotInterval", mins, { shouldDirty: true })}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200",
                  interval === mins
                    ? "bg-[#0D1B2A] text-white border-[#0D1B2A] shadow-sm scale-[1.02]"
                    : "bg-white text-[#6B7A99] border-[#E8E4DA] hover:border-[#0D1B2A] hover:text-[#0D1B2A] hover:shadow-sm"
                )}
              >
                {mins} min
              </button>
            ))}
          </div>

          {/* Live slot example */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 text-xs bg-gradient-to-r from-[#F8F6F2] to-[#F5F3EE] rounded-xl px-4 py-3 border border-[#E8E4DA]">
              <Clock className="w-4 h-4 text-[#0D1B2A] shrink-0" />
              <span className="font-medium text-[#6B7A99]">Example&nbsp;&nbsp;</span>
              <span className="font-mono text-[#0D1B2A] text-[11px]">{slotExamples(interval)}</span>
            </div>
            <p className="text-[11px] text-[#6B7280] pl-1">
              Slots are generated from your staff&apos;s working hours using this interval
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
