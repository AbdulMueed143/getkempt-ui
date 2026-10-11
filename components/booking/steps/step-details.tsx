"use client";

import { Mail, Phone, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { inputClass, stepTitleClass, stepSubClass } from "./shared";
import type { CustomerDetails } from "@/types/public-booking";

interface Props {
  details:  CustomerDetails;
  onChange: (patch: Partial<CustomerDetails>) => void;
  /** Fields the user has touched, for showing validation errors. */
  showErrors: boolean;
}

export function StepDetails({ details, onChange, showErrors }: Props) {
  const emailInvalid =
    showErrors && details.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email);
  const emailMissing = showErrors && details.email.trim().length === 0;
  const phoneMissing = showErrors && details.phone.trim().length === 0;
  const firstMissing = showErrors && details.firstName.trim().length === 0;

  return (
    <div>
      <h2 className={stepTitleClass}>Your details</h2>
      <p className={stepSubClass}>We&apos;ll send your confirmation and reminders here.</p>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First name" required error={firstMissing}>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
              <input
                value={details.firstName}
                onChange={(e) => onChange({ firstName: e.target.value })}
                placeholder="Sarah"
                className={cn(inputClass(firstMissing), "pl-9")}
                autoComplete="given-name"
              />
            </div>
          </Field>

          <Field label="Last name">
            <input
              value={details.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              placeholder="Johnson"
              className={inputClass()}
              autoComplete="family-name"
            />
          </Field>
        </div>

        <Field
          label="Email"
          required
          error={emailMissing || emailInvalid}
          hint={emailInvalid ? "Enter a valid email address" : undefined}
        >
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
            <input
              type="email"
              value={details.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="sarah@example.com"
              className={cn(inputClass(emailMissing || emailInvalid), "pl-9")}
              autoComplete="email"
            />
          </div>
        </Field>

        <Field label="Mobile number" required error={phoneMissing}>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
            <input
              type="tel"
              value={details.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="04XX XXX XXX"
              className={cn(inputClass(phoneMissing), "pl-9")}
              autoComplete="tel"
            />
          </div>
        </Field>

        <Field label="Notes for the business" optional>
          <div className="relative">
            <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-300" />
            <textarea
              value={details.notes ?? ""}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows={3}
              placeholder="Anything they should know? (allergies, preferences, parking…)"
              className={cn(inputClass(), "pl-9 resize-none")}
            />
          </div>
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  optional,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold text-ink-700">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {optional && <span className="text-ink-300 font-normal">(optional)</span>}
      </label>
      {children}
      {error && hint && <p className="text-xs text-rose-500">{hint}</p>}
    </div>
  );
}
