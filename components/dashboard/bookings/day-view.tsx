"use client";

import { useMemo } from "react";
import {
  Clock, User, Scissors, DollarSign,
  Sun, Sunset, Moon, Coffee as CoffeeIcon,
  CheckCircle2,
} from "lucide-react";
import type { Booking } from "@/types/booking";
import {
  STAFF_CAL_COLORS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
} from "@/types/booking";
import { isSameDay, formatShortDate } from "@/lib/utils/booking-slots";
import { cn } from "@/lib/utils/cn";

/* ── Time period helpers ─────────────────────────────────────── */
type Period = "morning" | "afternoon" | "evening";

function getPeriod(date: Date): Period {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

const PERIOD_META: Record<Period, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  morning:   { label: "Morning",   icon: Sun,    color: "#D97706", bg: "#FEF3C7" },
  afternoon: { label: "Afternoon", icon: Sunset, color: "#C4A882", bg: "#F5F3EE" },
  evening:   { label: "Evening",   icon: Moon,   color: "#6366F1", bg: "#EEF2FF" },
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/* ── Props ───────────────────────────────────────────────────── */
interface DayViewProps {
  date:      Date;
  bookings:  Booking[];
  onBooking: (booking: Booking) => void;
}

export function DayView({ date, bookings, onBooking }: DayViewProps) {
  const today   = new Date();
  const isToday = isSameDay(date, today);

  /* Filter bookings for this day, sorted by start time */
  const dayBks = useMemo(
    () =>
      bookings
        .filter((b) => isSameDay(new Date(b.startAt), date))
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    [bookings, date]
  );

  /* Group by period */
  const grouped = useMemo(() => {
    const groups: Record<Period, Booking[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    dayBks.forEach((b) => {
      const period = getPeriod(new Date(b.startAt));
      groups[period].push(b);
    });
    return groups;
  }, [dayBks]);

  /* Stats */
  const confirmed = dayBks.filter((b) => b.status === "confirmed").length;
  const completed = dayBks.filter((b) => b.status === "completed").length;
  const cancelled = dayBks.filter((b) => b.status === "cancelled").length;
  const totalRevenue = dayBks
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.price, 0);

  /* Current time for "now" indicator */
  const nowMins = isToday ? today.getHours() * 60 + today.getMinutes() : -1;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Day header with stats ── */}
      <div className={cn(
        "px-4 py-3 border-b border-[#E8E4DA] shrink-0",
        isToday && "bg-[#FDFCFA]"
      )}>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0",
              isToday ? "bg-[#0D1B2A] text-white" : "bg-[#F5F3EE] text-[#0D1B2A]"
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide leading-none">
              {date.toLocaleDateString("en-AU", { weekday: "short" })}
            </span>
            <span className="text-2xl font-black leading-none">{date.getDate()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#0D1B2A]">{formatShortDate(date)}</p>
            <p className="text-xs text-[#6B7280]">
              {dayBks.length === 0
                ? "No appointments"
                : `${dayBks.length} appointment${dayBks.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Quick stats row */}
        {dayBks.length > 0 && (
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <StatPill icon={CheckCircle2} label={`${confirmed} upcoming`} color="#0D1B2A" bg="#E8E4DA" />
            <StatPill icon={CheckCircle2} label={`${completed} done`} color="#16A34A" bg="#DCFCE7" />
            {cancelled > 0 && (
              <StatPill icon={CheckCircle2} label={`${cancelled} cancelled`} color="#DC2626" bg="#FEE2E2" />
            )}
            <div className="ml-auto">
              <span className="text-xs font-bold text-[#0D1B2A]">
                ${totalRevenue.toFixed(0)}
              </span>
              <span className="text-[10px] text-[#6B7280] ml-1">revenue</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Scrollable timeline ── */}
      <div className="flex-1 overflow-y-auto">
        {dayBks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F5F3EE] flex items-center justify-center mb-4">
              <CoffeeIcon className="w-8 h-8 text-[#C4A882]" />
            </div>
            <p className="text-base font-semibold text-[#0D1B2A]">No bookings scheduled</p>
            <p className="text-sm text-[#6B7280] mt-1 text-center">
              This day is free. Tap &ldquo;New Booking&rdquo; to add one.
            </p>
          </div>
        ) : (
          <div className="px-3 py-3 space-y-1">
            {(["morning", "afternoon", "evening"] as Period[]).map((period) => {
              const bks = grouped[period];
              if (bks.length === 0) return null;

              const meta = PERIOD_META[period];
              const PeriodIcon = meta.icon;

              return (
                <div key={period} className="mb-2">
                  {/* Period header */}
                  <div className="flex items-center gap-2 px-1 py-2 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: meta.bg, color: meta.color }}
                    >
                      <PeriodIcon size={14} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-[#6B7280]">
                      {bks.length} booking{bks.length !== 1 ? "s" : ""}
                    </span>
                    <div className="flex-1 border-t border-dashed border-[#E8E4DA] ml-2" />
                  </div>

                  {/* Booking cards */}
                  <div className="space-y-2 pl-1">
                    {bks.map((booking, idx) => {
                      const startDate = new Date(booking.startAt);
                      const endDate   = new Date(booking.endAt);
                      const startMins = startDate.getHours() * 60 + startDate.getMinutes();
                      const endMins   = endDate.getHours() * 60 + endDate.getMinutes();

                      /* Is this booking happening right now? */
                      const isNow = isToday && nowMins >= startMins && nowMins < endMins;
                      /* Has this booking's time passed? */
                      const isPast = isToday && nowMins >= endMins;

                      const color = STAFF_CAL_COLORS[booking.staffId] ?? "#0D1B2A";
                      const statusStyle = BOOKING_STATUS_STYLES[booking.status];
                      const isCancelled = booking.status === "cancelled";
                      const isNoShow = booking.status === "no_show";

                      /* Show "now" indicator before the current booking */
                      const prevEnd = idx > 0
                        ? new Date(bks[idx - 1].endAt).getHours() * 60 + new Date(bks[idx - 1].endAt).getMinutes()
                        : 0;
                      const showNowBefore = isToday && idx === 0
                        ? nowMins < startMins
                        : isToday && nowMins >= prevEnd && nowMins < startMins;

                      return (
                        <div key={booking.id}>
                          {/* Now indicator */}
                          {showNowBefore && (
                            <div className="flex items-center gap-2 py-1 px-1">
                              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm animate-pulse" />
                              <div className="flex-1 border-t-2 border-rose-400" />
                              <span className="text-[10px] font-bold text-rose-500">NOW</span>
                            </div>
                          )}

                          {/* Booking card */}
                          <button
                            type="button"
                            onClick={() => onBooking(booking)}
                            className={cn(
                              "w-full text-left rounded-xl border transition-all duration-200",
                              "hover:shadow-md active:scale-[0.99]",
                              isNow
                                ? "border-[#C4A882] bg-[#FDFCFA] shadow-sm ring-1 ring-[#C4A882]/30"
                                : "border-[#E8E4DA] bg-white",
                              (isCancelled || isNoShow) && "opacity-60",
                              isPast && !isNow && "opacity-75"
                            )}
                          >
                            <div className="flex">
                              {/* Left time column */}
                              <div className="w-16 sm:w-20 shrink-0 flex flex-col items-center justify-center py-3 border-r border-[#F0EEE6]">
                                <span className="text-xs font-bold text-[#0D1B2A]">
                                  {formatTime(startDate)}
                                </span>
                                <span className="text-[10px] text-[#6B7280] mt-0.5">
                                  {booking.durationMinutes}m
                                </span>
                              </div>

                              {/* Staff color indicator */}
                              <div
                                className="w-1 shrink-0"
                                style={{ backgroundColor: color }}
                              />

                              {/* Main content */}
                              <div className="flex-1 min-w-0 px-3 py-2.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className={cn(
                                      "text-sm font-semibold truncate",
                                      isCancelled ? "line-through text-[#6B7280]" : "text-[#0D1B2A]"
                                    )}>
                                      {booking.clientName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      <span className="flex items-center gap-1 text-[11px] text-[#6B7A99]">
                                        <Scissors size={10} className="text-[#9FB2D9]" />
                                        {booking.serviceName}
                                      </span>
                                      <span className="text-[10px] text-[#6B7280]">·</span>
                                      <span className="flex items-center gap-1 text-[11px] text-[#6B7A99]">
                                        <User size={10} className="text-[#9FB2D9]" />
                                        {booking.staffName.split(" ")[0]}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Right side: price + status */}
                                  <div className="flex flex-col items-end gap-1 shrink-0">
                                    <span className="text-sm font-bold text-[#0D1B2A]">
                                      ${booking.price}
                                    </span>
                                    <span
                                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border"
                                      style={{
                                        color: statusStyle.text,
                                        backgroundColor: statusStyle.bg,
                                        borderColor: statusStyle.border,
                                      }}
                                    >
                                      {BOOKING_STATUS_LABELS[booking.status]}
                                    </span>
                                  </div>
                                </div>

                                {/* Notes preview */}
                                {booking.notes && (
                                  <p className="text-[10px] text-[#6B7280] mt-1 truncate italic">
                                    &ldquo;{booking.notes}&rdquo;
                                  </p>
                                )}

                                {/* Now badge */}
                                {isNow && (
                                  <div className="flex items-center gap-1 mt-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C4A882] animate-pulse" />
                                    <span className="text-[10px] font-bold text-[#C4A882]">In progress</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Now indicator at the end if all bookings are past */}
            {isToday && dayBks.length > 0 && (() => {
              const lastEnd = new Date(dayBks[dayBks.length - 1].endAt);
              const lastEndMins = lastEnd.getHours() * 60 + lastEnd.getMinutes();
              if (nowMins >= lastEndMins) {
                return (
                  <div className="flex items-center gap-2 py-2 px-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm animate-pulse" />
                    <div className="flex-1 border-t-2 border-rose-400" />
                    <span className="text-[10px] font-bold text-rose-500">NOW</span>
                  </div>
                );
              }
              return null;
            })()}

            {/* End of day summary */}
            <div className="text-center py-6 mt-2">
              <p className="text-xs text-[#6B7280]">
                {formatTime(new Date(dayBks[0].startAt))} — {formatTime(new Date(dayBks[dayBks.length - 1].endAt))}
              </p>
              <p className="text-[10px] text-[#C4C9D4] mt-0.5">
                {dayBks.length} bookings · ${totalRevenue.toFixed(0)} total
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Small stat pill ─────────────────────────────────────────── */
function StatPill({
  icon: Icon,
  label,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <span
      className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color, backgroundColor: bg }}
    >
      <Icon size={10} />
      {label}
    </span>
  );
}
