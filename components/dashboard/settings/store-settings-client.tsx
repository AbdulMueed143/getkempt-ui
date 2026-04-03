"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save, AlertCircle, Settings2, ChevronDown,
  CalendarRange, CreditCard, TriangleAlert,
  CalendarOff, Percent, FileText,
} from "lucide-react";
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

/* ── Section definitions ─────────────────────────────────────── */
const SECTIONS = [
  {
    id: "scheduling",
    label: "Scheduling",
    description: "Booking windows & time slots",
    icon: CalendarRange,
    gradient: "from-blue-500 to-indigo-600",
    lightBg: "from-blue-50 to-indigo-50/30",
    emoji: "📅",
  },
  {
    id: "payments",
    label: "Payments",
    description: "Payment modes & deposits",
    icon: CreditCard,
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "from-emerald-50 to-teal-50/30",
    emoji: "💳",
  },
  {
    id: "cancellation",
    label: "Cancellation",
    description: "No-show & cancellation fees",
    icon: TriangleAlert,
    gradient: "from-amber-500 to-orange-600",
    lightBg: "from-amber-50 to-orange-50/30",
    emoji: "⚠️",
  },
  {
    id: "holidays",
    label: "Holidays",
    description: "Closures & public holidays",
    icon: CalendarOff,
    gradient: "from-rose-500 to-pink-600",
    lightBg: "from-rose-50 to-pink-50/30",
    emoji: "🏖️",
  },
  {
    id: "surcharges",
    label: "Surcharges",
    description: "Weekend & after-hours pricing",
    icon: Percent,
    gradient: "from-violet-500 to-purple-600",
    lightBg: "from-violet-50 to-purple-50/30",
    emoji: "💲",
  },
  {
    id: "policies",
    label: "Policies",
    description: "Cancellation & privacy text",
    icon: FileText,
    gradient: "from-slate-500 to-gray-600",
    lightBg: "from-slate-50 to-gray-50/30",
    emoji: "📄",
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function StoreSettingsClient() {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    new Set(["scheduling"])
  );

  const form = useForm<StoreSettingsSchema>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      bookingWindowValue: MOCK_STORE_SETTINGS.bookingWindowValue,
      bookingWindowUnit:  MOCK_STORE_SETTINGS.bookingWindowUnit,
      slotInterval:       MOCK_STORE_SETTINGS.slotInterval,
      holidays:       MOCK_STORE_SETTINGS.holidays,
      surchargeRules: MOCK_STORE_SETTINGS.surchargeRules,
      paymentMode:     MOCK_STORE_SETTINGS.paymentMode,
      depositType:     MOCK_STORE_SETTINGS.depositType,
      depositValue:    MOCK_STORE_SETTINGS.depositValue,
      inStoreMethods:  MOCK_STORE_SETTINGS.inStoreMethods,
      stripeConnected: MOCK_STORE_SETTINGS.stripeConnected,
      noShowFeeType:        MOCK_STORE_SETTINGS.noShowFeeType,
      noShowFeeValue:       MOCK_STORE_SETTINGS.noShowFeeValue,
      autoCharge:           MOCK_STORE_SETTINGS.autoCharge,
      cancellationFeeRules: MOCK_STORE_SETTINGS.cancellationFeeRules,
      cancellationPolicy: MOCK_STORE_SETTINGS.cancellationPolicy,
      privacyPolicy:      MOCK_STORE_SETTINGS.privacyPolicy,
    },
  });

  const { handleSubmit, formState: { isDirty } } = form;

  function toggleSection(id: SectionId) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function onSubmit(data: StoreSettingsSchema) {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    console.log("Store settings saved:", data);
    setIsSaving(false);
    toast.success({
      title: "Settings saved",
      message: "Your store settings have been updated successfully.",
    });
  }

  function renderSectionContent(id: SectionId) {
    switch (id) {
      case "scheduling":   return <SchedulingSection form={form} />;
      case "payments":     return <PaymentsSection form={form} />;
      case "cancellation": return <CancellationFeesSection form={form} />;
      case "holidays":     return <HolidaysSection form={form} />;
      case "surcharges":   return <SurchargeSection form={form} />;
      case "policies":     return <PoliciesSection form={form} />;
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">

      {/* ═══════════════════════════════════════════════════════════
          HEADER BANNER
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-none sm:rounded-2xl mb-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1B2A] via-[#1B3163] to-[#2A4A7F]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2em0wIDJjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="relative px-5 sm:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-lg">
              <Settings2 className="w-6 h-6 sm:w-7 sm:h-7 text-white/80" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Store Settings
              </h1>
              <p className="text-sm text-white/50 mt-0.5">
                Booking windows, payments, holidays, surcharges &amp; policies
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE QUICK-JUMP PILLS
          ═══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-4 px-1 scrollbar-hide">
        {SECTIONS.map((section) => {
          const isOpen = openSections.has(section.id);
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                if (!isOpen) toggleSection(section.id);
                // Scroll to section
                document.getElementById(`section-${section.id}`)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 whitespace-nowrap border",
                isOpen
                  ? "bg-[#0D1B2A] text-white border-[#0D1B2A] shadow-sm"
                  : "bg-white text-[#6B7A99] border-[#E8ECF4] hover:border-[#C4A882]/40 hover:shadow-sm"
              )}
            >
              <span className="text-sm leading-none">{section.emoji}</span>
              {section.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ACCORDION SECTIONS
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-3 px-1 sm:px-0 pb-24">
        {SECTIONS.map((section) => {
          const isOpen = openSections.has(section.id);
          const SectionIcon = section.icon;

          return (
            <div
              key={section.id}
              id={`section-${section.id}`}
              className={cn(
                "rounded-2xl border overflow-hidden transition-all duration-300 scroll-mt-20",
                isOpen
                  ? "border-[#E8ECF4] shadow-sm bg-white"
                  : "border-[#E8ECF4]/80 bg-white hover:shadow-sm hover:border-[#E8ECF4]"
              )}
            >
              {/* Accordion header */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 sm:py-5 text-left transition-all duration-200",
                  isOpen && "border-b border-[#F0F3FA]"
                )}
              >
                {/* Icon with gradient */}
                <div className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm",
                  isOpen
                    ? `bg-gradient-to-br ${section.gradient}`
                    : "bg-gradient-to-br from-[#F4F2EE] to-[#E8E2D8]"
                )}>
                  <SectionIcon className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    isOpen ? "text-white" : "text-[#6B7A99]"
                  )} />
                </div>

                {/* Label & description */}
                <div className="flex-1 min-w-0">
                  <h2 className={cn(
                    "text-sm sm:text-base font-bold transition-colors",
                    isOpen ? "text-[#0D1B2A]" : "text-[#0D1B2A]/80"
                  )}>
                    {section.label}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#8E95A5] mt-0.5 truncate">
                    {section.description}
                  </p>
                </div>

                {/* Chevron */}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                  isOpen ? "bg-[#F4F2EE] rotate-180" : "bg-transparent"
                )}>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-colors",
                    isOpen ? "text-[#0D1B2A]" : "text-[#C4C9D4]"
                  )} />
                </div>
              </button>

              {/* Accordion content */}
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="p-0">
                  {renderSectionContent(section.id)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          FLOATING SAVE BAR
          ═══════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-out",
          isDirty
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="max-w-4xl mx-auto px-4 pb-4 sm:pb-5">
          <div className="bg-[#0D1B2A] rounded-2xl shadow-2xl shadow-[#0D1B2A]/20 border border-white/5 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-white/70 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="hidden sm:inline">You have unsaved changes</span>
              <span className="sm:hidden">Unsaved changes</span>
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                "bg-gradient-to-r from-[#C4A882] to-[#E8D5B7] text-[#0D1B2A]",
                "hover:shadow-lg hover:shadow-[#C4A882]/30 hover:scale-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:ring-offset-2 focus:ring-offset-[#0D1B2A]",
                "active:scale-[0.98]",
                isSaving && "opacity-60 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0D1B2A]/30 border-t-[#0D1B2A] rounded-full animate-spin" />
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
        </div>
      </div>
    </form>
  );
}
