"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, SearchX } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/currency";
import {
  getBusinessBySlug,
  getBookableServices,
  getBookablePackages,
  getEligibleStaff,
  getAvailableDays,
  getAvailableSlots,
  createPublicBooking,
  createPaymentIntent,
  computeAmountDueNow,
} from "@/lib/api/public-booking";
import type {
  BusinessPublicProfile,
  BookableService,
  BookablePackage,
  BookableStaff,
  TimeSlot,
  DayAvailability,
  BookingSelection,
  CustomerDetails,
  PaymentMethod,
  PublicBookingResult,
} from "@/types/public-booking";

import { BusinessHero } from "./business-hero";
import { BookingStepper, type StepMeta } from "./booking-stepper";
import { BookingSummary } from "./booking-summary";
import { StepServices } from "./steps/step-services";
import { StepStaff } from "./steps/step-staff";
import { StepDateTime } from "./steps/step-datetime";
import { StepDetails } from "./steps/step-details";
import { StepPayment, type CardFields } from "./steps/step-payment";
import { StepConfirmation } from "./steps/step-confirmation";

type StepKey = "service" | "staff" | "datetime" | "details" | "payment";

const emptyCustomer: CustomerDetails = {
  firstName: "",
  lastName:  "",
  email:     "",
  phone:     "",
  notes:     "",
};

const emptyCard: CardFields = { name: "", number: "", expiry: "", cvc: "" };

export function BookingExperience({ slug }: { slug: string }) {
  /* ── Remote data ── */
  const [business, setBusiness] = useState<BusinessPublicProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadingBusiness, setLoadingBusiness] = useState(true);

  const [services, setServices] = useState<BookableService[]>([]);
  const [packages, setPackages] = useState<BookablePackage[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [staff, setStaff] = useState<BookableStaff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  const [days, setDays] = useState<DayAvailability[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  /* ── Selections ── */
  const [selections, setSelections] = useState<BookingSelection[]>([]);
  const [staffChosen, setStaffChosen] = useState(false);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [details, setDetails] = useState<CustomerDetails>(emptyCustomer);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [card, setCard] = useState<CardFields>(emptyCard);

  /* ── Flow ── */
  const [stepIndex, setStepIndex] = useState(0);
  const [showDetailErrors, setShowDetailErrors] = useState(false);
  const [showPaymentErrors, setShowPaymentErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PublicBookingResult | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  /* Stable signature of the current basket for effect dependencies. */
  const selectionKey = useMemo(
    () => selections.map((s) => `${s.kind}:${s.id}`).join(","),
    [selections]
  );
  const totalDuration = useMemo(
    () => selections.reduce((sum, s) => sum + s.durationMinutes, 0),
    [selections]
  );
  const totalPrice = useMemo(
    () => selections.reduce((sum, s) => sum + s.price, 0),
    [selections]
  );
  const eligibleStaffIds = useMemo(() => staff.map((s) => s.id), [staff]);

  const toggleSelection = useCallback((sel: BookingSelection) => {
    setSelections((prev) => {
      const exists = prev.some((s) => s.kind === sel.kind && s.id === sel.id);
      return exists
        ? prev.filter((s) => !(s.kind === sel.kind && s.id === sel.id))
        : [...prev, sel];
    });
  }, []);

  /* ── Load business + catalogue ── */
  useEffect(() => {
    let active = true;
    setLoadingBusiness(true);
    setLoadingCatalog(true);
    (async () => {
      const biz = await getBusinessBySlug(slug);
      if (!active) return;
      if (!biz) {
        setNotFound(true);
        setLoadingBusiness(false);
        setLoadingCatalog(false);
        return;
      }
      setBusiness(biz);
      setMethod(biz.payments.methods[0] ?? "card");
      setLoadingBusiness(false);

      const [svc, pkg] = await Promise.all([
        getBookableServices(slug),
        getBookablePackages(slug),
      ]);
      if (!active) return;
      setServices(svc);
      setPackages(pkg);
      setLoadingCatalog(false);
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  /* ── When the basket changes → reload eligible staff, reset downstream ── */
  useEffect(() => {
    if (selections.length === 0) {
      setStaff([]);
      setStaffChosen(false);
      setStaffId(null);
      setDate("");
      setStartTime("");
      setDays([]);
      setSlots([]);
      return;
    }
    let active = true;
    setLoadingStaff(true);
    setStaffChosen(false);
    setStaffId(null);
    setDate("");
    setStartTime("");
    setDays([]);
    setSlots([]);
    (async () => {
      const list = await getEligibleStaff(slug, selections);
      if (!active) return;
      setStaff(list);
      setLoadingStaff(false);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, slug]);

  /* ── Load the day strip once staff is chosen ── */
  const daysToken = useRef(0);
  useEffect(() => {
    if (!business || selections.length === 0 || !staffChosen) {
      setDays([]);
      return;
    }
    const token = ++daysToken.current;
    setLoadingDays(true);
    setDate("");
    setStartTime("");
    setSlots([]);
    (async () => {
      const list = await getAvailableDays({
        slug,
        staffId,
        eligibleStaffIds,
        durationMinutes: totalDuration,
        horizonDays: business.bookingHorizonDays,
      });
      if (token !== daysToken.current) return;
      setDays(list);
      setLoadingDays(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, staffChosen, staffId, slug]);

  /* ── Load slots when a day is chosen ── */
  const slotToken = useRef(0);
  useEffect(() => {
    if (selections.length === 0 || !staffChosen || !date) {
      setSlots([]);
      return;
    }
    const token = ++slotToken.current;
    setLoadingSlots(true);
    setStartTime("");
    (async () => {
      const list = await getAvailableSlots({
        slug,
        staffId,
        eligibleStaffIds,
        date,
        durationMinutes: totalDuration,
      });
      if (token !== slotToken.current) return;
      setSlots(list);
      setLoadingSlots(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, staffChosen, staffId, date, slug]);

  /* ── Derived: which steps exist ── */
  const amountDueNow = useMemo(
    () => (business && selections.length ? computeAmountDueNow(totalPrice, business.payments) : 0),
    [business, selections.length, totalPrice]
  );
  const hasPaymentStep = !!business?.payments.enabled && amountDueNow > 0;

  const steps = useMemo<Array<{ key: StepKey } & StepMeta>>(() => {
    const base: Array<{ key: StepKey; label: string }> = [
      { key: "service",  label: "Services" },
      { key: "staff",    label: "Professional" },
      { key: "datetime", label: "Time" },
      { key: "details",  label: "Your details" },
    ];
    if (hasPaymentStep) base.push({ key: "payment", label: "Payment" });
    return base;
  }, [hasPaymentStep]);

  const clampedIndex = Math.min(stepIndex, steps.length - 1);
  const currentStep = steps[clampedIndex]?.key ?? "service";
  const isLast = clampedIndex === steps.length - 1;

  /* ── Validation ── */
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email);
  const detailsValid =
    details.firstName.trim().length > 0 &&
    emailValid &&
    details.phone.trim().length > 0;

  const cardValid =
    card.name.trim().length > 0 &&
    card.number.replace(/\s/g, "").length >= 12 &&
    card.expiry.length === 5 &&
    card.cvc.length >= 3;
  const paymentValid = method === "card" ? cardValid : true;

  const canAdvance = useMemo(() => {
    switch (currentStep) {
      case "service":  return selections.length > 0;
      case "staff":    return staffChosen;
      case "datetime": return !!date && !!startTime;
      case "details":  return detailsValid;
      case "payment":  return paymentValid;
      default:         return false;
    }
  }, [currentStep, selections.length, staffChosen, date, startTime, detailsValid, paymentValid]);

  const scrollTop = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* ── Submit (create booking, and payment intent if applicable) ── */
  const submitBooking = useCallback(async () => {
    if (!business || selections.length === 0) return;
    setSubmitting(true);
    try {
      if (hasPaymentStep) {
        // Stub: real Stripe confirmation happens client-side with this secret.
        await createPaymentIntent({
          slug,
          amount: amountDueNow,
          currency: business.payments.currency,
        });
      }
      const res = await createPublicBooking({
        businessSlug: slug,
        selections,
        staffId,
        date,
        startTime,
        customer: details,
      });
      setResult(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }, [business, selections, hasPaymentStep, slug, amountDueNow, staffId, date, startTime, details]);

  const handlePrimary = useCallback(() => {
    if (currentStep === "details" && !detailsValid) {
      setShowDetailErrors(true);
      return;
    }
    if (currentStep === "payment" && !paymentValid) {
      setShowPaymentErrors(true);
      return;
    }
    if (!canAdvance) return;

    if (isLast) {
      void submitBooking();
    } else {
      setStepIndex((i) => i + 1);
      scrollTop();
    }
  }, [currentStep, detailsValid, paymentValid, canAdvance, isLast, submitBooking, scrollTop]);

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
    scrollTop();
  }, [scrollTop]);

  const resetForBookAnother = useCallback(() => {
    setResult(null);
    setSelections([]);
    setStaff([]);
    setStaffChosen(false);
    setStaffId(null);
    setDate("");
    setStartTime("");
    setDays([]);
    setSlots([]);
    setDetails(emptyCustomer);
    setCard(emptyCard);
    setShowDetailErrors(false);
    setShowPaymentErrors(false);
    setStepIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ── Render states ── */
  if (loadingBusiness) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-royal-indigo" />
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <SearchX className="h-10 w-10 text-ink-300" />
        <h1 className="heading-serif mt-4 text-2xl text-ink-900">Business not found</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-400">
          We couldn&apos;t find a business at this link. Double-check the address or
          contact them directly.
        </p>
      </div>
    );
  }

  /* ── Confirmation takes over the screen ── */
  if (result) {
    return (
      <div>
        <BusinessHero business={business} />
        <main className="mx-auto max-w-5xl px-5 pb-20">
          <StepConfirmation
            business={business}
            result={result}
            onBookAnother={resetForBookAnother}
          />
        </main>
      </div>
    );
  }

  const primaryLabel = isLast
    ? hasPaymentStep
      ? `Pay ${formatMoney(amountDueNow, business.payments.currency)}`
      : "Confirm booking"
    : "Continue";

  return (
    <div>
      <BusinessHero business={business} />

      <main ref={scrollRef} className="mx-auto max-w-5xl px-5 pb-32 lg:pb-20">
        {/* Stepper */}
        <div className="card-surface mb-6 px-5 py-4">
          <BookingStepper
            steps={steps}
            currentIndex={clampedIndex}
            onStepClick={(i) => {
              if (i < clampedIndex) {
                setStepIndex(i);
                scrollTop();
              }
            }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          {/* Active step */}
          <div className="card-surface min-w-0 p-5 sm:p-7 order-2 lg:order-1">
            {currentStep === "service" && (
              <StepServices
                services={services}
                packages={packages}
                loading={loadingCatalog}
                currency={business.payments.currency}
                selections={selections}
                onToggle={toggleSelection}
              />
            )}
            {currentStep === "staff" && (
              <StepStaff
                staff={staff}
                loading={loadingStaff}
                staffChosen={staffChosen}
                staffId={staffId}
                onSelect={(id) => {
                  setStaffId(id);
                  setStaffChosen(true);
                }}
              />
            )}
            {currentStep === "datetime" && (
              <StepDateTime
                date={date}
                startTime={startTime}
                days={days}
                daysLoading={loadingDays}
                slots={slots}
                loading={loadingSlots}
                onDateChange={setDate}
                onTimeChange={setStartTime}
              />
            )}
            {currentStep === "details" && (
              <StepDetails
                details={details}
                onChange={(patch) => setDetails((d) => ({ ...d, ...patch }))}
                showErrors={showDetailErrors}
              />
            )}
            {currentStep === "payment" && (
              <StepPayment
                business={business}
                amountDueNow={amountDueNow}
                method={method}
                onMethodChange={setMethod}
                card={card}
                onCardChange={(patch) => setCard((c) => ({ ...c, ...patch }))}
                showErrors={showPaymentErrors}
              />
            )}

            {/* Desktop inline nav */}
            <div className="mt-8 hidden items-center justify-between lg:flex">
              <button
                type="button"
                onClick={goBack}
                disabled={clampedIndex === 0}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-500 hover:bg-indigo-subtle disabled:opacity-0 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <PrimaryButton
                label={primaryLabel}
                onClick={handlePrimary}
                disabled={!canAdvance || submitting}
                loading={submitting}
                showArrow={!isLast}
              />
            </div>
          </div>

          {/* Summary sidebar */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-6 min-w-0">
            <BookingSummary
              business={business}
              selections={selections}
              staffChosen={staffChosen}
              staffName={staffId ? staff.find((s) => s.id === staffId)?.name ?? null : null}
              date={date}
              startTime={startTime}
              amountDueNow={amountDueNow}
            />
          </aside>
        </div>
      </main>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-white/95 backdrop-blur px-5 py-3 lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          {clampedIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-soft text-ink-600"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <PrimaryButton
            label={primaryLabel}
            onClick={handlePrimary}
            disabled={!canAdvance || submitting}
            loading={submitting}
            showArrow={!isLast}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}

function PrimaryButton({
  label,
  onClick,
  disabled,
  loading,
  showArrow,
  fullWidth,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  showArrow?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-royal-indigo px-6 text-sm font-semibold text-white transition-all",
        "hover:bg-indigo-hover active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed",
        fullWidth && "flex-1"
      )}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing…
        </>
      ) : (
        <>
          {label}
          {showArrow && <ChevronRight className="h-4 w-4" />}
        </>
      )}
    </button>
  );
}
