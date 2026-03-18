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
    "w-full text-sm text-gray-900 border rounded-xl px-3 py-2.5 bg-white transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:border-transparent placeholder:text-gray-400",
    err ? "border-rose-300 bg-rose-50/30" : "border-gray-200 hover:border-gray-300"
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

  /* New holiday draft state */
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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EEF1F8] flex items-center justify-center shrink-0">
          <CalendarOff className="w-4 h-4 text-[#1B3163]" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-900">Holidays &amp; Closures</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Block off days your shop is closed; optionally apply a public holiday surcharge
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddVicHolidays}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1B3163] bg-[#EEF1F8] hover:bg-[#D5DFF0] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add VIC Public Holidays</span>
            <span className="sm:hidden">VIC Holidays</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1B3163] hover:bg-[#152748] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Add holiday inline form */}
      {showAdd && (
        <div className="px-5 py-4 border-b border-[#EEF1F8] bg-[#F8F9FD] space-y-3">
          <p className="text-xs font-semibold text-gray-700">New Holiday / Closure</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Name <span className="text-rose-500">*</span></label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g. ANZAC Day, Shop Closed"
                className={inputCls(!draft.name && showAdd)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Date <span className="text-rose-500">*</span></label>
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
                "relative w-10 h-6 rounded-full transition-colors shrink-0",
                draft.hasSurcharge ? "bg-[#1B3163]" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                  draft.hasSurcharge ? "translate-x-5" : "translate-x-1"
                )}
              />
            </button>
            <span className="text-xs text-gray-700 font-medium">Apply surcharge on this day</span>
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">$</span>
                )}
                <input
                  type="number"
                  min={0}
                  max={draft.surchargeType === "percentage" ? 100 : 9999}
                  value={draft.surchargeValue}
                  onChange={(e) => setDraft((d) => ({ ...d, surchargeValue: Number(e.target.value) }))}
                  className={cn(inputCls(), draft.surchargeType === "fixed_aud" ? "pl-6" : "")}
                />
                {draft.surchargeType === "percentage" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">%</span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddHoliday}
              disabled={!draft.name || !draft.date}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#1B3163] hover:bg-[#152748] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add Holiday
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

      {/* Holiday list */}
      {fields.length === 0 ? (
        <div className="py-10 text-center">
          <CalendarOff className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No holidays added yet</p>
          <p className="text-xs text-gray-300 mt-1">Add custom dates or import VIC public holidays above</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {fields
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((field, idx) => {
              const realIdx = fields.findIndex((f) => f.id === field.id);
              const isExpanded = expandedId === field.id;
              const hasSurcharge = watch(`holidays.${realIdx}.hasSurcharge`);

              return (
                <li key={field.id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Date badge */}
                    <div className="w-12 shrink-0 text-center">
                      <div className="text-xs font-bold text-[#1B3163]">
                        {field.date ? new Date(field.date + "T12:00:00").toLocaleDateString("en-AU", { month: "short" }).toUpperCase() : "—"}
                      </div>
                      <div className="text-lg font-bold text-gray-900 leading-none">
                        {field.date ? new Date(field.date + "T12:00:00").getDate() : "—"}
                      </div>
                    </div>

                    {/* Name & date */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{field.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(field.date)}</p>
                    </div>

                    {/* Surcharge badge */}
                    {hasSurcharge ? (
                      <span className="hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                        +{watch(`holidays.${realIdx}.surchargeValue`)}
                        {watch(`holidays.${realIdx}.surchargeType`) === "percentage" ? "%" : " AUD"}
                      </span>
                    ) : (
                      <span className="hidden sm:inline-flex text-xs text-gray-400 shrink-0">No surcharge</span>
                    )}

                    {/* Expand / delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : field.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(realIdx)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline edit panel */}
                  {isExpanded && (
                    <div className="mt-3 ml-15 pl-2 border-l-2 border-[#EEF1F8] space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Name</label>
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
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-600">Date</label>
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
                            "relative w-10 h-6 rounded-full transition-colors shrink-0",
                            hasSurcharge ? "bg-[#1B3163]" : "bg-gray-200"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
                              hasSurcharge ? "translate-x-5" : "translate-x-1"
                            )}
                          />
                        </button>
                        <span className="text-xs text-gray-700">Apply surcharge on this day</span>
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
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
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
