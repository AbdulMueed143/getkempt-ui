"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, User, Mail, Phone, Briefcase, DollarSign, Calendar } from "lucide-react";
import { staffSchema, type StaffSchema } from "@/lib/validations/staff";
import { ALL_SERVICES, STAFF_COLORS } from "@/lib/mock/staff";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/types/staff";
import type { StaffMember } from "@/types/staff";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils/cn";

/* ── Helpers ─────────────────────────────────────── */
const ROLES    = ["owner", "manager", "staff"] as const;
const STATUSES = [
  { value: "active",   label: "Active" },
  { value: "on_leave", label: "On Leave" },
  { value: "inactive", label: "Inactive" },
] as const;
const PAY_TYPES = [
  { value: "hourly",     label: "Hourly rate" },
  { value: "commission", label: "Commission %" },
  { value: "salary",     label: "Salary" },
] as const;

interface StaffSlideoverProps {
  isOpen:   boolean;
  onClose:  () => void;
  onSave:   (values: StaffSchema, editingId?: string) => void;
  editing?: StaffMember | null;
}

export function StaffSlideover({ isOpen, onClose, onSave, editing }: StaffSlideoverProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StaffSchema>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      firstName:      "",
      lastName:       "",
      email:          "",
      phone:          "",
      bio:            "",
      specialization: "",
      avatarImage:    undefined,
      avatarColor:    STAFF_COLORS[0],
      calendarColor:  STAFF_COLORS[0],
      role:           "staff",
      status:         "active",
      services:       [],
      commissionType: "hourly",
      commissionRate: null,
      startDate:      new Date().toISOString().split("T")[0],
    },
  });

  const watchedCommissionType = watch("commissionType");
  const watchedServices       = watch("services");

  /* Pre-fill form when editing */
  useEffect(() => {
    if (editing) {
      reset({
        firstName:      editing.firstName,
        lastName:       editing.lastName,
        email:          editing.email,
        phone:          editing.phone,
        bio:            editing.bio,
        specialization: editing.specialization,
        avatarImage:    editing.avatarImage,
        avatarColor:    editing.avatarColor,
        calendarColor:  editing.calendarColor,
        role:           editing.role,
        status:         editing.status,
        services:       editing.services,
        commissionType: editing.commissionType,
        commissionRate: editing.commissionRate,
        startDate:      editing.startDate,
      });
    } else {
      reset({
        firstName: "", lastName: "", email: "", phone: "",
        bio: "", specialization: "",
        avatarImage: undefined,
        avatarColor: STAFF_COLORS[0], calendarColor: STAFF_COLORS[0],
        role: "staff", status: "active", services: [],
        commissionType: "hourly", commissionRate: null,
        startDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [editing, reset]);

  /* Service checkbox toggle */
  const toggleService = (service: string) => {
    const current = watchedServices ?? [];
    const updated = current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service];
    setValue("services", updated, { shouldValidate: true });
  };

  const onSubmit = (values: StaffSchema) => {
    onSave(values, editing?.id);
    onClose();
  };

  return (
    <>
      {/* ── Backdrop ────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Panel ───────────────────────────────────── */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[520px] z-50 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ backgroundColor: "#FFFFFF", boxShadow: "-4px 0 24px rgba(27,49,99,0.12)" }}
        aria-label="Staff member form"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid #E8E4DA" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#1B3163" }}>
              {editing ? "Edit Staff Member" : "Add Staff Member"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
              {editing ? "Update details below" : "Fill in the details to add a new team member"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: "#F0EEE6", color: "#1B3163" }}
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto">
          <form id="staff-form" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ── Section 1: Personal Details ─────────── */}
            <FormSection icon={<User size={15} />} title="Personal Details">

              {/* Profile photo */}
              <div className="mb-4">
                <label className="block text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "#6B7280" }}>
                  Profile Photo
                </label>
                <div className="flex items-start gap-4">
                  <Controller
                    control={control}
                    name="avatarImage"
                    render={({ field }) => (
                      <ImageUpload
                        aspect="square"
                        value={field.value ?? null}
                        onChange={(v) => field.onChange(v ?? undefined)}
                        hint="Used as avatar across the system"
                        maxSizeMB={5}
                      />
                    )}
                  />
                  <p className="text-xs text-gray-400 mt-1 flex-1">
                    Upload a profile photo. If none is provided, a coloured monogram will be used automatically.
                  </p>
                </div>
              </div>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <FieldWrap label="First Name" error={errors.firstName?.message} required>
                  <FieldInput placeholder="Alex" {...register("firstName")} hasError={!!errors.firstName} />
                </FieldWrap>
                <FieldWrap label="Last Name" error={errors.lastName?.message} required>
                  <FieldInput placeholder="Rivera" {...register("lastName")} hasError={!!errors.lastName} />
                </FieldWrap>
              </div>

              <FieldWrap label="Email Address" error={errors.email?.message} required>
                <FieldInput type="email" placeholder="alex@yoursalon.com" icon={<Mail size={15} />} {...register("email")} hasError={!!errors.email} />
              </FieldWrap>

              <FieldWrap label="Phone Number" error={errors.phone?.message} required>
                <FieldInput type="tel" placeholder="0412 345 678" icon={<Phone size={15} />} {...register("phone")} hasError={!!errors.phone} />
              </FieldWrap>

              <FieldWrap label="Specialization" error={errors.specialization?.message}>
                <FieldInput placeholder="e.g. Fades & Classic Cuts" {...register("specialization")} hasError={!!errors.specialization} />
              </FieldWrap>

              <FieldWrap label="Bio" error={errors.bio?.message}>
                <textarea
                  placeholder="Short bio — shown on booking page..."
                  rows={3}
                  className="w-full rounded-lg text-sm px-4 py-2.5 resize-none transition-all"
                  style={{
                    backgroundColor: "#FAF8F3",
                    border: "1px solid #E8E4DA",
                    color: "#1B3163",
                  }}
                  {...register("bio")}
                />
              </FieldWrap>
            </FormSection>

            {/* ── Section 2: Role & Access ─────────────── */}
            <FormSection icon={<Briefcase size={15} />} title="Role & Access">

              {/* Role cards */}
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {ROLES.map((role) => (
                      <label
                        key={role}
                        className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={{
                          border: `1.5px solid ${field.value === role ? "#1B3163" : "#E8E4DA"}`,
                          backgroundColor: field.value === role ? "#EEF1F8" : "#FAF8F3",
                        }}
                      >
                        <input
                          type="radio"
                          className="mt-0.5 accent-[#1B3163]"
                          value={role}
                          checked={field.value === role}
                          onChange={() => field.onChange(role)}
                        />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "#1B3163" }}>
                            {ROLE_LABELS[role]}
                          </p>
                          <p className="text-xs mt-0.5 leading-snug" style={{ color: "#6B7280" }}>
                            {ROLE_DESCRIPTIONS[role]}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              />

              {/* Status */}
              <FieldWrap label="Status" error={errors.status?.message} required>
                <FieldSelect {...register("status")} hasError={!!errors.status}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </FieldSelect>
              </FieldWrap>

              {/* Start date */}
              <FieldWrap label="Start Date" error={errors.startDate?.message} required>
                <FieldInput type="date" icon={<Calendar size={15} />} {...register("startDate")} hasError={!!errors.startDate} />
              </FieldWrap>
            </FormSection>

            {/* ── Section 3: Services ──────────────────── */}
            <FormSection icon={<Briefcase size={15} />} title="Services Offered">
              {errors.services && (
                <p className="text-xs text-red-500 mb-2">⚠ {errors.services.message}</p>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {ALL_SERVICES.map((service) => {
                  const checked = (watchedServices ?? []).includes(service);
                  return (
                    <label
                      key={service}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                        style={{
                          border: `1.5px solid ${checked ? "#1B3163" : "#D1D5DB"}`,
                          backgroundColor: checked ? "#1B3163" : "transparent",
                        }}
                        onClick={() => toggleService(service)}
                      >
                        {checked && (
                          <svg width="9" height="9" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span
                        className="text-xs leading-tight"
                        style={{ color: checked ? "#1B3163" : "#6B7A99" }}
                        onClick={() => toggleService(service)}
                      >
                        {service}
                      </span>
                    </label>
                  );
                })}
              </div>
            </FormSection>

            {/* ── Section 4: Pay ───────────────────────── */}
            <FormSection icon={<DollarSign size={15} />} title="Pay Structure">

              <FieldWrap label="Pay Type" error={errors.commissionType?.message} required>
                <FieldSelect {...register("commissionType")} hasError={!!errors.commissionType}>
                  {PAY_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </FieldSelect>
              </FieldWrap>

              {watchedCommissionType !== "salary" && (
                <FieldWrap
                  label={watchedCommissionType === "hourly" ? "Hourly Rate ($)" : "Commission (%)"}
                  error={errors.commissionRate?.message}
                >
                  <FieldInput
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={watchedCommissionType === "hourly" ? "e.g. 28" : "e.g. 45"}
                    icon={watchedCommissionType === "hourly" ? <DollarSign size={15} /> : undefined}
                    {...register("commissionRate", { valueAsNumber: true })}
                    hasError={!!errors.commissionRate}
                  />
                </FieldWrap>
              )}
            </FormSection>

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
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: "#F0EEE6", color: "#1B3163", border: "1px solid #E8E4DA" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="staff-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "#D5B584", color: "#1B3163" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1B3163"; (e.currentTarget as HTMLButtonElement).style.color = "#EAEAEA"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#D5B584"; (e.currentTarget as HTMLButtonElement).style.color = "#1B3163"; }}
          >
            {isSubmitting ? "Saving…" : editing ? "Save Changes" : "Add Staff Member"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Reusable micro-components scoped to this file ── */

function FormSection({
  icon, title, children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-5 space-y-4" style={{ borderBottom: "1px solid #F0EEE6" }}>
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: "#1B3163" }}>{icon}</span>
        <h3 className="text-sm font-semibold" style={{ color: "#1B3163" }}>
          {title}
        </h3>
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
      <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "#6B7280" }}>
        {label}{required && <span className="text-[#D5B584] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

import React from "react";

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  icon?: React.ReactNode;
}

const FieldInput = React.forwardRef<HTMLInputElement, FieldInputProps>(
  ({ hasError, icon, className, ...props }, ref) => (
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-3 pointer-events-none" style={{ color: "#9FB2D9" }}>
          {icon}
        </span>
      )}
      <input
        ref={ref}
        className={cn("w-full rounded-lg text-sm py-2.5 transition-all", className)}
        style={{
          paddingLeft: icon ? "2.25rem" : "1rem",
          paddingRight: "1rem",
          backgroundColor: "#FAF8F3",
          border: `1px solid ${hasError ? "#EF4444" : "#E8E4DA"}`,
          color: "#1B3163",
          outline: "none",
        }}
        onFocus={(e) => { e.currentTarget.style.border = "1px solid #1B3163"; e.currentTarget.style.backgroundColor = "white"; }}
        onBlur={(e) => { e.currentTarget.style.border = `1px solid ${hasError ? "#EF4444" : "#E8E4DA"}`; e.currentTarget.style.backgroundColor = "#FAF8F3"; }}
        {...props}
      />
    </div>
  )
);
FieldInput.displayName = "FieldInput";

interface FieldSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

const FieldSelect = React.forwardRef<HTMLSelectElement, FieldSelectProps>(
  ({ hasError, children, ...props }, ref) => (
    <select
      ref={ref}
      className="w-full rounded-lg text-sm py-2.5 px-4 appearance-none transition-all"
      style={{
        backgroundColor: "#FAF8F3",
        border: `1px solid ${hasError ? "#EF4444" : "#E8E4DA"}`,
        color: "#1B3163",
        outline: "none",
      }}
      {...props}
    >
      {children}
    </select>
  )
);
FieldSelect.displayName = "FieldSelect";
