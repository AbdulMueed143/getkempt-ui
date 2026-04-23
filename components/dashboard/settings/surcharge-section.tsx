"use client";

import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  Plus, Trash2, AlertCircle,
  Clock, Calendar,
} from "lucide-react";
import type { StoreSettingsSchema } from "@/lib/validations/store-settings";
import { ALL_DAYS, DAY_LABELS, type SurchargeDay } from "@/types/store-settings";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils/cn";

interface Props {
  form: UseFormReturn<StoreSettingsSchema>;
}

const inputCls = (err?: boolean) =>
  cn(
    "w-full text-sm text-[#0D1B2A] border rounded-2xl px-4 py-3 bg-white/80 backdrop-blur-sm transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[#C4A882]/50 focus:border-[#C4A882] focus:bg-white focus:shadow-sm",
    "placeholder:text-[#6B7280]",
    err ? "border-rose-300 bg-rose-50/30" : "border-[#E8E4DA] hover:border-[#C4A882]/40 hover:shadow-sm"
  );

const TIME_PLACEHOLDER = "HH:MM";

let _uid = Date.now() + 1000;
const uid = () => `sr-${_uid++}`;

type DraftRule = {
  id: string;
  name: string;
  isActive: boolean;
  days: SurchargeDay[];
  timeStart: string;
  timeEnd: string;
  surchargeType: "percentage" | "fixed_aud";
  surchargeValue: number;
};

const EMPTY_RULE = (): DraftRule => ({
  id: uid(),
  name: "",
  isActive: true,
  days: [],
  timeStart: "",
  timeEnd: "",
  surchargeType: "percentage",
  surchargeValue: 10,
});

const PRESETS = [
  {
    label: "Weekend Surcharge",
    icon: Calendar,
    emoji: "🗓️",
    rule: { name: "Weekend Surcharge", days: ["saturday", "sunday"] as SurchargeDay[], timeStart: "", timeEnd: "", surchargeType: "percentage" as const, surchargeValue: 10 },
  },
  {
    label: "After-Hours",
    icon: Clock,
    emoji: "🌙",
    rule: { name: "After-Hours Surcharge", days: [] as SurchargeDay[], timeStart: "18:00", timeEnd: "21:00", surchargeType: "percentage" as const, surchargeValue: 15 },
  },
  {
    label: "Sunday Premium",
    icon: Calendar,
    emoji: "☀️",
    rule: { name: "Sunday Surcharge", days: ["sunday"] as SurchargeDay[], timeStart: "", timeEnd: "", surchargeType: "percentage" as const, surchargeValue: 20 },
  },
];

function describeRule(days: SurchargeDay[], timeStart?: string, timeEnd?: string): string {
  const dayPart = days.length === 0
    ? "Every day"
    : days.map((d) => DAY_LABELS[d]).join(", ");
  const timePart = timeStart && timeEnd ? ` · ${timeStart}–${timeEnd}` : "";
  return dayPart + timePart;
}

export function SurchargeSection({ form }: Props) {
  const { control, register, watch, setValue, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "surchargeRules" });

  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(EMPTY_RULE());

  function toggleDraftDay(day: SurchargeDay) {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  }

  function handleAdd() {
    if (!draft.name || draft.surchargeValue <= 0) return;
    append({ ...draft, id: uid() });
    setDraft(EMPTY_RULE());
    setShowAdd(false);
  }

  function addPreset(preset: typeof PRESETS[0]) {
    append({ id: uid(), isActive: true, ...preset.rule });
  }

  return (
    <div id="surcharges" className="divide-y divide-[#F0EEE6]">

      {/* Quick presets & actions */}
      <div className="px-5 sm:px-6 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-[#0D1B2A] tracking-wide">Quick add presets</p>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200",
              showAdd
                ? "bg-[#0D1B2A] text-white"
                : "bg-[#0D1B2A] text-white hover:bg-[#C4A882] hover:text-[#0D1B2A]"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            Custom Rule
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => addPreset(p)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#0D1B2A] bg-gradient-to-br from-[#F8F6F2] to-[#F5F3EE] border border-[#E8E4DA] hover:border-[#0D1B2A] hover:shadow-sm transition-all duration-200"
            >
              <span className="text-base">{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom rule add form */}
      {showAdd && (
        <div className="px-5 sm:px-6 py-5 bg-gradient-to-br from-[#FDFCFA] to-[#F8F6F2] space-y-4">
          <p className="text-xs font-bold text-[#0D1B2A]">New Surcharge Rule</p>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#6B7A99]">Rule Name <span className="text-rose-400">*</span></label>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Saturday Premium, Late Night Surcharge"
              className={inputCls(!draft.name)}
            />
          </div>

          {/* Day picker */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#6B7A99]">
              Applies on <span className="font-normal text-[#6B7280]">(leave empty = every day)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDraftDay(day)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200",
                    draft.days.includes(day)
                      ? "bg-[#0D1B2A] text-white border-[#0D1B2A] shadow-sm"
                      : "bg-white text-[#6B7A99] border-[#E8E4DA] hover:border-[#0D1B2A] hover:text-[#0D1B2A]"
                  )}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </div>

          {/* Time window */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#6B7A99]">
              Time window <span className="font-normal text-[#6B7280]">(leave empty = all day)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={draft.timeStart}
                onChange={(e) => setDraft((d) => ({ ...d, timeStart: e.target.value }))}
                placeholder={TIME_PLACEHOLDER}
                className={cn(inputCls(), "w-32 font-mono")}
              />
              <span className="text-xs text-[#6B7280] font-medium">to</span>
              <input
                type="time"
                value={draft.timeEnd}
                onChange={(e) => setDraft((d) => ({ ...d, timeEnd: e.target.value }))}
                placeholder={TIME_PLACEHOLDER}
                className={cn(inputCls(), "w-32 font-mono")}
              />
            </div>
          </div>

          {/* Surcharge amount */}
          <div className="flex items-center gap-2">
            <select
              value={draft.surchargeType}
              onChange={(e) => setDraft((d) => ({ ...d, surchargeType: e.target.value as "percentage" | "fixed_aud" }))}
              className={cn(inputCls(), "w-44")}
            >
              <option value="percentage">% of service price</option>
              <option value="fixed_aud">Fixed amount (AUD)</option>
            </select>
            <div className="relative w-28">
              <input
                type="number"
                min={0}
                max={draft.surchargeType === "percentage" ? 100 : 9999}
                value={draft.surchargeValue}
                onChange={(e) => setDraft((d) => ({ ...d, surchargeValue: Number(e.target.value) }))}
                className={inputCls()}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] pointer-events-none">
                {draft.surchargeType === "percentage" ? "%" : "$"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!draft.name || draft.surchargeValue <= 0}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0D1B2A] hover:bg-[#C4A882] hover:text-[#0D1B2A] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Add Rule
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-5 py-2.5 rounded-xl text-sm text-[#6B7280] hover:text-[#0D1B2A] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {fields.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">💲</span>
          </div>
          <p className="text-sm text-[#6B7280] font-medium">No surcharge rules yet</p>
          <p className="text-[11px] text-[#C4C9D4] mt-1">Use quick add above or create a custom rule</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#F0EEE6]">
          {fields.map((field, idx) => {
            const isActive      = watch(`surchargeRules.${idx}.isActive`);
            const sType         = watch(`surchargeRules.${idx}.surchargeType`);
            const sValue        = watch(`surchargeRules.${idx}.surchargeValue`);
            const days          = watch(`surchargeRules.${idx}.days`) ?? [];
            const timeStart     = watch(`surchargeRules.${idx}.timeStart`);
            const timeEnd       = watch(`surchargeRules.${idx}.timeEnd`);
            const nameErr       = errors.surchargeRules?.[idx]?.name;
            const valueErr      = errors.surchargeRules?.[idx]?.surchargeValue;

            return (
              <li key={field.id} className={cn("px-5 sm:px-6 py-5 space-y-4", !isActive && "opacity-50")}>
                {/* Row header */}
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={isActive}
                    onChange={(v) => setValue(`surchargeRules.${idx}.isActive`, v, { shouldDirty: true })}
                  />

                  <div className="flex-1 min-w-0">
                    <input
                      {...register(`surchargeRules.${idx}.name`)}
                      className={cn(
                        "w-full text-sm font-bold text-[#0D1B2A] bg-transparent border-0 border-b-2",
                        "focus:outline-none focus:border-[#C4A882] transition-colors pb-0.5",
                        nameErr ? "border-rose-300" : "border-transparent hover:border-[#E8E4DA]"
                      )}
                    />
                    <p className="text-[11px] text-[#6B7280] mt-1">
                      {describeRule(days, timeStart, timeEnd)}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 border border-violet-100">
                    +{sValue}{sType === "percentage" ? "%" : " AUD"}
                  </span>

                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-2 rounded-xl text-[#6B7280] hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inline edit */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pl-14">
                  {/* Day picker */}
                  <div className="sm:col-span-2 lg:col-span-2 space-y-2">
                    <p className="text-[11px] font-semibold text-[#6B7280]">Days (empty = every day)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_DAYS.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const current = days as SurchargeDay[];
                            const next = current.includes(day)
                              ? current.filter((d) => d !== day)
                              : [...current, day];
                            setValue(`surchargeRules.${idx}.days`, next, { shouldDirty: true });
                          }}
                          className={cn(
                            "px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200",
                            (days as SurchargeDay[]).includes(day)
                              ? "bg-[#0D1B2A] text-white border-[#0D1B2A]"
                              : "bg-white text-[#6B7280] border-[#E8E4DA] hover:border-[#0D1B2A] hover:text-[#0D1B2A]"
                          )}
                        >
                          {DAY_LABELS[day]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time window */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-[#6B7280]">From</p>
                    <input
                      type="time"
                      {...register(`surchargeRules.${idx}.timeStart`)}
                      className={cn(inputCls(), "font-mono text-sm")}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-[#6B7280]">Until</p>
                    <input
                      type="time"
                      {...register(`surchargeRules.${idx}.timeEnd`)}
                      className={cn(inputCls(!!errors.surchargeRules?.[idx]?.timeEnd), "font-mono text-sm")}
                    />
                    {errors.surchargeRules?.[idx]?.timeEnd && (
                      <p className="flex items-center gap-1 text-xs text-rose-500">
                        <AlertCircle className="w-3 h-3" />
                        {errors.surchargeRules[idx]?.timeEnd?.message}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-[#6B7280]">Type</p>
                    <select
                      {...register(`surchargeRules.${idx}.surchargeType`)}
                      className={inputCls()}
                    >
                      <option value="percentage">% of price</option>
                      <option value="fixed_aud">Fixed AUD</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-[#6B7280]">Amount</p>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        {...register(`surchargeRules.${idx}.surchargeValue`, { valueAsNumber: true })}
                        className={cn(inputCls(!!valueErr))}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] pointer-events-none">
                        {sType === "percentage" ? "%" : "$"}
                      </span>
                    </div>
                    {valueErr && (
                      <p className="flex items-center gap-1 text-xs text-rose-500">
                        <AlertCircle className="w-3 h-3" />
                        {valueErr.message}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
