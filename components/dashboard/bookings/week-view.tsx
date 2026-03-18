"use client";

import { useMemo } from "react";
import { BookingBlock } from "./booking-block";
import type { Booking } from "@/types/booking";
import {
  weekDays, isSameDay, layoutBookings,
  HOUR_HEIGHT, DAY_START, DAY_END,
} from "@/lib/utils/booking-slots";
import { cn } from "@/lib/utils/cn";

const HOURS        = Array.from({ length: DAY_END - DAY_START }, (_, i) => i + DAY_START);
const TOTAL_HEIGHT = HOURS.length * HOUR_HEIGHT;
/* Minimum column width — prevents extreme squishing on narrow screens */
const MIN_COL_PX   = 96;

function formatHourLabel(h: number) {
  if (h === 0 || h === 12) return h === 0 ? "12 AM" : "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

interface WeekViewProps {
  monday:    Date;
  bookings:  Booking[];
  onBooking: (booking: Booking) => void;
}

export function WeekView({ monday, bookings, onBooking }: WeekViewProps) {
  const today = new Date();
  const days  = useMemo(() => weekDays(monday), [monday]);

  /* ── Pre-compute layouts outside any loop (rules of hooks) ── */
  const dayLayouts = useMemo(
    () =>
      days.map((day) => {
        const dayBks = bookings.filter((b) =>
          isSameDay(new Date(b.startAt), day)
        );
        return layoutBookings(dayBks);
      }),
    [days, bookings]
  );

  /* Scroll to 8 AM on first render */
  const initialScrollTop = (8 - DAY_START) * HOUR_HEIGHT;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* ── Day headers (sticky, horizontally scrollable with grid) ── */}
      <div className="overflow-x-auto overflow-y-hidden shrink-0 border-b border-gray-100 bg-white">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `56px repeat(7, minmax(${MIN_COL_PX}px, 1fr))`,
            minWidth: `${56 + 7 * MIN_COL_PX}px`,
          }}
        >
          <div className="h-14" />
          {days.map((day, i) => {
            const isToday      = isSameDay(day, today);
            const bkCount      = dayLayouts[i].length;
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "h-14 flex flex-col items-center justify-center border-l border-gray-100 gap-0.5",
                  isToday && "bg-[#EEF1F8]"
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wide",
                    isToday ? "text-[#1B3163]" : "text-gray-400"
                  )}
                >
                  {day.toLocaleDateString("en-AU", { weekday: "short" })}
                </span>
                <span
                  className={cn(
                    "text-base font-bold leading-none w-8 h-8 flex items-center justify-center rounded-full",
                    isToday
                      ? "bg-[#1B3163] text-white"
                      : "text-gray-800"
                  )}
                >
                  {day.getDate()}
                </span>
                {bkCount > 0 && (
                  <span className="text-[10px] text-gray-400 leading-none">
                    {bkCount} appt{bkCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable time grid ── */}
      <div
        className="flex-1 overflow-auto"
        ref={(el) => {
          if (el && el.scrollTop === 0) el.scrollTop = initialScrollTop;
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `56px repeat(7, minmax(${MIN_COL_PX}px, 1fr))`,
            minWidth: `${56 + 7 * MIN_COL_PX}px`,
            height: `${TOTAL_HEIGHT}px`,
            position: "relative",
          }}
        >
          {/* ── Time gutter ── */}
          <div className="relative" style={{ height: `${TOTAL_HEIGHT}px` }}>
            {HOURS.map((h, i) => (
              <div
                key={h}
                className="absolute right-2 text-[10px] text-gray-400 select-none whitespace-nowrap"
                style={{ top: `${i * HOUR_HEIGHT - 7}px` }}
              >
                {i > 0 ? formatHourLabel(h) : ""}
              </div>
            ))}
          </div>

          {/* ── Day columns ── */}
          {days.map((day, dayIdx) => {
            const isToday = isSameDay(day, today);
            const laid    = dayLayouts[dayIdx];

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative border-l border-gray-100",
                  isToday && "bg-blue-50/20"
                )}
                style={{ height: `${TOTAL_HEIGHT}px` }}
              >
                {/* Hour lines */}
                {HOURS.map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute inset-x-0 border-t border-gray-100"
                    style={{ top: `${i * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Half-hour lines (lighter) */}
                {HOURS.map((_, i) => (
                  <div
                    key={`hh-${i}`}
                    className="absolute inset-x-0 border-t border-gray-50"
                    style={{ top: `${i * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
                  />
                ))}

                {/* Current time indicator */}
                {isToday && <CurrentTimeLine />}

                {/* Booking blocks */}
                {laid.map(({ booking, lane, totalLanes }) => (
                  <BookingBlock
                    key={booking.id}
                    booking={booking}
                    lane={lane}
                    totalLanes={totalLanes}
                    onClick={onBooking}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Current time red line ───────────────────────────────────── */
function CurrentTimeLine() {
  const now  = new Date();
  const mins = now.getHours() * 60 + now.getMinutes() - DAY_START * 60;
  if (mins < 0 || mins > (DAY_END - DAY_START) * 60) return null;
  const top = (mins * HOUR_HEIGHT) / 60;

  return (
    <div
      className="absolute inset-x-0 z-20 flex items-center pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-1.5 shrink-0 shadow-sm" />
      <div className="flex-1 border-t-2 border-rose-400" />
    </div>
  );
}
