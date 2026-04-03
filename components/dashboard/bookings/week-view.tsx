"use client";

import { useMemo } from "react";
import {
  CheckCircle2, XCircle,
} from "lucide-react";
import type { Booking } from "@/types/booking";
import {
  STAFF_CAL_COLORS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
} from "@/types/booking";
import {
  weekDays as getWeekDays,
  isSameDay as isSame,
} from "@/lib/utils/booking-slots";
import { cn } from "@/lib/utils/cn";

/* ── Helpers ─────────────────────────────────────────────────── */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface WeekViewProps {
  monday:    Date;
  bookings:  Booking[];
  onBooking: (booking: Booking) => void;
}

export function WeekView({ monday, bookings, onBooking }: WeekViewProps) {
  const today = new Date();
  const days  = useMemo(() => getWeekDays(monday), [monday]);

  /* Pre-compute bookings per day */
  const dayData = useMemo(
    () =>
      days.map((day) => {
        const dayBks = bookings
          .filter((b) => isSame(new Date(b.startAt), day))
          .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

        const confirmed = dayBks.filter((b) => b.status === "confirmed").length;
        const completed = dayBks.filter((b) => b.status === "completed").length;
        const cancelled = dayBks.filter((b) => b.status === "cancelled").length;
        const noShow    = dayBks.filter((b) => b.status === "no_show").length;
        const revenue   = dayBks
          .filter((b) => b.status !== "cancelled")
          .reduce((sum, b) => sum + b.price, 0);

        return { day, bookings: dayBks, confirmed, completed, cancelled, noShow, revenue };
      }),
    [days, bookings]
  );

  /* Week totals */
  const weekTotal = dayData.reduce((sum, d) => sum + d.bookings.length, 0);
  const weekRevenue = dayData.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Week summary header ── */}
      <div className="px-4 py-3 border-b border-[#E8ECF4] shrink-0 bg-[#FDFCFA]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8E95A5]">This week</p>
            <p className="text-lg font-bold text-[#0D1B2A]">{weekTotal} bookings</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8E95A5]">Revenue</p>
            <p className="text-lg font-bold text-[#0D1B2A]">${weekRevenue}</p>
          </div>
        </div>

        {/* Mini day dots — quick visual of busy days */}
        <div className="flex items-end gap-1 mt-3 justify-between">
          {dayData.map(({ day, bookings: bks }) => {
            const isToday = isSame(day, today);
            const height = Math.max(4, Math.min(bks.length * 6, 40));
            return (
              <div key={day.toISOString()} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={cn(
                    "w-full max-w-[32px] rounded-t-md transition-all",
                    isToday ? "bg-[#C4A882]" : bks.length > 0 ? "bg-[#0D1B2A]/20" : "bg-[#E8ECF4]"
                  )}
                  style={{ height: `${height}px` }}
                />
                <span className={cn(
                  "text-[9px] font-bold uppercase",
                  isToday ? "text-[#C4A882]" : "text-[#8E95A5]"
                )}>
                  {day.toLocaleDateString("en-AU", { weekday: "narrow" })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable day cards ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {dayData.map(({ day, bookings: bks, confirmed, completed, cancelled, noShow, revenue }) => {
            const isToday = isSame(day, today);
            const isPast  = day < today && !isToday;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "rounded-xl border transition-all",
                  isToday
                    ? "border-[#C4A882] bg-[#FDFCFA] shadow-sm"
                    : "border-[#E8ECF4] bg-white",
                  isPast && bks.length === 0 && "opacity-50"
                )}
              >
                {/* Day header */}
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 border-b",
                  isToday ? "border-[#C4A882]/20" : "border-[#F0F3FA]"
                )}>
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0",
                      isToday ? "bg-[#0D1B2A] text-white" : "bg-[#F4F2EE] text-[#0D1B2A]"
                    )}
                  >
                    <span className="text-[8px] font-bold uppercase leading-none">
                      {day.toLocaleDateString("en-AU", { weekday: "short" })}
                    </span>
                    <span className="text-lg font-black leading-none">{day.getDate()}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0D1B2A]">
                      {day.toLocaleDateString("en-AU", { weekday: "long", month: "short", day: "numeric" })}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {bks.length === 0 ? (
                        <span className="text-[10px] text-[#8E95A5]">No bookings</span>
                      ) : (
                        <>
                          <span className="text-[10px] text-[#8E95A5]">{bks.length} bookings</span>
                          {confirmed > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-[#0D1B2A]">
                              <CheckCircle2 size={9} />{confirmed}
                            </span>
                          )}
                          {completed > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-emerald-600">
                              <CheckCircle2 size={9} />{completed}
                            </span>
                          )}
                          {noShow > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-rose-500">
                              <XCircle size={9} />{noShow}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {revenue > 0 && (
                    <span className="text-sm font-bold text-[#0D1B2A] shrink-0">${revenue}</span>
                  )}
                </div>

                {/* Booking list — compact pills */}
                {bks.length > 0 && (
                  <div className="px-2 py-1.5 space-y-1">
                    {bks.slice(0, 6).map((booking) => {
                      const color = STAFF_CAL_COLORS[booking.staffId] ?? "#0D1B2A";
                      const statusStyle = BOOKING_STATUS_STYLES[booking.status];
                      const isCancelled = booking.status === "cancelled";

                      return (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => onBooking(booking)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all",
                            "hover:bg-[#F4F2EE] active:scale-[0.99]",
                            isCancelled && "opacity-50"
                          )}
                        >
                          {/* Time */}
                          <span className="text-[10px] font-bold text-[#0D1B2A] w-14 shrink-0 text-right">
                            {formatTime(booking.startAt)}
                          </span>

                          {/* Staff color dot */}
                          <div
                            className="w-1.5 h-6 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-xs font-semibold truncate",
                              isCancelled ? "line-through text-[#8E95A5]" : "text-[#0D1B2A]"
                            )}>
                              {booking.clientName}
                            </p>
                            <p className="text-[10px] text-[#8E95A5] truncate">
                              {booking.serviceName} · {booking.staffName.split(" ")[0]}
                            </p>
                          </div>

                          {/* Price + status */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-bold text-[#0D1B2A]">${booking.price}</span>
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: statusStyle.text }}
                              title={BOOKING_STATUS_LABELS[booking.status]}
                            />
                          </div>
                        </button>
                      );
                    })}

                    {/* Overflow indicator */}
                    {bks.length > 6 && (
                      <p className="text-center text-[10px] text-[#8E95A5] py-1">
                        +{bks.length - 6} more booking{bks.length - 6 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}

                {/* Empty day — subtle message */}
                {bks.length === 0 && (
                  <div className="px-3 py-3 text-center">
                    <p className="text-[10px] text-[#C4C9D4]">Free day</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Week summary footer */}
        <div className="text-center py-4 px-3">
          <p className="text-xs text-[#8E95A5]">
            {weekTotal} bookings · ${weekRevenue} total revenue
          </p>
        </div>
      </div>
    </div>
  );
}
