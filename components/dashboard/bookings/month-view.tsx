"use client";

import { useMemo } from "react";
import { BookingPill } from "./booking-block";
import type { Booking } from "@/types/booking";
import {
  monthStart, monthEnd, weekStart, eachDay,
  isSameDay, formatMonthYear,
} from "@/lib/utils/booking-slots";
import { cn } from "@/lib/utils/cn";

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface MonthViewProps {
  currentDate: Date;
  bookings:    Booking[];
  onDayClick:  (date: Date) => void;
  onBooking:   (booking: Booking) => void;
}

export function MonthView({ currentDate, bookings, onDayClick, onBooking }: MonthViewProps) {
  const today = new Date();

  const gridDays = useMemo(() => {
    const first  = monthStart(currentDate);
    const last   = monthEnd(currentDate);
    const start  = weekStart(first);
    // End on the Sunday of the last week
    const endRaw = weekStart(last);
    endRaw.setDate(endRaw.getDate() + 6);
    return eachDay(start, endRaw);
  }, [currentDate]);

  function dayBookings(day: Date) {
    return bookings.filter((b) => isSameDay(new Date(b.startAt), day));
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Month heading */}
      <div className="px-4 py-2 text-sm font-semibold text-gray-700">
        {formatMonthYear(currentDate)}
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {gridDays.map((day) => {
          const dBks     = dayBookings(day);
          const isToday  = isSameDay(day, today);
          const isCurMon = day.getMonth() === currentDate.getMonth();
          const visible  = dBks.slice(0, 2);
          const extra    = dBks.length - visible.length;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                "relative flex flex-col border-b border-r border-gray-50 p-1.5 min-h-[80px] text-left",
                "hover:bg-gray-50/80 transition-colors",
                !isCurMon && "bg-gray-50/40"
              )}
            >
              {/* Day number */}
              <span
                className={cn(
                  "inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold mb-1 self-end",
                  isToday
                    ? "bg-[#1B3163] text-white"
                    : isCurMon
                    ? "text-gray-800"
                    : "text-gray-400"
                )}
              >
                {day.getDate()}
              </span>

              {/* Booking pills */}
              <div className="flex flex-col gap-0.5 w-full">
                {visible.map((b) => (
                  <BookingPill key={b.id} booking={b} onClick={onBooking} />
                ))}
                {extra > 0 && (
                  <p className="text-[10px] text-gray-400 pl-1">+{extra} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
