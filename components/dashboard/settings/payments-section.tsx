"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { CheckCircle2, AlertCircle, ExternalLink, Info } from "lucide-react";
import type { StoreSettingsSchema } from "@/lib/validations/store-settings";
import {
  PAYMENT_MODE_LABELS,
  PAYMENT_MODE_DESCRIPTIONS,
  DEPOSIT_TYPE_LABELS,
  IN_STORE_METHOD_LABELS,
  type PaymentMode,
  type InStoreMethod,
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

const PAYMENT_MODES: PaymentMode[] = ["in_store", "deposit", "full_upfront"];

const PAYMENT_MODE_ICONS: Record<PaymentMode, string> = {
  in_store:    "🏪",
  deposit:     "🔒",
  full_upfront: "💳",
};

const IN_STORE_METHODS: InStoreMethod[] = ["card", "cash", "bank_transfer"];

const IN_STORE_METHOD_ICONS: Record<InStoreMethod, string> = {
  card:          "💳",
  cash:          "💵",
  bank_transfer: "🏦",
};

export function PaymentsSection({ form }: Props) {
  const { watch, setValue, register, formState: { errors } } = form;

  const stripeConnected = watch("stripeConnected");
  const paymentMode    = watch("paymentMode");
  const depositType    = watch("depositType");
  const depositValue   = watch("depositValue");
  const inStoreMethods = watch("inStoreMethods") ?? [];

  const [stripeLoading, setStripeLoading] = useState(false);

  const needsDeposit = paymentMode === "deposit" || paymentMode === "full_upfront";

  function handleModeSelect(mode: PaymentMode) {
    setValue("paymentMode", mode, { shouldDirty: true });
  }

  function toggleInStoreMethod(method: InStoreMethod) {
    const current = inStoreMethods ?? [];
    const next = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method];
    setValue("inStoreMethods", next, { shouldDirty: true });
  }

  async function handleConnectStripe() {
    setStripeLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setStripeLoading(false);
    setValue("stripeConnected", true, { shouldDirty: true });
  }

  const depositPreview = (() => {
    if (!needsDeposit || depositValue <= 0) return null;
    if (depositType === "percentage") {
      return `A $100 service → $${depositValue.toFixed(0)} deposit to confirm booking`;
    }
    return `A flat $${depositValue.toFixed(2)} AUD deposit for every booking`;
  })();

  return (
    <div id="payments" className="p-5 sm:p-6 space-y-6">

      {/* ── Stripe Connect ── */}
      <div>
        <label className="block text-xs font-bold text-[#0D1B2A] tracking-wide mb-3">
          Online payment gateway
        </label>
        {stripeConnected ? (
          <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200/60 rounded-2xl px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-800">Stripe connected</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Online deposits and full payments are enabled.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setValue("stripeConnected", false, { shouldDirty: true })}
              className="text-xs text-emerald-700 hover:underline shrink-0 font-medium"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-4 bg-gradient-to-br from-[#F8F6F2] to-[#F5F3EE] border border-[#E8E4DA] rounded-2xl px-5 py-5">
            <div className="w-11 h-11 rounded-xl bg-[#635BFF] flex items-center justify-center shrink-0 shadow-lg shadow-[#635BFF]/20">
              <span className="text-white text-base font-black">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#0D1B2A]">Connect Stripe</p>
              <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                Required to collect deposits or full payments at booking.
                Takes 2 minutes — funds go directly to your bank account.
              </p>
            </div>
            <button
              type="button"
              onClick={handleConnectStripe}
              disabled={stripeLoading}
              className={cn(
                "shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200",
                "bg-[#635BFF] text-white hover:bg-[#4F46E5] hover:shadow-lg hover:shadow-[#635BFF]/20",
                stripeLoading && "opacity-60 cursor-not-allowed"
              )}
            >
              {stripeLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5" />
              )}
              Connect →
            </button>
          </div>
        )}
      </div>

      {/* ── Payment mode ── */}
      <div>
        <label className="block text-xs font-bold text-[#0D1B2A] tracking-wide mb-3">
          When do clients pay?
        </label>
        <div className="grid sm:grid-cols-3 gap-3">
          {PAYMENT_MODES.map((mode) => {
            const selected = paymentMode === mode;
            const requiresStripe = mode !== "in_store";
            const disabled = requiresStripe && !stripeConnected;
            return (
              <button
                key={mode}
                type="button"
                disabled={disabled}
                onClick={() => handleModeSelect(mode)}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200",
                  selected
                    ? "border-[#0D1B2A] bg-gradient-to-br from-[#F8F6F2] to-[#F5F3EE] ring-1 ring-[#C4A882]/20 shadow-sm"
                    : "border-[#E8E4DA] bg-white hover:border-[#C4A882]/40 hover:shadow-sm",
                  disabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <span className="text-2xl">{PAYMENT_MODE_ICONS[mode]}</span>
                <p className="text-sm font-bold text-[#0D1B2A]">
                  {PAYMENT_MODE_LABELS[mode]}
                </p>
                <p className="text-[11px] text-[#6B7280] leading-snug">
                  {PAYMENT_MODE_DESCRIPTIONS[mode]}
                </p>
                {requiresStripe && !stripeConnected && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-0.5 border border-amber-100">
                    Requires Stripe
                  </span>
                )}
                {selected && (
                  <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-[#0D1B2A]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Deposit config ── */}
      {needsDeposit && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 border border-blue-100/60 rounded-2xl p-5 space-y-4">
          <label className="block text-xs font-bold text-[#0D1B2A]">
            {paymentMode === "deposit" ? "Deposit amount" : "Upfront payment amount"}
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                min={0}
                step={paymentMode === "deposit" && watch("depositType") === "percentage" ? 1 : 0.01}
                {...register("depositValue", { valueAsNumber: true })}
                className={cn(inputCls(!!errors.depositValue), "pr-16")}
                placeholder="25"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] pointer-events-none font-medium">
                {depositType === "percentage" ? "%" : "AUD"}
              </span>
            </div>
            <select
              {...register("depositType")}
              className={cn(inputCls(), "w-52")}
            >
              {(Object.keys(DEPOSIT_TYPE_LABELS) as (keyof typeof DEPOSIT_TYPE_LABELS)[]).map((k) => (
                <option key={k} value={k}>{DEPOSIT_TYPE_LABELS[k]}</option>
              ))}
            </select>
          </div>
          {depositPreview && (
            <div className="flex items-start gap-2 text-xs text-blue-700 bg-white/60 rounded-xl px-3 py-2.5 border border-blue-100/40">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
              <span>{depositPreview}</span>
            </div>
          )}
          {errors.depositValue && (
            <p className="flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle className="w-3 h-3" />{errors.depositValue.message}
            </p>
          )}
        </div>
      )}

      {/* ── In-store payment methods ── */}
      <div>
        <label className="block text-xs font-bold text-[#0D1B2A] tracking-wide mb-3">
          Accepted in-store payment methods
        </label>
        <div className="flex flex-wrap gap-2">
          {IN_STORE_METHODS.map((method) => {
            const active = inStoreMethods.includes(method);
            return (
              <button
                key={method}
                type="button"
                onClick={() => toggleInStoreMethod(method)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-br from-[#F8F6F2] to-[#F5F3EE] border-[#0D1B2A] text-[#0D1B2A] shadow-sm"
                    : "bg-white border-[#E8E4DA] text-[#6B7280] hover:border-[#C4A882]/40 hover:shadow-sm"
                )}
              >
                <span className="text-base">{IN_STORE_METHOD_ICONS[method]}</span>
                {active && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#0D1B2A]" />}
                {IN_STORE_METHOD_LABELS[method]}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[#6B7280] mt-2.5 pl-1">
          These are shown to clients on the confirmation page and booking receipts.
        </p>
      </div>
    </div>
  );
}
