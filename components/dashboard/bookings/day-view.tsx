"use client";

import { useMemo } from "react";
import { BookingBlock } from "./booking-block";
import type { Booking } from "@/types/booking";
import {
  isSameDay, layoutBookings, formatShortDate,
  HOUR_HEIGHT, DAY_START, DAY_END,
} from "@/lib/utils/booking-slots";
import { cn } from "@/lib/utils/cn";

const HOURS        = Array.from({ length: DAY_END - DAY_START }, (_, i) => i + DAY_START);
const TOTAL_HEIGHT = HOURS.length * HOUR_HEIGHT;

function formatHourLabel(h: number) {
  if (h === 0 || h === 12) return h === 0 ? "12 AM" : "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

interface DayViewProps {
  date:      Date;
  bookings:  Booking[];
  onBooking: (booking: Booking) => void;
}

export function DayView({ date, bookings, onBooking }: DayViewProps) {
  const today   = new Date();
  const isToday = isSameDay(date, today);

  const dayBks = useMemo(
    () => bookings.filter((b) => isSameDay(new Date(b.startAt), date)),
    [bookings, date]
  );
  const laid = useMemo(() => layoutBookings(dayBks), [dayBks]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Day header ── */}
      <div
        className={cn(
          "px-4 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0",
          isToday && "bg-[#EEF1F8]"
        )}
      >
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0",
            isToday ? "bg-[#1B3163] text-white" : "bg-gray-100 text-gray-700"
          )}
        >
          <span className="text-[10px] font-bold uppercase tracking-wide leading-none">
            {date.toLocaleDateString("en-AU", { weekday: "short" })}
          </span>
          <span className="text-2xl font-black leading-none">{date.getDate()}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{formatShortDate(date)}</p>
          <p className="text-xs text-gray-500">
            {dayBks.length === 0
              ? "No appointments"
              : `${dayBks.length} appointment${dayBks.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* ── Scrollable time grid ── */}
      <div
        className="flex-1 overflow-y-auto"
        ref={(el) => {
          if (el && el.scrollTop === 0) {
            el.scrollTop = (8 - DAY_START) * HOUR_HEIGHT;
          }
        }}
      >
        <div
          className="grid mx-2 mt-1"
          style={{
            gridTemplateColumns: "52px 1fr",
            height: `${TOTAL_HEIGHT}px`,
            position: "relative",
          }}
        >
          {/* Time labels */}
          <div className="relative">
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

          {/* Event column */}
          <div
            className={cn(
              "relative border-l border-gray-200 rounded-tr-lg",
              isToday && "bg-blue-50/10"
            )}
          >
            {/* Hour lines */}
            {HOURS.map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute inset-x-0 border-t border-gray-100"
                style={{ top: `${i * HOUR_HEIGHT}px` }}
              />
            ))}

            {/* Half-hour lines */}
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

            {dayBks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-gray-300 font-medium select-none">No bookings scheduled</p>
              </div>
            )}
          </div>
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
