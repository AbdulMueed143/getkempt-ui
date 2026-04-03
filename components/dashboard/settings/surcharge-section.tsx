"use client";

import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  Percent, Plus, Trash2, AlertCircle,
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
    "w-full text-sm text-gray-900 border rounded-xl px-3 py-2.5 bg-white transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:border-transparent placeholder:text-gray-400",
    err ? "border-rose-300 bg-rose-50/30" : "border-gray-200 hover:border-gray-300"
  );

const TIME_PLACEHOLDER = "HH:MM";

let _uid = Date.now() + 1000;
const uid = () => `sr-${_uid++}`;

/* ── Empty rule template ── */
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

/* ── Quick-add presets ── */
const PRESETS = [
  {
    label: "Weekend Surcharge",
    icon: Calendar,
    rule: { name: "Weekend Surcharge", days: ["saturday", "sunday"] as SurchargeDay[], timeStart: "", timeEnd: "", surchargeType: "percentage" as const, surchargeValue: 10 },
  },
  {
    label: "After-Hours Surcharge",
    icon: Clock,
    rule: { name: "After-Hours Surcharge", days: [] as SurchargeDay[], timeStart: "18:00", timeEnd: "21:00", surchargeType: "percentage" as const, surchargeValue: 15 },
  },
  {
    label: "Sunday Surcharge",
    icon: Calendar,
    rule: { name: "Sunday Surcharge", days: ["sunday"] as SurchargeDay[], timeStart: "", timeEnd: "", surchargeType: "percentage" as const, surchargeValue: 20 },
  },
];

/* ── Helpers ── */
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
    <div id="surcharges" className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EEF1F8] flex items-center justify-center shrink-0">
          <Percent className="w-4 h-4 text-[#1B3163]" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900">Surcharge Rules</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Automatically add surcharges for weekends, after-hours, or other time windows
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1B3163] hover:bg-[#152748] transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Custom Rule
        </button>
      </div>

      {/* Quick presets */}
      <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
        <p className="text-xs font-medium text-gray-500 mb-2">Quick add</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => addPreset(p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3163] bg-white border border-[#D5DFF0] hover:border-[#1B3163] hover:bg-[#EEF1F8] transition-colors"
            >
              <p.icon className="w-3.5 h-3.5" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom rule add form */}
      {showAdd && (
        <div className="px-5 py-4 border-b border-[#EEF1F8] bg-[#F8F9FD] space-y-4">
          <p className="text-xs font-semibold text-gray-700">New Surcharge Rule</p>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Rule Name <span className="text-rose-500">*</span></label>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Saturday Premium, Late Night Surcharge"
              className={inputCls(!draft.name)}
            />
          </div>

          {/* Day picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              Applies on <span className="font-normal text-gray-400">(leave empty = every day)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDraftDay(day)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    draft.days.includes(day)
                      ? "bg-[#1B3163] text-white border-[#1B3163]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-[#1B3163] hover:text-[#1B3163]"
                  )}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </div>

          {/* Time window */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              Time window <span className="font-normal text-gray-400">(leave empty = all day)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={draft.timeStart}
                onChange={(e) => setDraft((d) => ({ ...d, timeStart: e.target.value }))}
                placeholder={TIME_PLACEHOLDER}
                className={cn(inputCls(), "w-32 font-mono")}
              />
              <span className="text-xs text-gray-400">to</span>
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
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                {draft.surchargeType === "percentage" ? "%" : "$"}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!draft.name || draft.surchargeValue <= 0}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#1B3163] hover:bg-[#152748] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add Rule
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {fields.length === 0 ? (
        <div className="py-10 text-center">
          <Percent className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No surcharge rules yet</p>
          <p className="text-xs text-gray-300 mt-1">Use quick add above or create a custom rule</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
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
              <li key={field.id} className={cn("px-4 py-3.5 space-y-3", !isActive && "opacity-60")}>
                {/* Row header */}
                <div className="flex items-center gap-3">
                  {/* Active toggle */}
                  <Toggle
                    checked={isActive}
                    onChange={(v) => setValue(`surchargeRules.${idx}.isActive`, v, { shouldDirty: true })}
                  />

                  <div className="flex-1 min-w-0">
                    {/* Editable name */}
                    <input
                      {...register(`surchargeRules.${idx}.name`)}
                      className={cn(
                        "w-full text-sm font-semibold text-gray-800 bg-transparent border-0 border-b",
                        "focus:outline-none focus:border-[#1B3163] transition-colors pb-0.5",
                        nameErr ? "border-rose-300" : "border-transparent hover:border-gray-200"
                      )}
                    />
                    <p className="text-xs text-gray-400 mt-0.5">
                      {describeRule(days, timeStart, timeEnd)}
                    </p>
                  </div>

                  {/* Surcharge badge */}
                  <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                    +{sValue}{sType === "percentage" ? "%" : " AUD"}
                  </span>

                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inline edit */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pl-11">
                  {/* Day picker */}
                  <div className="sm:col-span-2 lg:col-span-2 space-y-1.5">
                    <p className="text-xs font-medium text-gray-500">Days (empty = every day)</p>
                    <div className="flex flex-wrap gap-1">
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
                            "px-2 py-1 rounded text-xs font-semibold border transition-all",
                            (days as SurchargeDay[]).includes(day)
                              ? "bg-[#1B3163] text-white border-[#1B3163]"
                              : "bg-white text-gray-500 border-gray-200 hover:border-[#1B3163] hover:text-[#1B3163]"
                          )}
                        >
                          {DAY_LABELS[day]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time window */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500">From (empty = all day)</p>
                    <input
                      type="time"
                      {...register(`surchargeRules.${idx}.timeStart`)}
                      className={cn(inputCls(), "font-mono text-sm")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500">Until</p>
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
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500">Type</p>
                    <select
                      {...register(`surchargeRules.${idx}.surchargeType`)}
                      className={inputCls()}
                    >
                      <option value="percentage">% of price</option>
                      <option value="fixed_aud">Fixed AUD</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500">Amount</p>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        {...register(`surchargeRules.${idx}.surchargeValue`, { valueAsNumber: true })}
                        className={cn(inputCls(!!valueErr))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
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
