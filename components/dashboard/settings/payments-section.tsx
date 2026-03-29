"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Info } from "lucide-react";
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
    "w-full text-sm text-gray-900 border rounded-xl px-3 py-2.5 bg-white transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:border-transparent placeholder:text-gray-400",
    err ? "border-rose-300 bg-rose-50/30" : "border-gray-200 hover:border-gray-300"
  );

const PAYMENT_MODES: PaymentMode[] = ["in_store", "deposit", "full_upfront"];

const PAYMENT_MODE_ICONS: Record<PaymentMode, string> = {
  in_store:    "🏪",
  deposit:     "🔒",
  full_upfront: "💳",
};

const IN_STORE_METHODS: InStoreMethod[] = ["card", "cash", "bank_transfer"];

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
    // TODO: redirect to Stripe Connect OAuth flow
    await new Promise((r) => setTimeout(r, 1200));
    setStripeLoading(false);
    // Mock: toggle connected state
    setValue("stripeConnected", true, { shouldDirty: true });
  }

  // Live deposit preview
  const depositPreview = (() => {
    if (!needsDeposit || depositValue <= 0) return null;
    if (depositType === "percentage") {
      return `A $100 service → $${depositValue.toFixed(0)} deposit to confirm booking`;
    }
    return `A flat $${depositValue.toFixed(2)} AUD deposit for every booking`;
  })();

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#EEF1F8] flex items-center justify-center shrink-0">
          <CreditCard className="w-4 h-4 text-[#1B3163]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Payments &amp; Deposits</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Control when and how clients pay for their bookings
          </p>
        </div>
      </div>

      <div className="p-5 space-y-6">

        {/* ── Stripe Connect ── */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Online payment gateway
          </label>
          {stripeConnected ? (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-800">Stripe connected</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Online deposits and full payments are enabled.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValue("stripeConnected", false, { shouldDirty: true })}
                className="text-xs text-emerald-700 hover:underline shrink-0"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-4">
              <div className="w-9 h-9 rounded-lg bg-[#635BFF] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-sm font-black">S</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">Connect Stripe</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  Required to collect deposits or full payments at booking.
                  Takes 2 minutes — funds go directly to your bank account.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConnectStripe}
                disabled={stripeLoading}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all",
                  "bg-[#635BFF] text-white hover:bg-[#4F46E5]",
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
          <label className="block text-xs font-semibold text-gray-700 mb-2">
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
                    "relative flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all",
                    selected
                      ? "border-[#1B3163] bg-[#EEF1F8] ring-1 ring-[#1B3163]/20"
                      : "border-gray-200 bg-white hover:border-gray-300",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="text-xl">{PAYMENT_MODE_ICONS[mode]}</span>
                  <p className={cn("text-sm font-bold", selected ? "text-[#1B3163]" : "text-gray-800")}>
                    {PAYMENT_MODE_LABELS[mode]}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    {PAYMENT_MODE_DESCRIPTIONS[mode]}
                  </p>
                  {requiresStripe && !stripeConnected && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full mt-0.5">
                      Requires Stripe
                    </span>
                  )}
                  {selected && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-[#1B3163]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Deposit config (shown for deposit or full upfront) ── */}
        {needsDeposit && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-semibold text-gray-700">
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
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
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
              <div className="flex items-start gap-2 text-xs text-blue-700">
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
          <label className="block text-xs font-semibold text-gray-700 mb-2">
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
                    "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                    active
                      ? "bg-[#EEF1F8] border-[#1B3163] text-[#1B3163]"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  {active && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                  {IN_STORE_METHOD_LABELS[method]}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            These are shown to clients on the confirmation page and booking receipts.
          </p>
        </div>

      </div>
    </div>
  );
}
