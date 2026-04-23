"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Gift, Target, MapPin, Clock, Settings2, DollarSign, Percent } from "lucide-react";
import { loyaltyProgramSchema, type LoyaltyProgramSchema } from "@/lib/validations/loyalty";
import type { LoyaltyProgram, RewardType } from "@/types/loyalty";
import {
  REWARD_TYPE_LABELS, REWARD_TYPE_DESCRIPTIONS,
  TRIGGER_TYPE_LABELS,
} from "@/types/loyalty";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils/cn";

const REWARD_TYPES: RewardType[] = ["percentage", "fixed", "free_visit", "free_item"];

const DEFAULT_VALUES: LoyaltyProgramSchema = {
  name:               "",
  description:        "",
  rewardType:         "percentage",
  rewardValue:        null,
  rewardLabel:        "",
  redeemLocation:     "own_shop",
  partnerName:        null,
  partnerAddress:     null,
  triggerType:        "visits",
  triggerValue:       10,
  programExpiryDate:  null,
  rewardExpiryDays:   null,
  status:             "active",
};

interface LoyaltySlideoverProps {
  isOpen:   boolean;
  onClose:  () => void;
  onSave:   (values: LoyaltyProgramSchema, editingId?: string) => void;
  editing?: LoyaltyProgram | null;
}

export function LoyaltySlideover({ isOpen, onClose, onSave, editing }: LoyaltySlideoverProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoyaltyProgramSchema>({
    resolver:      zodResolver(loyaltyProgramSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const rewardType      = watch("rewardType");
  const redeemLocation  = watch("redeemLocation");
  const triggerType     = watch("triggerType");
  const hasRewardExpiry = watch("rewardExpiryDays") != null;
  const hasProgramExpiry = watch("programExpiryDate") != null && watch("programExpiryDate") !== "";

  const needsRewardValue = rewardType === "percentage" || rewardType === "fixed";

  /* ── Sync editing record ─────────────────────────────── */
  useEffect(() => {
    if (editing) {
      reset({
        name:               editing.name,
        description:        editing.description,
        rewardType:         editing.rewardType,
        rewardValue:        editing.rewardValue,
        rewardLabel:        editing.rewardLabel,
        redeemLocation:     editing.redeemLocation,
        partnerName:        editing.partnerName,
        partnerAddress:     editing.partnerAddress,
        triggerType:        editing.triggerType,
        triggerValue:       editing.triggerValue,
        programExpiryDate:  editing.programExpiryDate,
        rewardExpiryDays:   editing.rewardExpiryDays,
        status:             editing.status,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [editing, reset]);

  const onSubmit = (values: LoyaltyProgramSchema) => {
    onSave(values, editing?.id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[560px] z-50 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ backgroundColor: "#FFFFFF", boxShadow: "-4px 0 24px rgba(27,49,99,0.12)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid #E8E4DA" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#1B3163" }}>
              {editing ? "Edit Program" : "Add Loyalty Program"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
              {editing ? "Update this program's details" : "Create a new rung in your loyalty ladder"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#F0EEE6", color: "#1B3163" }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <form id="loyalty-form" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ── 1. Program details ─────────────────── */}
            <SlidSection icon={<Gift size={15} />} title="Program Details">
              <FieldWrap label="Program Name" error={errors.name?.message} required>
                <SlidInput
                  placeholder="e.g. First Timer Bonus, VIP Gold Status"
                  hasError={!!errors.name}
                  {...register("name")}
                />
              </FieldWrap>
              <FieldWrap label="Description" error={errors.description?.message}>
                <textarea
                  placeholder="Tell clients what makes this reward special…"
                  rows={3}
                  className="w-full rounded-lg text-sm px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:bg-white"
                  style={{ backgroundColor: "#FAF8F3", border: "1px solid #E8E4DA", color: "#1B3163" }}
                  {...register("description")}
                />
              </FieldWrap>
            </SlidSection>

            {/* ── 2. Reward ──────────────────────────── */}
            <SlidSection icon={<Gift size={15} />} title="What they earn">

              {/* Reward type */}
              <FieldWrap label="Reward Type" error={errors.rewardType?.message} required>
                <div className="grid grid-cols-2 gap-2">
                  {REWARD_TYPES.map((type) => {
                    const isActive = rewardType === type;
                    return (
                      <label
                        key={type}
                        className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                        style={{
                          border:          `1.5px solid ${isActive ? "#1B3163" : "#E8E4DA"}`,
                          backgroundColor: isActive ? "#EEF1F8" : "#FAF8F3",
                        }}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          value={type}
                          {...register("rewardType")}
                        />
                        <span className="text-xs font-semibold" style={{ color: isActive ? "#1B3163" : "#374151" }}>
                          {REWARD_TYPE_LABELS[type]}
                        </span>
                        <span className="text-[10px] leading-snug" style={{ color: "#6B7280" }}>
                          {REWARD_TYPE_DESCRIPTIONS[type]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </FieldWrap>

              {/* Value — only for % and $ types */}
              {needsRewardValue && (
                <FieldWrap
                  label={rewardType === "percentage" ? "Discount (%)" : "Discount ($)"}
                  error={errors.rewardValue?.message}
                  required
                >
                  <SlidInput
                    type="number"
                    step={rewardType === "percentage" ? "1" : "0.01"}
                    min="0"
                    max={rewardType === "percentage" ? "100" : undefined}
                    placeholder={rewardType === "percentage" ? "e.g. 15" : "e.g. 20.00"}
                    icon={rewardType === "percentage" ? <Percent size={14} /> : <DollarSign size={14} />}
                    hasError={!!errors.rewardValue}
                    {...register("rewardValue", { valueAsNumber: true })}
                  />
                </FieldWrap>
              )}

              {/* Client-facing label */}
              <FieldWrap
                label="Reward label (shown to clients)"
                error={errors.rewardLabel?.message}
                required
              >
                <SlidInput
                  placeholder={
                    rewardType === "percentage" ? "e.g. 15% off your next visit" :
                    rewardType === "fixed"      ? "e.g. $20 off your next service" :
                    rewardType === "free_visit" ? "e.g. Free haircut (up to $60)" :
                                                  "e.g. Free coffee at Brew & Co."
                  }
                  hasError={!!errors.rewardLabel}
                  {...register("rewardLabel")}
                />
              </FieldWrap>
            </SlidSection>

            {/* ── 3. Redemption location ─────────────── */}
            <SlidSection icon={<MapPin size={15} />} title="Where it can be redeemed">

              <div className="grid grid-cols-2 gap-2">
                {(["own_shop", "partner"] as const).map((loc) => {
                  const isActive = redeemLocation === loc;
                  return (
                    <label
                      key={loc}
                      className="flex flex-col gap-1 px-3 py-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        border:          `1.5px solid ${isActive ? "#1B3163" : "#E8E4DA"}`,
                        backgroundColor: isActive ? "#EEF1F8" : "#FAF8F3",
                      }}
                    >
                      <input type="radio" className="sr-only" value={loc} {...register("redeemLocation")} />
                      <span className="text-sm font-semibold" style={{ color: isActive ? "#1B3163" : "#374151" }}>
                        {loc === "own_shop" ? "Your shop" : "Partner shop"}
                      </span>
                      <span className="text-xs leading-snug" style={{ color: "#6B7280" }}>
                        {loc === "own_shop"
                          ? "Client redeems the reward when they next visit you"
                          : "Reward redeemable at a nearby partner business"}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Partner details */}
              {redeemLocation === "partner" && (
                <div className="space-y-3">
                  <FieldWrap label="Partner shop name" error={errors.partnerName?.message} required>
                    <SlidInput
                      placeholder="e.g. Brew & Co."
                      hasError={!!errors.partnerName}
                      {...register("partnerName")}
                    />
                  </FieldWrap>
                  <FieldWrap label="Partner address" error={errors.partnerAddress?.message}>
                    <SlidInput
                      placeholder="e.g. 12 Collins Street, Melbourne VIC 3000"
                      hasError={!!errors.partnerAddress}
                      {...register("partnerAddress")}
                    />
                  </FieldWrap>
                </div>
              )}
            </SlidSection>

            {/* ── 4. Eligibility trigger ─────────────── */}
            <SlidSection icon={<Target size={15} />} title="How clients earn it">

              <FieldWrap label="Trigger type" required>
                <div className="grid grid-cols-2 gap-2">
                  {(["visits", "spend"] as const).map((t) => {
                    const isActive = triggerType === t;
                    return (
                      <label
                        key={t}
                        className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                        style={{
                          border:          `1.5px solid ${isActive ? "#1B3163" : "#E8E4DA"}`,
                          backgroundColor: isActive ? "#EEF1F8" : "#FAF8F3",
                        }}
                      >
                        <input type="radio" className="sr-only" value={t} {...register("triggerType")} />
                        <span className="text-xs font-semibold" style={{ color: isActive ? "#1B3163" : "#374151" }}>
                          {TRIGGER_TYPE_LABELS[t]}
                        </span>
                        <span className="text-[10px] leading-snug" style={{ color: "#6B7280" }}>
                          {t === "visits" ? "Count how many times they visit" : "Track total $ spent"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </FieldWrap>

              <FieldWrap
                label={triggerType === "visits" ? "Number of visits required" : "Amount to spend ($)"}
                error={errors.triggerValue?.message}
                required
              >
                <SlidInput
                  type="number"
                  min="1"
                  step={triggerType === "spend" ? "0.01" : "1"}
                  placeholder={triggerType === "visits" ? "e.g. 10" : "e.g. 300"}
                  icon={triggerType === "spend" ? <DollarSign size={14} /> : undefined}
                  hasError={!!errors.triggerValue}
                  {...register("triggerValue", { valueAsNumber: true })}
                />
              </FieldWrap>

              {/* Preview */}
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{ backgroundColor: "#EEF1F8", border: "1px solid #C7D2E8" }}
              >
                <span style={{ color: "#6B7280" }}>Client earns this reward after </span>
                <strong style={{ color: "#1B3163" }}>
                  {triggerType === "visits"
                    ? `${watch("triggerValue") || "?"} visits`
                    : `spending $${watch("triggerValue") || "?"}`}
                </strong>
              </div>
            </SlidSection>

            {/* ── 5. Expiry ──────────────────────────── */}
            <SlidSection icon={<Clock size={15} />} title="Expiry settings">

              {/* Reward validity */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#1B3163" }}>Reward expires after earning</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                    Limit how long a client has to use the earned reward
                  </p>
                </div>
                <Toggle
                  checked={hasRewardExpiry}
                  onChange={(val) => setValue("rewardExpiryDays", val ? 30 : null)}
                />
              </label>

              {hasRewardExpiry && (
                <FieldWrap label="Reward valid for (days)" error={errors.rewardExpiryDays?.message} required>
                  <SlidInput
                    type="number"
                    min="1"
                    placeholder="e.g. 30"
                    hasError={!!errors.rewardExpiryDays}
                    {...register("rewardExpiryDays", { valueAsNumber: true })}
                  />
                </FieldWrap>
              )}

              {/* Program expiry date */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#1B3163" }}>Program has an end date</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                    Set a date after which this program is no longer available
                  </p>
                </div>
                <Toggle
                  checked={hasProgramExpiry}
                  onChange={(val) => setValue("programExpiryDate", val ? "" : null)}
                />
              </label>

              {hasProgramExpiry && (
                <FieldWrap label="Program end date" error={errors.programExpiryDate?.message} required>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-lg text-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#1B3163]"
                    style={{ backgroundColor: "#FAF8F3", border: "1px solid #E8E4DA", color: "#1B3163" }}
                    {...register("programExpiryDate")}
                  />
                </FieldWrap>
              )}
            </SlidSection>

            {/* ── 6. Status ──────────────────────────── */}
            <SlidSection icon={<Settings2 size={15} />} title="Status">
              <FieldWrap label="Program status" error={errors.status?.message} required>
                <div className="grid grid-cols-3 gap-2">
                  {(["active", "inactive", "draft"] as const).map((s) => {
                    const cur      = watch("status");
                    const isActive = cur === s;
                    const colors: Record<string, { bg: string; color: string; border: string }> = {
                      active:   { bg: "#DCFCE7", color: "#15803D", border: "#BBF7D0" },
                      inactive: { bg: "#F3F4F6", color: "#6B7A99", border: "#E5E7EB" },
                      draft:    { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
                    };
                    return (
                      <label
                        key={s}
                        className="flex items-center justify-center px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all"
                        style={{
                          border:          isActive ? `1.5px solid ${colors[s].border}` : "1.5px solid #E8E4DA",
                          backgroundColor: isActive ? colors[s].bg : "#FAF8F3",
                          color:           isActive ? colors[s].color : "#6B7A99",
                        }}
                      >
                        <input type="radio" className="sr-only" value={s} {...register("status")} />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </label>
                    );
                  })}
                </div>
              </FieldWrap>
            </SlidSection>

          </form>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 shrink-0"
          style={{ borderTop: "1px solid #E8E4DA" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#F0EEE6", color: "#1B3163", border: "1px solid #E8E4DA" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="loyalty-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "#D5B584", color: "#1B3163" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1B3163"; (e.currentTarget as HTMLButtonElement).style.color = "#EAEAEA"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#D5B584"; (e.currentTarget as HTMLButtonElement).style.color = "#1B3163"; }}
          >
            {isSubmitting ? "Saving…" : editing ? "Save Changes" : "Add Program"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Micro-components ─────────────────────────────────── */
function SlidSection({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5 space-y-4" style={{ borderBottom: "1px solid #F0EEE6" }}>
      <div className="flex items-center gap-2">
        <span style={{ color: "#1B3163" }}>{icon}</span>
        <h3 className="text-sm font-semibold" style={{ color: "#1B3163" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FieldWrap({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "#6B7280" }}>
        {label}{required && <span className="text-[#D5B584] ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  );
}

interface SlidInputProps extends React.InputHTMLAttributes<HTMLInputElement> { hasError?: boolean; icon?: React.ReactNode; }
const SlidInput = React.forwardRef<HTMLInputElement, SlidInputProps>(({ hasError, icon, ...props }, ref) => (
  <div className="relative flex items-center">
    {icon && <span className="absolute left-3 pointer-events-none" style={{ color: "#9FB2D9" }}>{icon}</span>}
    <input
      ref={ref}
      className="w-full rounded-lg text-sm py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:bg-white"
      style={{
        paddingLeft:     icon ? "2.25rem" : "1rem",
        paddingRight:    "1rem",
        backgroundColor: "#FAF8F3",
        border:          `1px solid ${hasError ? "#EF4444" : "#E8E4DA"}`,
        color:           "#1B3163",
      }}
      {...props}
    />
  </div>
));
SlidInput.displayName = "SlidInput";
