"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Save,
  ChevronDown,
  CalendarRange,
  CreditCard,
  TriangleAlert,
  CalendarOff,
  Percent,
  FileText,
  SlidersHorizontal,
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

/* ─────────────────────────────────────────────────
   Section definitions — unified visual language.
   Each section has a single subtle accent colour
   (drawn from the brand palette) that tints the
   icon tile when expanded. No emojis, no rainbow
   gradients — consistent, professional treatment.
   ───────────────────────────────────────────────── */
const SECTIONS = [
  {
    id: "scheduling",
    label: "Scheduling",
    description: "Booking windows & time-slot intervals",
    icon: CalendarRange,
    accent: "#1B3163", // royal indigo
  },
  {
    id: "payments",
    label: "Payments",
    description: "Deposits, payment mode & in-store methods",
    icon: CreditCard,
    accent: "#C4A882", // warm sand
  },
  {
    id: "cancellation",
    label: "Cancellation & no-show fees",
    description: "Tiered fees based on cancellation window",
    icon: TriangleAlert,
    accent: "#A16207", // amber-800 (warm warning)
  },
  {
    id: "holidays",
    label: "Holidays & closures",
    description: "Public holidays and planned time off",
    icon: CalendarOff,
    accent: "#86B0A5", // sage taupe
  },
  {
    id: "surcharges",
    label: "Surcharges",
    description: "Weekend, holiday & after-hours pricing",
    icon: Percent,
    accent: "#2A4A7F", // deeper indigo
  },
  {
    id: "policies",
    label: "Policies",
    description: "Cancellation & privacy policy text",
    icon: FileText,
    accent: "#4B5563", // slate
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function StoreSettingsClient() {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    new Set(["scheduling"]),
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setOpenSections(new Set(SECTIONS.map((s) => s.id)));
  }
  function collapseAll() {
    setOpenSections(new Set());
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

  const allOpen = openSections.size === SECTIONS.length;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-24">

      {/* ═══════════════════════════════════════════════════════════
          PAGE HEADER — clean, on-brand, no cheesy gradients
          ═══════════════════════════════════════════════════════════ */}
      <header className="flex items-start justify-between gap-4 flex-wrap pt-1">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: "#EEF1F8",
              border: "1px solid #CBD5ED",
            }}
          >
            <SlidersHorizontal size={20} className="text-[#1B3163]" strokeWidth={2.25} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C4A882] mb-0.5">
              Configuration
            </p>
            <h1 className="text-[22px] md:text-[26px] font-extrabold font-sans text-[#0B1220] leading-tight tracking-tight">
              Store Settings
            </h1>
            <p className="text-sm text-[#4B5563] font-medium mt-1">
              Scheduling windows, payments, holidays, surcharges &amp; policies.
            </p>
          </div>
        </div>

        {/* Expand / collapse control (desktop) */}
        <button
          type="button"
          onClick={allOpen ? collapseAll : expandAll}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-9 rounded-lg bg-white border border-[#E8E4DA] text-[#4B5563] hover:text-[#0B1220] hover:border-[#C4A882]/40 transition-colors"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE QUICK-JUMP PILLS — icon-based, no emojis
          ═══════════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
        {SECTIONS.map((section) => {
          const isOpen = openSections.has(section.id);
          const SectionIcon = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                if (!isOpen) toggleSection(section.id);
                document.getElementById(`section-${section.id}`)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-200 shrink-0 whitespace-nowrap border",
                isOpen
                  ? "bg-[#0B1220] text-white border-[#0B1220]"
                  : "bg-white text-[#4B5563] border-[#E8E4DA]"
              )}
            >
              <SectionIcon size={13} />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          ACCORDION SECTIONS
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const isOpen = openSections.has(section.id);
          const SectionIcon = section.icon;

          return (
            <section
              key={section.id}
              id={`section-${section.id}`}
              className={cn(
                "bg-white rounded-2xl border overflow-hidden transition-all duration-200 scroll-mt-20",
                isOpen
                  ? "border-[#E8E4DA] shadow-sm"
                  : "border-[#E8E4DA] hover:border-[#C4A882]/30"
              )}
            >
              {/* Accordion header */}
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 text-left transition-colors",
                  isOpen
                    ? "bg-white border-b border-[#F0EEE6]"
                    : "bg-white hover:bg-[#FAF8F3]"
                )}
                aria-expanded={isOpen}
                aria-controls={`panel-${section.id}`}
              >
                {/* Icon tile — unified brand treatment, accent only */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: isOpen ? `${section.accent}14` : "#F5F3EE",
                    border: `1px solid ${isOpen ? `${section.accent}30` : "#E8E4DA"}`,
                  }}
                >
                  <SectionIcon
                    size={18}
                    strokeWidth={2.25}
                    style={{ color: isOpen ? section.accent : "#6B7280" }}
                  />
                </div>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-[15px] font-bold text-[#0B1220] leading-tight truncate">
                    {section.label}
                  </h2>
                  <p className="text-[12px] text-[#6B7280] mt-0.5 font-medium truncate">
                    {section.description}
                  </p>
                </div>

                {/* Chevron */}
                <ChevronDown
                  size={18}
                  strokeWidth={2.25}
                  className={cn(
                    "shrink-0 transition-all duration-200",
                    isOpen ? "rotate-180 text-[#0B1220]" : "text-[#9CA3AF]",
                  )}
                />
              </button>

              {/* Accordion content */}
              <div
                id={`panel-${section.id}`}
                className={cn(
                  "transition-all duration-300 ease-in-out overflow-hidden",
                  isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0",
                )}
              >
                <div>{renderSectionContent(section.id)}</div>
              </div>
            </section>
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
            : "translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="max-w-4xl mx-auto px-4 pb-4 sm:pb-5">
          <div
            className="rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3"
            style={{
              backgroundColor: "#0B1220",
              border: "1px solid rgba(196,168,130,0.15)",
              boxShadow:
                "0 12px 32px rgba(11,18,32,0.28), 0 4px 8px rgba(11,18,32,0.18)",
            }}
          >
            <p className="text-xs sm:text-sm text-white/85 flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#C4A882] animate-pulse" />
              <span className="hidden sm:inline">You have unsaved changes</span>
              <span className="sm:hidden">Unsaved changes</span>
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                "bg-gradient-to-r from-[#C4A882] to-[#D5B584] text-[#0B1220]",
                "hover:shadow-lg hover:shadow-[#C4A882]/30 hover:brightness-[1.02]",
                "focus:outline-none focus:ring-2 focus:ring-[#C4A882] focus:ring-offset-2 focus:ring-offset-[#0B1220]",
                isSaving && "opacity-60 cursor-not-allowed",
              )}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0B1220]/30 border-t-[#0B1220] rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={15} strokeWidth={2.5} />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </form>
  );
}
