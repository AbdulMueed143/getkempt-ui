"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X, Package2, Clock, DollarSign, Settings2, Search,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ImageUpload } from "@/components/ui/image-upload";
import { packageSchema, type PackageSchema } from "@/lib/validations/package";
import {
  calculateBasePrice,
  calculateBaseDuration,
  calculateFinalPrice,
  calculateSaving,
  formatDuration,
  formatPrice,
} from "@/lib/utils/package-calculations";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/service";
import type { Package } from "@/types/package";
import type { Service } from "@/types/service";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

interface PackageSlideoverProps {
  isOpen:      boolean;
  onClose:     () => void;
  onSave:      (values: PackageSchema, editingId?: string) => void;
  editing?:    Package | null;
  services:    Service[];
  staffList:   { id: string; firstName: string; lastName: string }[];
}

const DEFAULT_VALUES: PackageSchema = {
  image:                 undefined,
  name:                  "",
  description:           "",
  serviceIds:            [],
  customDurationMinutes: null,
  discountEnabled:       false,
  discountType:          "percentage",
  discountValue:         null,
  status:                "active",
  onlineBookingEnabled:  true,
  staffIds:              [],
};

export function PackageSlideover({
  isOpen, onClose, onSave, editing, services, staffList,
}: PackageSlideoverProps) {
  const [serviceSearch, setServiceSearch] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PackageSchema>({
    resolver: zodResolver(packageSchema),
    defaultValues: DEFAULT_VALUES,
  });

  /* ── Sync form with editing record ─────────────── */
  useEffect(() => {
    if (editing) {
      reset({
        image:                 editing.image,
        name:                  editing.name,
        description:           editing.description,
        serviceIds:            editing.serviceIds,
        customDurationMinutes: editing.customDurationMinutes,
        discountEnabled:       editing.discountEnabled,
        discountType:          editing.discountType ?? "percentage",
        discountValue:         editing.discountValue,
        status:                editing.status,
        onlineBookingEnabled:  editing.onlineBookingEnabled,
        staffIds:              editing.staffIds,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
    setServiceSearch("");
  }, [editing, reset]);

  /* ── Watched values ─────────────────────────────── */
  const selectedIds       = watch("serviceIds");
  const discountEnabled   = watch("discountEnabled");
  const discountType      = watch("discountType");
  const discountValue     = watch("discountValue");
  const customDuration    = watch("customDurationMinutes");
  const durationOverride  = watch("customDurationMinutes") != null;

  /* ── Live calculations ──────────────────────────── */
  const included  = useMemo(
    () => services.filter((s) => selectedIds.includes(s.id)),
    [services, selectedIds]
  );
  const basePrice    = calculateBasePrice(included);
  const baseDuration = calculateBaseDuration(included);
  const finalPrice   = calculateFinalPrice(
    basePrice,
    discountEnabled ? discountType : null,
    discountEnabled ? discountValue : null
  );
  const saving      = calculateSaving(basePrice, finalPrice);
  const effectiveDuration = customDuration ?? baseDuration;

  /* ── Filtered service list ──────────────────────── */
  const filteredServices = useMemo(() => {
    const q = serviceSearch.toLowerCase();
    return q
      ? services.filter(
          (s) => s.name.toLowerCase().includes(q) || CATEGORY_LABELS[s.category].toLowerCase().includes(q)
        )
      : services;
  }, [services, serviceSearch]);

  /* ── Toggle helpers ─────────────────────────────── */
  const toggleService = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((s) => s !== id)
      : [...selectedIds, id];
    setValue("serviceIds", next, { shouldValidate: true });
  };

  const toggleStaff = (id: string) => {
    const cur = watch("staffIds");
    setValue(
      "staffIds",
      cur.includes(id) ? cur.filter((s) => s !== id) : [...cur, id]
    );
  };

  const onSubmit = (values: PackageSchema) => {
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
          "fixed top-0 right-0 h-full w-full max-w-[580px] z-50 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ backgroundColor: "#FFFFFF", boxShadow: "-4px 0 24px rgba(27,49,99,0.12)" }}
      >
        {/* ── Header ──────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid #E8ECF4" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#1B3163" }}>
              {editing ? "Edit Package" : "Create Package"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#8E95A5" }}>
              {editing ? "Update this service bundle" : "Bundle services into a discounted offering"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#F0F3FA", color: "#1B3163" }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable form body ─────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <form id="package-form" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ── 1. Package Info ────────────────────── */}
            <SlidSection icon={<Package2 size={15} />} title="Package Details">

              {/* Cover image */}
              <FieldWrap label="Cover Image">
                <Controller
                  control={control}
                  name="image"
                  render={({ field }) => (
                    <ImageUpload
                      aspect="landscape"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? undefined)}
                      hint="Shown on the booking page and package cards"
                      maxSizeMB={5}
                    />
                  )}
                />
              </FieldWrap>

              <FieldWrap label="Package Name" error={errors.name?.message} required>
                <SlidInput
                  placeholder="e.g. The Full Barber, Pamper Package"
                  hasError={!!errors.name}
                  {...register("name")}
                />
              </FieldWrap>
              <FieldWrap label="Description" error={errors.description?.message}>
                <textarea
                  placeholder="What's included and why clients will love it…"
                  rows={3}
                  className="w-full rounded-lg text-sm px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:bg-white"
                  style={{
                    backgroundColor: "#F8F9FC",
                    border:          "1px solid #E8ECF4",
                    color:           "#1B3163",
                  }}
                  {...register("description")}
                />
              </FieldWrap>
            </SlidSection>

            {/* ── 2. Select Services ────────────────── */}
            <SlidSection icon={<Package2 size={15} />} title="Services Included">
              {errors.serviceIds?.message && (
                <p className="text-xs text-red-500 flex items-center gap-1 -mt-2">
                  <span>⚠</span> {errors.serviceIds.message}
                </p>
              )}

              {/* Running total pill */}
              {included.length > 0 && (
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: "#EEF1F8", border: "1px solid #C7D2E8" }}
                >
                  <span style={{ color: "#1B3163" }}>
                    <strong>{included.length}</strong> service{included.length !== 1 ? "s" : ""} &nbsp;·&nbsp;{" "}
                    {formatDuration(baseDuration)} total
                  </span>
                  <span className="font-bold" style={{ color: "#1B3163" }}>
                    ${formatPrice(basePrice)}
                  </span>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9FB2D9" }} />
                <input
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Search services…"
                  className="w-full rounded-lg text-sm py-2.5 pl-8 pr-4"
                  style={{ backgroundColor: "#F8F9FC", border: "1px solid #E8ECF4", color: "#1B3163", outline: "none" }}
                />
              </div>

              {/* Service list */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #E8ECF4", maxHeight: 280, overflowY: "auto" }}
              >
                {filteredServices.length === 0 ? (
                  <p className="text-sm text-center py-6" style={{ color: "#8E95A5" }}>
                    No services found
                  </p>
                ) : (
                  filteredServices.map((svc, i) => {
                    const isSelected = selectedIds.includes(svc.id);
                    const cat        = CATEGORY_COLORS[svc.category];
                    return (
                      <label
                        key={svc.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                        style={{
                          borderTop:       i > 0 ? "1px solid #F0F3FA" : undefined,
                          backgroundColor: isSelected ? "#F5F7FC" : "white",
                        }}
                        onClick={() => toggleService(svc.id)}
                      >
                        {/* Checkbox */}
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                          style={{
                            border:          `1.5px solid ${isSelected ? "#1B3163" : "#D1D5DB"}`,
                            backgroundColor: isSelected ? "#1B3163" : "transparent",
                          }}
                        >
                          {isSelected && (
                            <svg width="9" height="9" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>

                        {/* Category tag */}
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                          style={{ color: cat.color, backgroundColor: cat.bg }}
                        >
                          {CATEGORY_LABELS[svc.category]}
                        </span>

                        {/* Name */}
                        <span
                          className="flex-1 text-sm truncate"
                          style={{ color: isSelected ? "#1B3163" : "#374151", fontWeight: isSelected ? 600 : 400 }}
                        >
                          {svc.name}
                        </span>

                        {/* Duration + Price */}
                        <span className="text-xs shrink-0" style={{ color: "#8E95A5" }}>
                          {formatDuration(svc.durationMinutes)} &nbsp;·&nbsp; ${formatPrice(svc.price)}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </SlidSection>

            {/* ── 3. Time & Pricing ─────────────────── */}
            <SlidSection icon={<Clock size={15} />} title="Time & Pricing">

              {/* Duration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#1B3163" }}>Duration</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8E95A5" }}>
                      Auto: <strong>{formatDuration(baseDuration)}</strong> from selected services
                    </p>
                  </div>
                  <Controller
                    name="customDurationMinutes"
                    control={control}
                    render={({ field }) => (
                      <Toggle
                        checked={field.value != null}
                        onChange={(val) => {
                          field.onChange(val ? (baseDuration || 30) : null);
                        }}
                      />
                    )}
                  />
                </div>

                {durationOverride && (
                  <FieldWrap
                    label="Custom duration (minutes)"
                    error={errors.customDurationMinutes?.message}
                  >
                    <SlidInput
                      type="number"
                      min="1"
                      placeholder={String(baseDuration || 30)}
                      hasError={!!errors.customDurationMinutes}
                      {...register("customDurationMinutes", { valueAsNumber: true })}
                    />
                  </FieldWrap>
                )}

                {/* Effective duration preview */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: "#F8F9FC", border: "1px solid #E8ECF4" }}
                >
                  <span style={{ color: "#8E95A5" }}>Effective duration</span>
                  <span className="font-bold" style={{ color: "#1B3163" }}>
                    {formatDuration(effectiveDuration)}
                    {durationOverride && (
                      <span
                        className="ml-2 text-[10px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
                      >
                        overridden
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid #F0F3FA" }} />

              {/* Discount */}
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#1B3163" }}>Apply discount</p>
                    <p className="text-xs mt-0.5" style={{ color: "#8E95A5" }}>
                      Reward clients for booking a bundle
                    </p>
                  </div>
                  <Controller
                    name="discountEnabled"
                    control={control}
                    render={({ field }) => (
                      <Toggle
                        checked={field.value}
                        onChange={(val) => {
                          if (!val) setValue("discountValue", null);
                          field.onChange(val);
                        }}
                      />
                    )}
                  />
                </label>

                {discountEnabled && (
                  <div className="space-y-3">
                    {/* Type selector */}
                    <FieldWrap label="Discount type" required>
                      <div className="grid grid-cols-2 gap-2">
                        {(["percentage", "fixed"] as const).map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm"
                            style={{
                              border:          `1.5px solid ${discountType === type ? "#1B3163" : "#E8ECF4"}`,
                              backgroundColor: discountType === type ? "#EEF1F8" : "#F8F9FC",
                              color:           discountType === type ? "#1B3163" : "#6B7A99",
                              fontWeight:      discountType === type ? 600 : 400,
                            }}
                          >
                            <input
                              type="radio"
                              className="accent-[#1B3163]"
                              {...register("discountType")}
                              value={type}
                            />
                            {type === "percentage" ? "Percentage (%)" : "Fixed amount ($)"}
                          </label>
                        ))}
                      </div>
                    </FieldWrap>

                    {/* Value input */}
                    <FieldWrap
                      label={discountType === "percentage" ? "Discount (%)" : "Discount ($)"}
                      error={errors.discountValue?.message}
                      required
                    >
                      <SlidInput
                        type="number"
                        step={discountType === "percentage" ? "1" : "0.01"}
                        min="0"
                        max={discountType === "percentage" ? "100" : undefined}
                        placeholder={discountType === "percentage" ? "e.g. 10" : "e.g. 15.00"}
                        icon={discountType === "percentage" ? undefined : <DollarSign size={14} />}
                        hasError={!!errors.discountValue}
                        {...register("discountValue", { valueAsNumber: true })}
                      />
                    </FieldWrap>
                  </div>
                )}

                {/* Live price preview */}
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid #E8ECF4" }}
                >
                  <div
                    className="px-4 py-3 flex items-center justify-between text-sm"
                    style={{ backgroundColor: "#F8F9FC", borderBottom: "1px solid #E8ECF4" }}
                  >
                    <span style={{ color: "#8E95A5" }}>Services total</span>
                    <span style={{ color: "#1B3163" }}>${formatPrice(basePrice)}</span>
                  </div>
                  {saving.amount > 0 && (
                    <div
                      className="px-4 py-3 flex items-center justify-between text-sm"
                      style={{ backgroundColor: "#F8F9FC", borderBottom: "1px solid #E8ECF4" }}
                    >
                      <span style={{ color: "#16A34A" }}>Discount</span>
                      <span style={{ color: "#16A34A" }}>−${formatPrice(saving.amount)}</span>
                    </div>
                  )}
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "#1B3163" }}>
                      Package price
                    </span>
                    <div className="flex items-center gap-2">
                      {saving.amount > 0 && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
                        >
                          Save {saving.percentage}%
                        </span>
                      )}
                      <span className="text-lg font-bold" style={{ color: "#1B3163" }}>
                        ${formatPrice(finalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SlidSection>

            {/* ── 4. Availability & Staff ───────────── */}
            <SlidSection icon={<Settings2 size={15} />} title="Availability & Staff">

              <FieldWrap label="Status" error={errors.status?.message} required>
                <SlidSelect {...register("status")} hasError={!!errors.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </SlidSelect>
              </FieldWrap>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#1B3163" }}>Online booking</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8E95A5" }}>
                    Allow clients to book this package online
                  </p>
                </div>
                <Controller
                  name="onlineBookingEnabled"
                  control={control}
                  render={({ field }) => (
                    <Toggle checked={field.value} onChange={field.onChange} />
                  )}
                />
              </label>

              {staffList.length > 0 && (
                <FieldWrap label="Staff who can deliver this package">
                  <div className="grid grid-cols-2 gap-2">
                    {staffList.map((s) => {
                      const checked = watch("staffIds").includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm transition-all"
                          style={{
                            border:          `1.5px solid ${checked ? "#1B3163" : "#E8ECF4"}`,
                            backgroundColor: checked ? "#EEF1F8" : "#F8F9FC",
                            color:           checked ? "#1B3163" : "#6B7A99",
                            fontWeight:      checked ? 600 : 400,
                          }}
                          onClick={() => toggleStaff(s.id)}
                        >
                          <div
                            className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
                            style={{
                              border:          `1.5px solid ${checked ? "#1B3163" : "#D1D5DB"}`,
                              backgroundColor: checked ? "#1B3163" : "transparent",
                            }}
                          >
                            {checked && (
                              <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          {s.firstName} {s.lastName}
                        </label>
                      );
                    })}
                  </div>
                </FieldWrap>
              )}
            </SlidSection>

          </form>
        </div>

        {/* ── Footer ──────────────────────────────── */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 shrink-0"
          style={{ borderTop: "1px solid #E8ECF4" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#F0F3FA", color: "#1B3163", border: "1px solid #E8ECF4" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="package-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "#D5B584", color: "#1B3163" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1B3163";
              (e.currentTarget as HTMLButtonElement).style.color = "#EAEAEA";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#D5B584";
              (e.currentTarget as HTMLButtonElement).style.color = "#1B3163";
            }}
          >
            {isSubmitting ? "Saving…" : editing ? "Save Changes" : "Create Package"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Micro-components ────────────────────────────── */
function SlidSection({
  icon, title, children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-5 space-y-4" style={{ borderBottom: "1px solid #F0F3FA" }}>
      <div className="flex items-center gap-2">
        <span style={{ color: "#1B3163" }}>{icon}</span>
        <h3 className="text-sm font-semibold" style={{ color: "#1B3163" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FieldWrap({
  label, error, required, children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "#8E95A5" }}>
        {label}{required && <span className="text-[#D5B584] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span>{error}
        </p>
      )}
    </div>
  );
}

interface SlidInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  icon?: React.ReactNode;
}
const SlidInput = React.forwardRef<HTMLInputElement, SlidInputProps>(
  ({ hasError, icon, ...props }, ref) => (
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-3 pointer-events-none" style={{ color: "#9FB2D9" }}>
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className="w-full rounded-lg text-sm py-2.5 transition-all"
        style={{
          paddingLeft:     icon ? "2.25rem" : "1rem",
          paddingRight:    "1rem",
          backgroundColor: "#F8F9FC",
          border:          `1px solid ${hasError ? "#EF4444" : "#E8ECF4"}`,
          color:           "#1B3163",
          outline:         "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = "1px solid #1B3163";
          e.currentTarget.style.backgroundColor = "white";
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = `1px solid ${hasError ? "#EF4444" : "#E8ECF4"}`;
          e.currentTarget.style.backgroundColor = "#F8F9FC";
        }}
        {...props}
      />
    </div>
  )
);
SlidInput.displayName = "SlidInput";

interface SlidSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}
const SlidSelect = React.forwardRef<HTMLSelectElement, SlidSelectProps>(
  ({ hasError, children, ...props }, ref) => (
    <select
      ref={ref}
      className="w-full rounded-lg text-sm py-2.5 px-4 appearance-none"
      style={{
        backgroundColor: "#F8F9FC",
        border:          `1px solid ${hasError ? "#EF4444" : "#E8ECF4"}`,
        color:           "#1B3163",
        outline:         "none",
      }}
      {...props}
    >
      {children}
    </select>
  )
);
SlidSelect.displayName = "SlidSelect";
