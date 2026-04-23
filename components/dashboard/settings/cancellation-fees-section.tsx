"use client";

import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  Plus, Trash2, Pencil, Check, X,
  AlertCircle, Zap,
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
    "w-full text-sm text-[#0D1B2A] border rounded-2xl px-4 py-3 bg-white/80 backdrop-blur-sm transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[#C4A882]/50 focus:border-[#C4A882] focus:bg-white focus:shadow-sm",
    "placeholder:text-[#6B7280]",
    err ? "border-rose-300 bg-rose-50/30" : "border-[#E8E4DA] hover:border-[#C4A882]/40 hover:shadow-sm"
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
    <div id="cancellation" className="p-5 sm:p-6 space-y-6">

      {/* ── Quick templates ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-[#0D1B2A] tracking-wide">Quick setup</label>
          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200",
              showTemplates
                ? "bg-[#0D1B2A] text-white"
                : "bg-gradient-to-br from-[#F8F6F2] to-[#F5F3EE] text-[#0D1B2A] hover:shadow-sm border border-[#E8E4DA]"
            )}
          >
            <Zap className="w-3.5 h-3.5" />
            Templates
          </button>
        </div>

        {showTemplates && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
            {CANCELLATION_TEMPLATES.map((t, i) => (
              <button
                key={t.label}
                type="button"
                onClick={() => applyTemplate(i)}
                className="text-left px-4 py-3.5 rounded-2xl bg-gradient-to-br from-[#F8F6F2] to-[#F5F3EE] border border-[#E8E4DA] hover:border-[#0D1B2A] hover:shadow-sm transition-all duration-200"
              >
                <p className="text-xs font-bold text-[#0D1B2A]">{t.label}</p>
                <p className="text-[11px] text-[#6B7280] mt-1 leading-snug">{t.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0 space-y-6">

        {/* ── No-show fee ── */}
        <div>
          <label className="block text-xs font-bold text-[#0D1B2A] tracking-wide mb-3">
            No-show fee
          </label>
          <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-100/60 rounded-2xl p-5 space-y-4">
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              Charged when a client books but doesn&apos;t arrive and gives no notice.
            </p>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1.5 flex-1 min-w-[120px]">
                <label className="text-[11px] font-semibold text-[#6B7A99]">Fee type</label>
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
                <div className="space-y-1.5 w-36">
                  <label className="text-[11px] font-semibold text-[#6B7A99]">
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
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] pointer-events-none font-medium">
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
                "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-200",
                autoCharge
                  ? "bg-white border-[#0D1B2A]/20 shadow-sm"
                  : "bg-white/60 border-[#E8E4DA] hover:border-[#C4A882]/40",
                !stripeConnected && "opacity-40 cursor-not-allowed"
              )}
              disabled={!stripeConnected}
            >
              <div>
                <p className="text-xs font-bold text-[#0D1B2A]">
                  Auto-charge card on file
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5">
                  {stripeConnected
                    ? "Automatically charge the saved card when a no-show is recorded"
                    : "Requires Stripe to be connected"}
                </p>
              </div>
              <div className={cn(
                "relative w-11 h-6 rounded-full shrink-0 transition-all duration-200",
                autoCharge && stripeConnected ? "bg-[#0D1B2A]" : "bg-gray-200"
              )}>
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                  autoCharge && stripeConnected ? "left-6" : "left-1"
                )} />
              </div>
            </button>
          </div>
        </div>

        {/* ── Cancellation fee rules ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-xs font-bold text-[#0D1B2A] tracking-wide">
                Cancellation fee rules
              </label>
              <p className="text-[11px] text-[#6B7280] mt-0.5">
                Tightest window first. Outside all rules = free.
              </p>
            </div>
          </div>

          {/* Rules list */}
          {fields.length === 0 && !addingNew ? (
            <div className="text-center py-8 bg-gradient-to-br from-[#F8F6F2] to-[#F5F3EE] rounded-2xl border border-dashed border-[#E8E4DA]">
              <p className="text-sm text-[#6B7280] font-medium">No rules — all cancellations are free</p>
              <p className="text-[11px] text-[#C4C9D4] mt-1">Use a template or add a custom rule below</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedIndexMap.map(({ idx, ...rule }) => (
                <div
                  key={rule.id}
                  className={cn(
                    "rounded-2xl border transition-all duration-200 overflow-hidden",
                    editingId === rule.id
                      ? "border-[#0D1B2A]/30 bg-gradient-to-br from-[#F8F6F2] to-[#F5F3EE] shadow-sm"
                      : "border-[#E8E4DA] bg-gradient-to-br from-[#FDFCFA] to-[#F8F6F2]"
                  )}
                >
                  {editingId === rule.id ? (
                    <div className="p-4 space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-[#6B7A99]">Rule label</label>
                          <input
                            type="text"
                            value={draft.label}
                            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                            placeholder="e.g. Same day"
                            className={inputCls()}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-[#6B7A99]">If cancelled within</label>
                          <div className="relative">
                            <input
                              type="number"
                              min={1}
                              value={draft.withinHours}
                              onChange={(e) => setDraft((d) => ({ ...d, withinHours: Number(e.target.value) }))}
                              className={cn(inputCls(), "pr-14")}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] pointer-events-none">hours</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-[#6B7A99]">Fee type</label>
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
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-[#6B7A99]">
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
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] pointer-events-none">
                              {draft.feeType === "percentage" ? "%" : "$"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => saveEdit(idx)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0D1B2A] text-white hover:bg-[#C4A882] hover:text-[#0D1B2A] transition-all duration-200"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8E4DA] text-[#6B7A99] hover:border-[#C4A882]/40 transition-all duration-200"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#0D1B2A]">
                            Within {hoursLabel(rule.withinHours)}
                          </span>
                          {rule.label && rule.label !== `Within ${hoursLabel(rule.withinHours)}` && (
                            <span className="text-[10px] text-[#6B7280]">({rule.label})</span>
                          )}
                          <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                            {feeLabel(rule.feeType, rule.feeValue)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit({ idx, ...rule })}
                          className="p-2 rounded-xl text-[#6B7280] hover:text-[#0D1B2A] hover:bg-white transition-all duration-200"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="p-2 rounded-xl text-[#6B7280] hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
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
            <div className="mt-2 rounded-2xl border border-[#0D1B2A]/20 bg-gradient-to-br from-[#F8F6F2] to-[#F5F3EE] p-4 space-y-3 shadow-sm">
              <p className="text-xs font-bold text-[#0D1B2A]">New rule</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#6B7A99]">Rule label</label>
                  <input
                    type="text"
                    value={draft.label}
                    onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                    placeholder="e.g. Within 24 hours"
                    className={inputCls()}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#6B7A99]">If cancelled within</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      value={draft.withinHours}
                      onChange={(e) => setDraft((d) => ({ ...d, withinHours: Number(e.target.value) }))}
                      className={cn(inputCls(), "pr-14")}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] pointer-events-none">hours</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#6B7A99]">Fee type</label>
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
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#6B7A99]">
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
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] pointer-events-none">
                      {draft.feeType === "percentage" ? "%" : "$"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={saveNew}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0D1B2A] text-white hover:bg-[#C4A882] hover:text-[#0D1B2A] transition-all duration-200"
                >
                  <Check className="w-3.5 h-3.5" /> Add rule
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8E4DA] text-[#6B7A99] hover:border-[#C4A882]/40 transition-all duration-200"
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
              className="mt-3 flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-[#E8E4DA] text-xs font-semibold text-[#6B7280] hover:border-[#C4A882] hover:text-[#0D1B2A] hover:bg-gradient-to-br hover:from-[#F8F6F2] hover:to-[#F5F3EE] transition-all duration-200 w-full justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
              Add custom rule
            </button>
          )}
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2.5 bg-gradient-to-r from-blue-50 to-indigo-50/30 border border-blue-100/60 rounded-2xl px-4 py-3.5 text-xs text-blue-700">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
        <span className="leading-relaxed">
          Rules are evaluated from the tightest window outward — the first rule whose window
          the cancellation falls within will apply. Cancellations made before all windows are
          always free. Auto-charge requires Stripe to be connected.
        </span>
      </div>
    </div>
  );
}
