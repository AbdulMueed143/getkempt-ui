"use client";

import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  TriangleAlert, Plus, Trash2, Pencil, Check, X,
  AlertCircle, ChevronDown, ChevronUp, Zap,
} from "lucide-react";
import type { StoreSettingsSchema } from "@/lib/validations/store-settings";
import {
  FEE_TYPE_LABELS, CANCELLATION_TEMPLATES,
  type FeeType, type CancellationFeeRule,
} from "@/types/store-settings";
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

const FEE_TYPES: FeeType[] = ["percentage", "fixed_aud", "none"];

const NO_SHOW_FEE_TYPES: FeeType[] = ["percentage", "fixed_aud", "none"];

function feeLabel(feeType: string, feeValue: number): string {
  if (feeType === "none" || feeValue === 0) return "Free";
  if (feeType === "percentage") return `${feeValue}% of service`;
  return `$${feeValue.toFixed(2)} AUD`;
}

function hoursLabel(h: number): string {
  if (h < 24) return `${h} hour${h !== 1 ? "s" : ""}`;
  const d = h / 24;
  return `${d} day${d !== 1 ? "s" : ""}`;
}

type EditDraft = {
  id: string;
  label: string;
  withinHours: number;
  feeType: "percentage" | "fixed_aud";
  feeValue: number;
};

function emptyDraft(): EditDraft {
  return { id: "", label: "", withinHours: 24, feeType: "percentage", feeValue: 50 };
}

export function CancellationFeesSection({ form }: Props) {
  const { watch, setValue, register, formState: { errors } } = form;

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "cancellationFeeRules",
  });

  const noShowFeeType  = watch("noShowFeeType");
  const noShowFeeValue = watch("noShowFeeValue");
  const autoCharge     = watch("autoCharge");
  const stripeConnected = watch("stripeConnected");

  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [addingNew,   setAddingNew]   = useState(false);
  const [draft,       setDraft]       = useState<EditDraft>(emptyDraft());
  const [showTemplates, setShowTemplates] = useState(false);

  // Sort rules ascending by withinHours for display
  const sortedIndexMap = [...fields]
    .map((f, i) => ({ ...f, idx: i }))
    .sort((a, b) => a.withinHours - b.withinHours);

  function applyTemplate(tIdx: number) {
    const t = CANCELLATION_TEMPLATES[tIdx];
    setValue(
      "cancellationFeeRules",
      t.rules.map((r, i) => ({ ...r, id: `cfr-t${tIdx}-${i}` })),
      { shouldDirty: true }
    );
    setValue("noShowFeeType",  t.noShowFeeType,  { shouldDirty: true });
    setValue("noShowFeeValue", t.noShowFeeValue, { shouldDirty: true });
    setValue("autoCharge",     t.autoCharge,     { shouldDirty: true });
    setShowTemplates(false);
  }

  function startEdit(rule: CancellationFeeRule & { idx: number }) {
    setDraft({
      id:          rule.id,
      label:       rule.label,
      withinHours: rule.withinHours,
      feeType:     rule.feeType,
      feeValue:    rule.feeValue,
    });
    setEditingId(rule.id);
    setAddingNew(false);
  }

  function saveEdit(idx: number) {
    update(idx, {
      id:          draft.id,
      label:       draft.label || `Within ${hoursLabel(draft.withinHours)}`,
      withinHours: draft.withinHours,
      feeType:     draft.feeType,
      feeValue:    draft.feeValue,
    });
    setEditingId(null);
  }

  function saveNew() {
    append({
      id:          `cfr-${Date.now()}`,
      label:       draft.label || `Within ${hoursLabel(draft.withinHours)}`,
      withinHours: draft.withinHours,
      feeType:     draft.feeType,
      feeValue:    draft.feeValue,
    });
    setAddingNew(false);
    setDraft(emptyDraft());
  }

  function cancelEdit() {
    setEditingId(null);
    setAddingNew(false);
    setDraft(emptyDraft());
  }

  return (
    <div id="cancellation" className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <TriangleAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Cancellation &amp; No-show Fees</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Set what you charge when clients cancel late or don't show up
            </p>
          </div>
        </div>

        {/* Quick templates button */}
        <button
          type="button"
          onClick={() => setShowTemplates((v) => !v)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EEF1F8] text-[#1B3163] hover:bg-[#D5DFF0] transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          Templates
          {showTemplates ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Quick templates panel */}
      {showTemplates && (
        <div className="px-5 py-3 bg-[#F8F9FC] border-b border-gray-100">
          <p className="text-xs text-gray-500 mb-2 font-medium">
            Select a preset — it will replace your current rules:
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {CANCELLATION_TEMPLATES.map((t, i) => (
              <button
                key={t.label}
                type="button"
                onClick={() => applyTemplate(i)}
                className="text-left px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#1B3163] hover:bg-[#EEF1F8] transition-all"
              >
                <p className="text-xs font-bold text-gray-800">{t.label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-5 space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">

        {/* ── No-show fee ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-3">
            No-show fee
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs text-gray-500">
              Charged when a client books but doesn't arrive and gives no notice.
            </p>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1 flex-1 min-w-[120px]">
                <label className="text-[11px] font-medium text-gray-600">Fee type</label>
                <select
                  value={noShowFeeType}
                  onChange={(e) => setValue("noShowFeeType", e.target.value as FeeType, { shouldDirty: true })}
                  className={inputCls()}
                >
                  {NO_SHOW_FEE_TYPES.map((t) => (
                    <option key={t} value={t}>{FEE_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {noShowFeeType !== "none" && (
                <div className="space-y-1 w-36">
                  <label className="text-[11px] font-medium text-gray-600">
                    {noShowFeeType === "percentage" ? "Percentage" : "Amount (AUD)"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={noShowFeeType === "percentage" ? 100 : undefined}
                      step={noShowFeeType === "percentage" ? 1 : 0.01}
                      value={noShowFeeValue}
                      onChange={(e) => setValue("noShowFeeValue", Number(e.target.value), { shouldDirty: true })}
                      className={cn(inputCls(!!errors.noShowFeeValue), "pr-12")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                      {noShowFeeType === "percentage" ? "%" : "$"}
                    </span>
                  </div>
                  {errors.noShowFeeValue && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <AlertCircle className="w-3 h-3" />{errors.noShowFeeValue.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Auto-charge toggle */}
            <button
              type="button"
              onClick={() => setValue("autoCharge", !autoCharge, { shouldDirty: true })}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-left transition-all",
                autoCharge
                  ? "bg-[#EEF1F8] border-[#1B3163]/40"
                  : "bg-white border-gray-200 hover:border-gray-300",
                !stripeConnected && "opacity-50 cursor-not-allowed"
              )}
              disabled={!stripeConnected}
            >
              <div>
                <p className={cn("text-xs font-semibold", autoCharge ? "text-[#1B3163]" : "text-gray-700")}>
                  Auto-charge card on file
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {stripeConnected
                    ? "Automatically charge the saved card when a no-show is recorded"
                    : "Requires Stripe to be connected"}
                </p>
              </div>
              <div className={cn(
                "relative w-9 h-5 rounded-full shrink-0 transition-all",
                autoCharge && stripeConnected ? "bg-[#1B3163]" : "bg-gray-300"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                  autoCharge && stripeConnected ? "left-4" : "left-0.5"
                )} />
              </div>
            </button>
          </div>
        </div>

        {/* ── Cancellation fee rules ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700">
                Cancellation fee rules
              </label>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Rules apply tightest window first. Cancellations outside all rules are free.
              </p>
            </div>
          </div>

          {/* Rules list */}
          {fields.length === 0 && !addingNew ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-400">No rules — all cancellations are free</p>
              <p className="text-xs text-gray-300 mt-1">Use a template above or add a custom rule below</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedIndexMap.map(({ idx, ...rule }) => (
                <div
                  key={rule.id}
                  className={cn(
                    "rounded-xl border transition-all overflow-hidden",
                    editingId === rule.id
                      ? "border-[#1B3163]/40 bg-[#EEF1F8]/40"
                      : "border-gray-100 bg-gray-50"
                  )}
                >
                  {editingId === rule.id ? (
                    /* ── Inline edit form ── */
                    <div className="p-4 space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-gray-600">Rule label</label>
                          <input
                            type="text"
                            value={draft.label}
                            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                            placeholder="e.g. Same day"
                            className={inputCls()}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-gray-600">If cancelled within</label>
                          <div className="relative">
                            <input
                              type="number"
                              min={1}
                              value={draft.withinHours}
                              onChange={(e) => setDraft((d) => ({ ...d, withinHours: Number(e.target.value) }))}
                              className={cn(inputCls(), "pr-14")}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">hours</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-gray-600">Fee type</label>
                          <select
                            value={draft.feeType}
                            onChange={(e) => setDraft((d) => ({ ...d, feeType: e.target.value as "percentage" | "fixed_aud" }))}
                            className={inputCls()}
                          >
                            {(["percentage", "fixed_aud"] as const).map((t) => (
                              <option key={t} value={t}>{FEE_TYPE_LABELS[t]}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-gray-600">
                            {draft.feeType === "percentage" ? "Percentage" : "Amount (AUD)"}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              max={draft.feeType === "percentage" ? 100 : undefined}
                              step={draft.feeType === "percentage" ? 1 : 0.01}
                              value={draft.feeValue}
                              onChange={(e) => setDraft((d) => ({ ...d, feeValue: Number(e.target.value) }))}
                              className={cn(inputCls(), "pr-10")}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                              {draft.feeType === "percentage" ? "%" : "$"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => saveEdit(idx)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1B3163] text-white hover:bg-[#152748] transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Read-only row ── */
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-gray-800">
                            Within {hoursLabel(rule.withinHours)}
                          </span>
                          {rule.label && rule.label !== `Within ${hoursLabel(rule.withinHours)}` && (
                            <span className="text-[10px] text-gray-400">({rule.label})</span>
                          )}
                          <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                            {feeLabel(rule.feeType, rule.feeValue)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit({ idx, ...rule })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#1B3163] hover:bg-[#EEF1F8] transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add new rule inline form */}
          {addingNew && (
            <div className="mt-2 rounded-xl border border-[#1B3163]/40 bg-[#EEF1F8]/40 p-4 space-y-3">
              <p className="text-xs font-semibold text-[#1B3163]">New rule</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-600">Rule label</label>
                  <input
                    type="text"
                    value={draft.label}
                    onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                    placeholder="e.g. Within 24 hours"
                    className={inputCls()}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-600">If cancelled within</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={draft.withinHours}
                      onChange={(e) => setDraft((d) => ({ ...d, withinHours: Number(e.target.value) }))}
                      className={cn(inputCls(), "pr-14")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">hours</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-600">Fee type</label>
                  <select
                    value={draft.feeType}
                    onChange={(e) => setDraft((d) => ({ ...d, feeType: e.target.value as "percentage" | "fixed_aud" }))}
                    className={inputCls()}
                  >
                    {(["percentage", "fixed_aud"] as const).map((t) => (
                      <option key={t} value={t}>{FEE_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-600">
                    {draft.feeType === "percentage" ? "Percentage" : "Amount (AUD)"}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={draft.feeType === "percentage" ? 100 : undefined}
                      step={draft.feeType === "percentage" ? 1 : 0.01}
                      value={draft.feeValue}
                      onChange={(e) => setDraft((d) => ({ ...d, feeValue: Number(e.target.value) }))}
                      className={cn(inputCls(), "pr-10")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                      {draft.feeType === "percentage" ? "%" : "$"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={saveNew}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1B3163] text-white hover:bg-[#152748] transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Add rule
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* Add rule button */}
          {!addingNew && editingId === null && (
            <button
              type="button"
              onClick={() => { setDraft(emptyDraft()); setAddingNew(true); setEditingId(null); }}
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:border-[#1B3163] hover:text-[#1B3163] hover:bg-[#EEF1F8] transition-all w-full justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
              Add custom rule
            </button>
          )}
        </div>

        {/* Info note — spans both columns on desktop */}
        <div className="lg:col-span-2 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
          <span>
            Rules are evaluated from the tightest window outward — the first rule whose window
            the cancellation falls within will apply. Cancellations made before all windows are
            always free. Auto-charge requires Stripe to be connected.
          </span>
        </div>
      </div>
    </div>
  );
}
