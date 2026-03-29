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
    "w-full text-sm text-gray-900 border rounded-xl px-3 py-2.5 bg-white transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:border-transparent placeholder:text-gray-400",
    err ? "border-rose-300 bg-rose-50/30" : "border-gray-200 hover:border-gray-300"
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
    <div className="space-y-4">
      {/* ── Cancellation Policy Text ── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Cancellation Policy</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Written policy shown to clients before they confirm a booking
            </p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
            Use the <strong>Cancellation &amp; No-show Fees</strong> section above to configure
            the actual fee amounts. This text is for clients to read — summarise your policy in plain language.
          </p>

          {/* Policy text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">Policy text</label>
              <button
                type="button"
                onClick={() => setShowCancellationTemplates((v) => !v)}
                className="flex items-center gap-1 text-xs text-[#1B3163] hover:underline"
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
                    className="text-left px-3 py-2 rounded-lg text-xs text-[#1B3163] bg-[#EEF1F8] hover:bg-[#D5DFF0] transition-colors font-medium"
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
            <p className="text-xs text-gray-400 text-right">{cancellationLen}/3000</p>
            {errors.cancellationPolicy && (
              <p className="flex items-center gap-1 text-xs text-rose-500">
                <AlertCircle className="w-3 h-3" />{errors.cancellationPolicy.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Privacy Policy ── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Privacy Policy</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              How you handle clients' personal data — shown at sign-up and booking
            </p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-700">Policy Text</label>
            <button
              type="button"
              onClick={() => setShowPrivacyTemplates((v) => !v)}
              className="flex items-center gap-1 text-xs text-[#1B3163] hover:underline"
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
                  className="text-left px-3 py-2 rounded-lg text-xs text-[#1B3163] bg-[#EEF1F8] hover:bg-[#D5DFF0] transition-colors font-medium"
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
          <p className="text-xs text-gray-400 text-right">{privacyLen}/5000</p>
          {errors.privacyPolicy && (
            <p className="flex items-center gap-1 text-xs text-rose-500">
              <AlertCircle className="w-3 h-3" />{errors.privacyPolicy.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
