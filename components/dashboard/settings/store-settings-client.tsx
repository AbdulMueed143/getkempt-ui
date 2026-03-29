"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, AlertCircle } from "lucide-react";
import { storeSettingsSchema, type StoreSettingsSchema } from "@/lib/validations/store-settings";
import { MOCK_STORE_SETTINGS } from "@/lib/mock/store-settings";
import { SchedulingSection }       from "./scheduling-section";
import { PaymentsSection }         from "./payments-section";
import { HolidaysSection }         from "./holidays-section";
import { SurchargeSection }        from "./surcharge-section";
import { CancellationFeesSection } from "./cancellation-fees-section";
import { PoliciesSection }         from "./policies-section";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";

export function StoreSettingsClient() {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<StoreSettingsSchema>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      /* Scheduling */
      bookingWindowValue: MOCK_STORE_SETTINGS.bookingWindowValue,
      bookingWindowUnit:  MOCK_STORE_SETTINGS.bookingWindowUnit,
      slotInterval:       MOCK_STORE_SETTINGS.slotInterval,

      /* Holidays & surcharges */
      holidays:       MOCK_STORE_SETTINGS.holidays,
      surchargeRules: MOCK_STORE_SETTINGS.surchargeRules,

      /* Payments */
      paymentMode:     MOCK_STORE_SETTINGS.paymentMode,
      depositType:     MOCK_STORE_SETTINGS.depositType,
      depositValue:    MOCK_STORE_SETTINGS.depositValue,
      inStoreMethods:  MOCK_STORE_SETTINGS.inStoreMethods,
      stripeConnected: MOCK_STORE_SETTINGS.stripeConnected,

      /* Cancellation & no-show fees */
      noShowFeeType:        MOCK_STORE_SETTINGS.noShowFeeType,
      noShowFeeValue:       MOCK_STORE_SETTINGS.noShowFeeValue,
      autoCharge:           MOCK_STORE_SETTINGS.autoCharge,
      cancellationFeeRules: MOCK_STORE_SETTINGS.cancellationFeeRules,

      /* Text policies */
      cancellationPolicy: MOCK_STORE_SETTINGS.cancellationPolicy,
      privacyPolicy:      MOCK_STORE_SETTINGS.privacyPolicy,
    },
  });

  const { handleSubmit, formState: { isDirty } } = form;

  async function onSubmit(data: StoreSettingsSchema) {
    setIsSaving(true);
    // TODO: replace with actual API call
    await new Promise((r) => setTimeout(r, 700));
    console.log("Store settings saved:", data);
    setIsSaving(false);
    toast.success({
      title: "Settings saved",
      message: "Your store settings have been updated successfully.",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <SchedulingSection       form={form} />
      <PaymentsSection         form={form} />
      <CancellationFeesSection form={form} />
      <HolidaysSection         form={form} />
      <SurchargeSection        form={form} />
      <PoliciesSection         form={form} />

      {/* ── Sticky save bar ── */}
      <div
        className={cn(
          "sticky bottom-0 z-10 bg-white/95 backdrop-blur-sm border-t border-gray-100",
          "flex items-center justify-between gap-4 px-5 py-4 -mx-1 rounded-b-xl shadow-lg shadow-gray-100/60",
          "transition-all duration-200",
          isDirty ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <p className="text-sm text-amber-700 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          You have unsaved changes
        </p>
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            "bg-[#1B3163] text-white hover:bg-[#152748] focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:ring-offset-2",
            isSaving && "opacity-60 cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </form>
  );
}
