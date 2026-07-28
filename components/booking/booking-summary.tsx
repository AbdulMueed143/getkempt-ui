"use client";

import { Calendar, Clock, Scissors, Package as PackageIcon, User } from "lucide-react";
import { formatMoney } from "@/lib/utils/currency";
import { formatDuration } from "@/lib/utils/package-calculations";
import { minsToDisplay } from "@/lib/utils/booking-slots";
import type {
  BusinessPublicProfile,
  BookingSelection,
} from "@/types/public-booking";

interface Props {
  business:      BusinessPublicProfile;
  selections:    BookingSelection[];
  staffName:     string | null;   // null → "Any available"
  staffChosen:   boolean;
  date:          string;          // YYYY-MM-DD
  startTime:     string;          // HH:MM
  amountDueNow:  number;
}

function prettyDate(date: string): string {
  if (!date) return "";
  return new Date(date + "T12:00:00").toLocaleDateString("en-AU", {
    weekday: "short",
    day:     "numeric",
    month:   "long",
  });
}

export function BookingSummary({
  business,
  selections,
  staffName,
  staffChosen,
  date,
  startTime,
  amountDueNow,
}: Props) {
  const currency = business.payments.currency;
  const price = selections.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selections.reduce((sum, s) => sum + s.durationMinutes, 0);
  const payLater = Math.max(0, price - amountDueNow);
  const hasItems = selections.length > 0;

  return (
    <div className="card-surface p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-4">
        Your appointment
      </p>

      {!hasItems ? (
        <p className="text-sm text-ink-400 py-6 text-center">
          Add a service to get started.
        </p>
      ) : (
        <div className="space-y-3.5">
          {selections.map((sel) => (
            <Row
              key={`${sel.kind}-${sel.id}`}
              icon={
                sel.kind === "package" ? (
                  <PackageIcon className="h-4 w-4" />
                ) : (
                  <Scissors className="h-4 w-4" />
                )
              }
              label={sel.name}
              sub={formatDuration(sel.durationMinutes)}
              trailing={formatMoney(sel.price, currency)}
            />
          ))}

          {selections.length > 1 && (
            <div className="flex items-center gap-2 pl-10 text-xs text-ink-400">
              <Clock className="h-3 w-3" />
              {formatDuration(totalDuration)} total
            </div>
          )}

          {staffChosen && (
            <Row
              icon={<User className="h-4 w-4" />}
              label={staffName ?? "Any available professional"}
            />
          )}

          {date && (
            <Row icon={<Calendar className="h-4 w-4" />} label={prettyDate(date)} />
          )}

          {startTime && (
            <Row
              icon={<Clock className="h-4 w-4" />}
              label={minsToDisplay(
                parseInt(startTime.split(":")[0]) * 60 +
                  parseInt(startTime.split(":")[1])
              )}
            />
          )}
        </div>
      )}

      {hasItems && (
        <div className="mt-5 pt-4 border-t border-border-soft space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Total</span>
            <span className="font-semibold text-ink-900">
              {formatMoney(price, currency)}
            </span>
          </div>

          {business.payments.enabled && amountDueNow > 0 && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">Due now</span>
                <span className="font-bold text-royal-indigo">
                  {formatMoney(amountDueNow, currency)}
                </span>
              </div>
              {payLater > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-400">Pay at appointment</span>
                  <span className="text-ink-500">
                    {formatMoney(payLater, currency)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  sub,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  trailing?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-subtle text-royal-indigo shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink-800 leading-snug">{label}</p>
        {sub && <p className="text-xs text-ink-400">{sub}</p>}
      </div>
      {trailing && (
        <span className="text-sm font-semibold text-ink-700 shrink-0">{trailing}</span>
      )}
    </div>
  );
}
