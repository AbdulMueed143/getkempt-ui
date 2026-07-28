"use client";

import {
  Check,
  Calendar,
  Clock,
  User,
  MapPin,
  CalendarPlus,
  Sparkles,
} from "lucide-react";
import { formatMoney } from "@/lib/utils/currency";
import { formatDuration } from "@/lib/utils/package-calculations";
import type {
  BusinessPublicProfile,
  PublicBookingResult,
} from "@/types/public-booking";

interface Props {
  business: BusinessPublicProfile;
  result:   PublicBookingResult;
  onBookAnother: () => void;
}

export function StepConfirmation({ business, result, onBookAnother }: Props) {
  const start = new Date(result.startAt);
  const dateStr = start.toLocaleDateString("en-AU", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
  });
  const timeStr = start.toLocaleTimeString("en-AU", {
    hour:   "numeric",
    minute: "2-digit",
  });

  const address = [
    business.address.line1,
    business.address.suburb,
    business.address.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 animate-fade-in-up">
        <Check className="h-8 w-8 text-emerald-600" />
      </div>

      <h2 className="heading-serif text-2xl sm:text-3xl text-ink-900">
        You&apos;re booked in!
      </h2>
      <p className="mt-2 text-sm text-ink-500">
        A confirmation has been sent. Your reference is{" "}
        <span className="font-bold text-ink-900">{result.reference}</span>.
      </p>

      <div className="card-surface mt-6 p-5 text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-4">
          {result.businessName}
        </p>

        <div className="space-y-3.5">
          <Row
            icon={<Sparkles className="h-4 w-4" />}
            label={result.serviceNames.join(" + ")}
            sub={formatDuration(result.durationMinutes)}
          />
          <Row icon={<User className="h-4 w-4" />} label={result.staffName} />
          <Row icon={<Calendar className="h-4 w-4" />} label={dateStr} />
          <Row icon={<Clock className="h-4 w-4" />} label={timeStr} />
          {address && <Row icon={<MapPin className="h-4 w-4" />} label={address} />}
        </div>

        <div className="mt-5 pt-4 border-t border-border-soft space-y-1.5">
          <Line label="Service total" value={formatMoney(result.price, result.currency)} />
          {result.amountPaid > 0 && (
            <Line label="Paid now" value={formatMoney(result.amountPaid, result.currency)} strong />
          )}
          {result.amountDue > 0 && (
            <Line label="Due at appointment" value={formatMoney(result.amountDue, result.currency)} muted />
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <a
          href={googleCalUrl(result, address)}
          target="_blank"
          rel="noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border-soft bg-white px-5 py-3 text-sm font-semibold text-ink-800 hover:border-ink-300 transition-colors"
        >
          <CalendarPlus className="h-4 w-4" />
          Add to calendar
        </a>
        <button
          type="button"
          onClick={onBookAnother}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-royal-indigo px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-hover transition-colors"
        >
          Book another
        </button>
      </div>

      <p className="mt-6 text-xs text-ink-400">
        Need to change or cancel? Contact {business.shopName}
        {business.phone ? ` on ${business.phone}` : ""}.
      </p>
      <p className="mt-2 text-xs text-ink-400">
        {business.cancellation.summary}
      </p>
    </div>
  );
}

function Row({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-subtle text-royal-indigo shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-800">{label}</p>
        {sub && <p className="text-xs text-ink-400">{sub}</p>}
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? "text-ink-400 text-xs" : "text-ink-500"}>{label}</span>
      <span
        className={
          strong
            ? "font-bold text-emerald-600"
            : muted
            ? "text-ink-500 text-xs"
            : "font-semibold text-ink-900"
        }
      >
        {value}
      </span>
    </div>
  );
}

function googleCalUrl(result: PublicBookingResult, location: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action:   "TEMPLATE",
    text:     `${result.serviceNames.join(" + ")} — ${result.businessName}`,
    dates:    `${fmt(result.startAt)}/${fmt(result.endAt)}`,
    details:  `Booking reference: ${result.reference}\nWith: ${result.staffName}`,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
