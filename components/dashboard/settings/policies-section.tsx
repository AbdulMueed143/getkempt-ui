"use client";

import type { UseFormReturn } from "react-hook-form";
import { ShieldCheck, FileText, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { StoreSettingsSchema } from "@/lib/validations/store-settings";
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

const PRIVACY_TEMPLATES = [
  {
    label: "Standard (short)",
    text: `We collect only the personal information necessary to provide our services — including your name, contact details, and appointment history.

We will never share your information with third parties without your consent, except where required by law.

You may request access to or deletion of your data at any time by contacting us directly.`,
  },
];

const CANCELLATION_TEXT_TEMPLATES = [
  {
    label: "Moderate (24-hour notice)",
    text: `We kindly ask for at least 24 hours' notice if you need to cancel or reschedule your appointment.

Cancellations made with less than 24 hours' notice may incur a cancellation fee as outlined above.

No-shows will be charged 100% of the service cost. This policy allows us to offer your slot to other clients.

To cancel or reschedule, please call us or use the online booking portal.`,
  },
  {
    label: "Strict (48-hour notice)",
    text: `Please provide at least 48 hours' notice to cancel or reschedule. Late cancellations and no-shows will be charged according to our fee schedule.

We understand emergencies happen — please contact us as soon as possible if you have an urgent situation.`,
  },
  {
    label: "Flexible (no fee)",
    text: `We know life gets busy! You're welcome to cancel or reschedule at any time.

We'd appreciate as much notice as possible so we can offer your spot to another client. Simply call us or use the booking portal.`,
  },
];

export function PoliciesSection({ form }: Props) {
  const { register, watch, setValue, formState: { errors } } = form;

  const [showCancellationTemplates, setShowCancellationTemplates] = useState(false);
  const [showPrivacyTemplates, setShowPrivacyTemplates] = useState(false);

  const cancellationLen = (watch("cancellationPolicy") ?? "").length;
  const privacyLen      = (watch("privacyPolicy") ?? "").length;

  return (
    <div id="policies" className="p-5 sm:p-6">
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-5 lg:space-y-0">

        {/* ── Cancellation Policy Text ── */}
        <div className="bg-gradient-to-br from-[#FDFCFA] to-[#F8F6F2] rounded-2xl border border-[#E8E4DA] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0EEE6] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-sm">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0D1B2A]">Cancellation Policy</h3>
              <p className="text-[11px] text-[#6B7280]">
                Shown to clients before they confirm a booking
              </p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50/60 border border-amber-100/60 rounded-xl px-3 py-2.5">
              <span className="text-sm mt-0.5">💡</span>
              <span className="leading-relaxed">
                Use the <strong>Cancellation &amp; No-show Fees</strong> section to configure
                actual fee amounts. This text is for clients to read.
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#0D1B2A]">Policy text</label>
                <button
                  type="button"
                  onClick={() => setShowCancellationTemplates((v) => !v)}
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold transition-all duration-200 px-2.5 py-1 rounded-lg",
                    showCancellationTemplates
                      ? "bg-[#0D1B2A] text-white"
                      : "text-[#0D1B2A] hover:bg-[#F5F3EE]"
                  )}
                >
                  Templates
                  {showCancellationTemplates ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {showCancellationTemplates && (
                <div className="flex flex-col gap-1.5 mb-2">
                  {CANCELLATION_TEXT_TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => {
                        setValue("cancellationPolicy", t.text, { shouldDirty: true });
                        setShowCancellationTemplates(false);
                      }}
                      className="text-left px-4 py-2.5 rounded-xl text-xs text-[#0D1B2A] bg-white border border-[#E8E4DA] hover:border-[#C4A882]/40 hover:shadow-sm transition-all duration-200 font-medium"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                {...register("cancellationPolicy")}
                rows={6}
                placeholder="Describe your cancellation and rescheduling policy in plain language…"
                className={cn(inputCls(!!errors.cancellationPolicy), "resize-y")}
              />
              <p className="text-[11px] text-[#6B7280] text-right">{cancellationLen}/3000</p>
              {errors.cancellationPolicy && (
                <p className="flex items-center gap-1 text-xs text-rose-500">
                  <AlertCircle className="w-3 h-3" />{errors.cancellationPolicy.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Privacy Policy ── */}
        <div className="bg-gradient-to-br from-[#FDFCFA] to-[#F8F6F2] rounded-2xl border border-[#E8E4DA] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0EEE6] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0D1B2A]">Privacy Policy</h3>
              <p className="text-[11px] text-[#6B7280]">
                How you handle clients&apos; personal data
              </p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0D1B2A]">Policy Text</label>
              <button
                type="button"
                onClick={() => setShowPrivacyTemplates((v) => !v)}
                className={cn(
                  "flex items-center gap-1 text-xs font-semibold transition-all duration-200 px-2.5 py-1 rounded-lg",
                  showPrivacyTemplates
                    ? "bg-[#0D1B2A] text-white"
                    : "text-[#0D1B2A] hover:bg-[#F5F3EE]"
                )}
              >
                Templates
                {showPrivacyTemplates ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {showPrivacyTemplates && (
              <div className="flex flex-col gap-1.5">
                {PRIVACY_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => {
                      setValue("privacyPolicy", t.text, { shouldDirty: true });
                      setShowPrivacyTemplates(false);
                    }}
                    className="text-left px-4 py-2.5 rounded-xl text-xs text-[#0D1B2A] bg-white border border-[#E8E4DA] hover:border-[#C4A882]/40 hover:shadow-sm transition-all duration-200 font-medium"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <textarea
              {...register("privacyPolicy")}
              rows={8}
              placeholder="Describe how you collect, store, and use client data…"
              className={cn(inputCls(!!errors.privacyPolicy), "resize-y")}
            />
            <p className="text-[11px] text-[#6B7280] text-right">{privacyLen}/5000</p>
            {errors.privacyPolicy && (
              <p className="flex items-center gap-1 text-xs text-rose-500">
                <AlertCircle className="w-3 h-3" />{errors.privacyPolicy.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
