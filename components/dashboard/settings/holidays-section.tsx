"use client";

import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  CalendarOff, Plus, Trash2, AlertCircle,
  ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";
import type { StoreSettingsSchema } from "@/lib/validations/store-settings";
import { VIC_PUBLIC_HOLIDAYS_2026 } from "@/lib/mock/store-settings";
import { cn } from "@/lib/utils/cn";

interface Props {
  form: UseFormReturn<StoreSettingsSchema>;
}

const inputCls = (err?: boolean) =>
  cn(
    "w-full text-sm text-[#0D1B2A] border rounded-2xl px-4 py-3 bg-white/80 backdrop-blur-sm transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[#C4A882]/50 focus:border-[#C4A882] focus:bg-white focus:shadow-sm",
    "placeholder:text-[#8E95A5]",
    err ? "border-rose-300 bg-rose-50/30" : "border-[#E8ECF4] hover:border-[#C4A882]/40 hover:shadow-sm"
  );

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-AU", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

let _uid = Date.now();
const uid = () => `h-${_uid++}`;

export function HolidaysSection({ form }: Props) {
  const { control, register, watch, setValue, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "holidays" });

  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    name: "", date: "", appliesTo: "all" as "all",
    hasSurcharge: false, surchargeType: "percentage" as "percentage" | "fixed_aud",
    surchargeValue: 10,
  });

  function handleAddHoliday() {
    if (!draft.name || !draft.date) return;
    append({
      id: uid(),
      name:         draft.name,
      date:         draft.date,
      appliesTo:    draft.appliesTo,
      hasSurcharge: draft.hasSurcharge,
      surchargeType:  draft.hasSurcharge ? draft.surchargeType  : undefined,
      surchargeValue: draft.hasSurcharge ? draft.surchargeValue : undefined,
    });
    setDraft({ name: "", date: "", appliesTo: "all", hasSurcharge: false, surchargeType: "percentage", surchargeValue: 10 });
    setShowAdd(false);
  }

  function handleAddVicHolidays() {
    const existingDates = new Set(fields.map((f) => f.date));
    const toAdd = VIC_PUBLIC_HOLIDAYS_2026.filter((h) => !existingDates.has(h.date));
    toAdd.forEach((h) => append({ id: uid(), ...h }));
  }

  return (
    <div id="holidays" className="divide-y divide-[#F0F3FA]">
      {/* Action bar */}
      <div className="px-5 sm:px-6 py-4 flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleAddVicHolidays}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#0D1B2A] bg-gradient-to-br from-[#F8F6F2] to-[#F4F2EE] border border-[#E8ECF4] hover:shadow-sm hover:border-[#C4A882]/40 transition-all duration-200"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add VIC Public Holidays</span>
          <span className="sm:hidden">VIC Holidays</span>
        </button>
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
          Add Holiday
        </button>
      </div>

      {/* Add holiday inline form */}
      {showAdd && (
        <div className="px-5 sm:px-6 py-5 bg-gradient-to-br from-[#FDFCFA] to-[#F8F6F2] space-y-4">
          <p className="text-xs font-bold text-[#0D1B2A]">New Holiday / Closure</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#6B7A99]">Name <span className="text-rose-400">*</span></label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. ANZAC Day, Shop Closed"
                className={inputCls(!draft.name && showAdd)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#6B7A99]">Date <span className="text-rose-400">*</span></label>
              <input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                className={inputCls(!draft.date && showAdd)}
              />
            </div>
          </div>

          {/* Surcharge toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={draft.hasSurcharge}
              onClick={() => setDraft((d) => ({ ...d, hasSurcharge: !d.hasSurcharge }))}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
                draft.hasSurcharge ? "bg-[#0D1B2A]" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                  draft.hasSurcharge ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <span className="text-xs text-[#0D1B2A] font-medium">Apply surcharge on this day</span>
          </div>

          {draft.hasSurcharge && (
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
                {draft.surchargeType === "fixed_aud" && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8E95A5] pointer-events-none">$</span>
                )}
                <input
                  type="number"
                  min={0}
                  max={draft.surchargeType === "percentage" ? 100 : 9999}
                  value={draft.surchargeValue}
                  onChange={(e) => setDraft((d) => ({ ...d, surchargeValue: Number(e.target.value) }))}
                  className={cn(inputCls(), draft.surchargeType === "fixed_aud" ? "pl-7" : "")}
                />
                {draft.surchargeType === "percentage" && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8E95A5] pointer-events-none">%</span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddHoliday}
              disabled={!draft.name || !draft.date}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0D1B2A] hover:bg-[#C4A882] hover:text-[#0D1B2A] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Add Holiday
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-5 py-2.5 rounded-xl text-sm text-[#8E95A5] hover:text-[#0D1B2A] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Holiday list */}
      {fields.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F8F6F2] to-[#F4F2EE] flex items-center justify-center mx-auto mb-3">
            <CalendarOff className="w-7 h-7 text-[#C4C9D4]" />
          </div>
          <p className="text-sm text-[#8E95A5] font-medium">No holidays added yet</p>
          <p className="text-[11px] text-[#C4C9D4] mt-1">Add custom dates or import VIC public holidays above</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#F0F3FA]">
          {fields
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((field, idx) => {
              const realIdx = fields.findIndex((f) => f.id === field.id);
              const isExpanded = expandedId === field.id;
              const hasSurcharge = watch(`holidays.${realIdx}.hasSurcharge`);

              return (
                <li key={field.id} className="px-5 sm:px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Date badge */}
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100/60 flex flex-col items-center justify-center">
                      <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                        {field.date ? new Date(field.date + "T12:00:00").toLocaleDateString("en-AU", { month: "short" }) : "—"}
                      </div>
                      <div className="text-xl font-bold text-[#0D1B2A] leading-none">
                        {field.date ? new Date(field.date + "T12:00:00").getDate() : "—"}
                      </div>
                    </div>

                    {/* Name & date */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0D1B2A]">{field.name}</p>
                      <p className="text-[11px] text-[#8E95A5] mt-0.5">{formatDate(field.date)}</p>
                    </div>

                    {/* Surcharge badge */}
                    {hasSurcharge ? (
                      <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                        +{watch(`holidays.${realIdx}.surchargeValue`)}
                        {watch(`holidays.${realIdx}.surchargeType`) === "percentage" ? "%" : " AUD"}
                      </span>
                    ) : (
                      <span className="hidden sm:inline-flex text-[11px] text-[#C4C9D4] shrink-0">No surcharge</span>
                    )}

                    {/* Expand / delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : field.id)}
                        className="p-2 rounded-xl text-[#8E95A5] hover:text-[#6B7A99] hover:bg-[#F4F2EE] transition-all duration-200"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(realIdx)}
                        className="p-2 rounded-xl text-[#8E95A5] hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline edit panel */}
                  {isExpanded && (
                    <div className="mt-4 ml-17 pl-3 border-l-2 border-[#E8ECF4] space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-[#6B7A99]">Name</label>
                          <input
                            {...register(`holidays.${realIdx}.name`)}
                            className={inputCls(!!errors.holidays?.[realIdx]?.name)}
                          />
                          {errors.holidays?.[realIdx]?.name && (
                            <p className="flex items-center gap-1 text-xs text-rose-500">
                              <AlertCircle className="w-3 h-3" />
                              {errors.holidays[realIdx]?.name?.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-[#6B7A99]">Date</label>
                          <input
                            type="date"
                            {...register(`holidays.${realIdx}.date`)}
                            className={inputCls(!!errors.holidays?.[realIdx]?.date)}
                          />
                        </div>
                      </div>

                      {/* Surcharge toggle */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={hasSurcharge}
                          onClick={() =>
                            setValue(`holidays.${realIdx}.hasSurcharge`, !hasSurcharge, { shouldDirty: true })
                          }
                          className={cn(
                            "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
                            hasSurcharge ? "bg-[#0D1B2A]" : "bg-gray-200"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                              hasSurcharge ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                        <span className="text-xs text-[#0D1B2A] font-medium">Apply surcharge on this day</span>
                      </div>

                      {hasSurcharge && (
                        <div className="flex items-center gap-2">
                          <select
                            {...register(`holidays.${realIdx}.surchargeType`)}
                            className={cn(inputCls(), "w-44")}
                          >
                            <option value="percentage">% of service price</option>
                            <option value="fixed_aud">Fixed amount (AUD)</option>
                          </select>
                          <div className="relative w-28">
                            <input
                              type="number"
                              min={0}
                              {...register(`holidays.${realIdx}.surchargeValue`, { valueAsNumber: true })}
                              className={cn(inputCls(!!errors.holidays?.[realIdx]?.surchargeValue))}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8E95A5] pointer-events-none">
                              {watch(`holidays.${realIdx}.surchargeType`) === "percentage" ? "%" : "$"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
