"use client";

import { CreditCard, Lock, ShieldCheck, Info, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/currency";
import { inputClass, stepTitleClass, stepSubClass } from "./shared";
import type {
  BusinessPublicProfile,
  PaymentMethod,
} from "@/types/public-booking";

export interface CardFields {
  name:   string;
  number: string;
  expiry: string;
  cvc:    string;
}

interface Props {
  business:     BusinessPublicProfile;
  amountDueNow: number;
  method:       PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  card:         CardFields;
  onCardChange: (patch: Partial<CardFields>) => void;
  showErrors:   boolean;
}

const METHOD_LABELS: Record<PaymentMethod, string> = {
  apple_pay:  "Apple Pay",
  google_pay: "Google Pay",
  card:       "Credit / debit card",
};

export function StepPayment({
  business,
  amountDueNow,
  method,
  onMethodChange,
  card,
  onCardChange,
  showErrors,
}: Props) {
  const currency = business.payments.currency;
  const methods = business.payments.methods;

  return (
    <div>
      <h2 className={stepTitleClass}>Payment</h2>
      <p className={stepSubClass}>
        {business.payments.captureMode === "deposit"
          ? "A deposit secures your booking. The balance is paid in-store."
          : "Complete your payment to confirm your booking."}
      </p>

      {/* Amount banner */}
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-royal-indigo px-5 py-4 text-white">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
            Due now
          </p>
          <p className="text-2xl font-bold">{formatMoney(amountDueNow, currency)}</p>
        </div>
        <ShieldCheck className="h-8 w-8 text-warm-sand" />
      </div>

      {/* Method selector */}
      <div className="mt-6 space-y-2.5">
        {methods.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onMethodChange(m)}
            className={cn(
              "w-full flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
              method === m
                ? "border-royal-indigo bg-indigo-subtle/60"
                : "border-border-soft bg-white hover:border-ink-300"
            )}
          >
            <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-ink-900 text-white text-xs font-bold shrink-0">
              {m === "apple_pay" ? "Pay" : m === "google_pay" ? "GPay" : <CreditCard className="h-4 w-4" />}
            </span>
            <span className="flex-1 font-semibold text-ink-900">{METHOD_LABELS[m]}</span>
            <span
              className={cn(
                "h-4 w-4 rounded-full border-2 transition-all shrink-0",
                method === m ? "border-royal-indigo bg-royal-indigo ring-2 ring-indigo-subtle" : "border-border-soft"
              )}
            />
          </button>
        ))}
      </div>

      {/* Card fields (only for card) */}
      {method === "card" && (
        <div className="mt-5 space-y-4 rounded-2xl border border-border-soft bg-white p-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-700">Name on card</label>
            <input
              value={card.name}
              onChange={(e) => onCardChange({ name: e.target.value })}
              placeholder="Sarah Johnson"
              className={inputClass(showErrors && !card.name.trim())}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-700">Card number</label>
            <div className="relative">
              <CreditCard className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
              <input
                inputMode="numeric"
                value={card.number}
                onChange={(e) => onCardChange({ number: formatCardNumber(e.target.value) })}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className={cn(inputClass(showErrors && card.number.replace(/\s/g, "").length < 12), "pl-9")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-700">Expiry</label>
              <input
                inputMode="numeric"
                value={card.expiry}
                onChange={(e) => onCardChange({ expiry: formatExpiry(e.target.value) })}
                placeholder="MM/YY"
                maxLength={5}
                className={inputClass(showErrors && card.expiry.length < 5)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-700">CVC</label>
              <input
                inputMode="numeric"
                value={card.cvc}
                onChange={(e) => onCardChange({ cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                placeholder="123"
                className={inputClass(showErrors && card.cvc.length < 3)}
              />
            </div>
          </div>
        </div>
      )}

      {method !== "card" && (
        <p className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-stone-beige/40 px-4 py-3 text-sm text-ink-500">
          <Lock className="h-4 w-4" />
          You&apos;ll confirm securely with {METHOD_LABELS[method]} on the next tap.
        </p>
      )}

      {/* Cancellation policy — the customer agrees to this by paying */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border-soft bg-stone-beige/30 px-3.5 py-3">
        <CalendarX className="h-4 w-4 shrink-0 mt-0.5 text-ink-400" />
        <div>
          <p className="text-xs font-semibold text-ink-700">Cancellation policy</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
            {business.cancellation.summary}
          </p>
        </div>
      </div>

      {/* Stub notice — remove once Stripe is wired to the backend */}
      <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        Test mode — no real charge is made. Live payments will use Stripe once the
        backend is connected.
      </p>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
        <Lock className="h-3 w-3" />
        Payments are encrypted and processed securely.
      </p>
    </div>
  );
}

function formatCardNumber(v: string): string {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}
