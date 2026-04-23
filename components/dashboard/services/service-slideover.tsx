"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Tag, Clock, DollarSign, Settings2 } from "lucide-react";
import { serviceSchema, type ServiceSchema } from "@/lib/validations/service";
import { DURATION_PRESETS, BUFFER_PRESETS } from "@/lib/mock/services";
import { MOCK_STAFF } from "@/lib/mock/staff";
import { CATEGORY_LABELS } from "@/types/service";
import type { Service, ServiceCategory } from "@/types/service";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils/cn";
import { Toggle } from "@/components/ui/toggle";

const CATEGORIES: ServiceCategory[] = [
  "hair", "barber", "nails", "beauty", "lash_brow", "massage", "other",
];

interface ServiceSlideoverProps {
  isOpen:   boolean;
  onClose:  () => void;
  onSave:   (values: ServiceSchema, editingId?: string) => void;
  editing?: Service | null;
  staffList?: { id: string; firstName: string; lastName: string }[];
}

export function ServiceSlideover({
  isOpen, onClose, onSave, editing, staffList = MOCK_STAFF,
}: ServiceSlideoverProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceSchema>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      image:                undefined,
      name:                 "",
      category:             "hair",
      description:          "",
      durationMinutes:      30,
      bufferMinutes:        0,
      price:                0,
      depositRequired:      false,
      depositAmount:        null,
      status:               "active",
      onlineBookingEnabled: true,
      staffIds:             [],
    },
  });

  const watchedDeposit  = watch("depositRequired");
  const watchedStaffIds = watch("staffIds");

  useEffect(() => {
    if (editing) {
      reset({
        image:                editing.image,
        name:                 editing.name,
        category:             editing.category,
        description:          editing.description,
        durationMinutes:      editing.durationMinutes,
        bufferMinutes:        editing.bufferMinutes,
        price:                editing.price,
        depositRequired:      editing.depositRequired,
        depositAmount:        editing.depositAmount,
        status:               editing.status,
        onlineBookingEnabled: editing.onlineBookingEnabled,
        staffIds:             editing.staffIds,
      });
    } else {
      reset({
        image: undefined,
        name: "", category: "hair", description: "",
        durationMinutes: 30, bufferMinutes: 0, price: 0,
        depositRequired: false, depositAmount: null,
        status: "active", onlineBookingEnabled: true, staffIds: [],
      });
    }
  }, [editing, reset]);

  const toggleStaff = (id: string) => {
    const current = watchedStaffIds ?? [];
    setValue(
      "staffIds",
      current.includes(id) ? current.filter((s) => s !== id) : [...current, id]
    );
  };

  const onSubmit = (values: ServiceSchema) => {
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
          "fixed top-0 right-0 h-full w-full max-w-[540px] z-50 flex flex-col",
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
              {editing ? "Edit Service" : "Add Service"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
              {editing ? "Update service details" : "Define a new service for your booking menu"}
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

        {/* Form body */}
        <div className="flex-1 overflow-y-auto">
          <form id="service-form" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ── Section 1: Identity ────────────────── */}
            <SlidSection icon={<Tag size={15} />} title="Service Details">

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
                      hint="Shown on the booking page and service cards"
                      maxSizeMB={5}
                    />
                  )}
                />
              </FieldWrap>

              <FieldWrap label="Service Name" error={errors.name?.message} required>
                <SlidInput placeholder="e.g. Gel Manicure" {...register("name")} hasError={!!errors.name} />
              </FieldWrap>

              {/* Category selector */}
              <FieldWrap label="Category" error={errors.category?.message} required>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => (
                        <label
                          key={cat}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm"
                          style={{
                            border:          `1.5px solid ${field.value === cat ? "#1B3163" : "#E8E4DA"}`,
                            backgroundColor: field.value === cat ? "#EEF1F8" : "#FAF8F3",
                            color:           field.value === cat ? "#1B3163" : "#6B7A99",
                            fontWeight:      field.value === cat ? 600 : 400,
                          }}
                        >
                          <input
                            type="radio"
                            className="accent-[#1B3163] shrink-0"
                            value={cat}
                            checked={field.value === cat}
                            onChange={() => field.onChange(cat)}
                          />
                          {CATEGORY_LABELS[cat]}
                        </label>
                      ))}
                    </div>
                  )}
                />
              </FieldWrap>

              <FieldWrap label="Description" error={errors.description?.message}>
                <textarea
                  placeholder="What's included in this service?"
                  rows={3}
                  className="w-full rounded-lg text-sm px-4 py-2.5 resize-none"
                  style={{
                    backgroundColor: "#FAF8F3",
                    border:          "1px solid #E8E4DA",
                    color:           "#1B3163",
                    outline:         "none",
                  }}
                  {...register("description")}
                />
              </FieldWrap>
            </SlidSection>

            {/* ── Section 2: Timing ──────────────────── */}
            <SlidSection icon={<Clock size={15} />} title="Timing">

              {/* Duration */}
              <FieldWrap label="Duration (minutes)" error={errors.durationMinutes?.message} required>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {DURATION_PRESETS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setValue("durationMinutes", d, { shouldValidate: true })}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor: watch("durationMinutes") === d ? "#1B3163" : "#F0EEE6",
                          color:           watch("durationMinutes") === d ? "#EAEAEA" : "#1B3163",
                          border:          `1px solid ${watch("durationMinutes") === d ? "#1B3163" : "#E8E4DA"}`,
                        }}
                      >
                        {d >= 60 ? `${d / 60}h${d % 60 ? ` ${d % 60}m` : ""}` : `${d}m`}
                      </button>
                    ))}
                  </div>
                  <SlidInput
                    type="number"
                    min="5"
                    placeholder="Or type custom minutes"
                    {...register("durationMinutes", { valueAsNumber: true })}
                    hasError={!!errors.durationMinutes}
                  />
                </div>
              </FieldWrap>

              {/* Buffer */}
              <FieldWrap label="Buffer / Cleanup time (minutes)" error={errors.bufferMinutes?.message}>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {BUFFER_PRESETS.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setValue("bufferMinutes", b, { shouldValidate: true })}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor: watch("bufferMinutes") === b ? "#1B3163" : "#F0EEE6",
                          color:           watch("bufferMinutes") === b ? "#EAEAEA" : "#1B3163",
                          border:          `1px solid ${watch("bufferMinutes") === b ? "#1B3163" : "#E8E4DA"}`,
                        }}
                      >
                        {b === 0 ? "None" : `${b}m`}
                      </button>
                    ))}
                  </div>
                </div>
              </FieldWrap>
            </SlidSection>

            {/* ── Section 3: Pricing ─────────────────── */}
            <SlidSection icon={<DollarSign size={15} />} title="Pricing">

              <FieldWrap label="Price (AUD)" error={errors.price?.message} required>
                <SlidInput
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  icon={<DollarSign size={15} />}
                  {...register("price", { valueAsNumber: true })}
                  hasError={!!errors.price}
                />
              </FieldWrap>

              {/* Deposit toggle */}
              <label className="flex items-center justify-between cursor-pointer py-2">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#1B3163" }}>
                    Require deposit
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                    Charge a deposit at booking to reduce no-shows
                  </p>
                </div>
                <Controller
                  name="depositRequired"
                  control={control}
                  render={({ field }) => (
                    <Toggle
                      checked={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        if (!val) setValue("depositAmount", null);
                      }}
                    />
                  )}
                />
              </label>

              {watchedDeposit && (
                <FieldWrap label="Deposit Amount ($)" error={errors.depositAmount?.message} required>
                  <SlidInput
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 30"
                    icon={<DollarSign size={15} />}
                    {...register("depositAmount", { valueAsNumber: true })}
                    hasError={!!errors.depositAmount}
                  />
                </FieldWrap>
              )}
            </SlidSection>

            {/* ── Section 4: Availability & Settings ─── */}
            <SlidSection icon={<Settings2 size={15} />} title="Availability & Settings">

              {/* Status */}
              <FieldWrap label="Status" error={errors.status?.message} required>
                <SlidSelect {...register("status")} hasError={!!errors.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </SlidSelect>
              </FieldWrap>

              {/* Online booking toggle */}
              <label className="flex items-center justify-between cursor-pointer py-2">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#1B3163" }}>
                    Online booking
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                    Allow clients to book this service online
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

              {/* Staff assignment */}
              <FieldWrap label="Staff who can perform this">
                <div className="grid grid-cols-2 gap-2">
                  {staffList.map((s) => {
                    const checked = (watchedStaffIds ?? []).includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm transition-all"
                        style={{
                          border:          `1.5px solid ${checked ? "#1B3163" : "#E8E4DA"}`,
                          backgroundColor: checked ? "#EEF1F8" : "#FAF8F3",
                          color:           checked ? "#1B3163" : "#6B7A99",
                          fontWeight:      checked ? 600 : 400,
                        }}
                        onClick={() => toggleStaff(s.id)}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
                          style={{ border: `1.5px solid ${checked ? "#1B3163" : "#D1D5DB"}`, backgroundColor: checked ? "#1B3163" : "transparent" }}
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
            form="service-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "#D5B584", color: "#1B3163" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1B3163"; (e.currentTarget as HTMLButtonElement).style.color = "#EAEAEA"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#D5B584"; (e.currentTarget as HTMLButtonElement).style.color = "#1B3163"; }}
          >
            {isSubmitting ? "Saving…" : editing ? "Save Changes" : "Add Service"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Scoped micro-components ─────────────────────── */
function SlidSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
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
      className="w-full rounded-lg text-sm py-2.5 transition-all"
      style={{ paddingLeft: icon ? "2.25rem" : "1rem", paddingRight: "1rem", backgroundColor: "#FAF8F3", border: `1px solid ${hasError ? "#EF4444" : "#E8E4DA"}`, color: "#1B3163", outline: "none" }}
      onFocus={(e) => { e.currentTarget.style.border = "1px solid #1B3163"; e.currentTarget.style.backgroundColor = "white"; }}
      onBlur={(e) => { e.currentTarget.style.border = `1px solid ${hasError ? "#EF4444" : "#E8E4DA"}`; e.currentTarget.style.backgroundColor = "#FAF8F3"; }}
      {...props}
    />
  </div>
));
SlidInput.displayName = "SlidInput";

interface SlidSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { hasError?: boolean; }
const SlidSelect = React.forwardRef<HTMLSelectElement, SlidSelectProps>(({ hasError, children, ...props }, ref) => (
  <select ref={ref} className="w-full rounded-lg text-sm py-2.5 px-4 appearance-none" style={{ backgroundColor: "#FAF8F3", border: `1px solid ${hasError ? "#EF4444" : "#E8E4DA"}`, color: "#1B3163", outline: "none" }} {...props}>{children}</select>
));
SlidSelect.displayName = "SlidSelect";
