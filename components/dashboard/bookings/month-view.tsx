"use client";

import { useMemo } from "react";
import type { Booking } from "@/types/booking";
import { STAFF_CAL_COLORS } from "@/types/booking";
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

/* Heat map background based on booking count */
function heatBg(count: number): string {
  if (count === 0) return "transparent";
  if (count <= 2)  return "#F4F2EE";
  if (count <= 4)  return "#E8E2D8";
  if (count <= 6)  return "#D9CEBD";
  return "#C4A882";
}

function heatText(count: number, isCurMonth: boolean): string {
  if (!isCurMonth) return "#C4C9D4";
  if (count >= 6) return "#FFFFFF";
  return "#0D1B2A";
}

export function MonthView({ currentDate, bookings, onDayClick, onBooking }: MonthViewProps) {
  const today = new Date();

  const gridDays = useMemo(() => {
    const first  = monthStart(currentDate);
    const last   = monthEnd(currentDate);
    const start  = weekStart(first);
    const endRaw = weekStart(last);
    endRaw.setDate(endRaw.getDate() + 6);
    return eachDay(start, endRaw);
  }, [currentDate]);

  /* Pre-compute day data */
  const dayDataMap = useMemo(() => {
    const map = new Map<string, { bookings: Booking[]; revenue: number }>();
    gridDays.forEach((day) => {
      const key = day.toISOString();
      const dayBks = bookings
        .filter((b) => isSameDay(new Date(b.startAt), day))
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      const revenue = dayBks
        .filter((b) => b.status !== "cancelled")
        .reduce((sum, b) => sum + b.price, 0);
      map.set(key, { bookings: dayBks, revenue });
    });
    return map;
  }, [gridDays, bookings]);

  /* Month totals */
  const monthBks = bookings.filter((b) => {
    const d = new Date(b.startAt);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });
  const monthRevenue = monthBks
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.price, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Month summary header ── */}
      <div className="px-4 py-2.5 border-b border-[#E8ECF4] shrink-0 bg-[#FDFCFA] flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-[#0D1B2A]">{formatMonthYear(currentDate)}</p>
          <p className="text-[10px] text-[#8E95A5]">{monthBks.length} bookings</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[#0D1B2A]">${monthRevenue}</p>
          <p className="text-[10px] text-[#8E95A5]">revenue</p>
        </div>
      </div>

      {/* ── Heat map legend ── */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-[#F0F3FA] shrink-0">
        <span className="text-[9px] text-[#8E95A5]">Less</span>
        {[0, 2, 4, 6, 8].map((n) => (
          <div
            key={n}
            className="w-3 h-3 rounded-sm border border-[#E8ECF4]"
            style={{ backgroundColor: heatBg(n) }}
          />
        ))}
        <span className="text-[9px] text-[#8E95A5]">More</span>
        <span className="text-[9px] text-[#C4C9D4] ml-auto">Tap a day to view details</span>
      </div>

      {/* ── Day-of-week headers ── */}
      <div className="grid grid-cols-7 border-b border-[#E8ECF4] shrink-0">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="py-1.5 text-center text-[10px] font-bold text-[#8E95A5] uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* ── Day cells grid ── */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
        {gridDays.map((day) => {
          const key = day.toISOString();
          const data = dayDataMap.get(key) ?? { bookings: [], revenue: 0 };
          const dBks     = data.bookings;
          const revenue  = data.revenue;
          const isToday  = isSameDay(day, today);
          const isCurMon = day.getMonth() === currentDate.getMonth();
          const count    = dBks.length;

          /* Unique staff colors for dots */
          const staffColors = [...new Set(dBks.map((b) => b.staffId))]
            .slice(0, 5)
            .map((sid) => STAFF_CAL_COLORS[sid] ?? "#0D1B2A");

          return (
            <button
              key={key}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                "relative flex flex-col border-b border-r border-[#F0F3FA] p-1 min-h-[72px] text-left transition-all",
                "hover:ring-1 hover:ring-[#C4A882]/40 hover:z-10",
                !isCurMon && "opacity-40",
                isToday && "ring-2 ring-[#C4A882] z-10"
              )}
              style={{ backgroundColor: isCurMon ? heatBg(count) : undefined }}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={cn(
                    "inline-flex w-6 h-6 items-center justify-center rounded-full text-[11px] font-bold",
                    isToday
                      ? "bg-[#0D1B2A] text-white"
                      : ""
                  )}
                  style={{ color: isToday ? undefined : heatText(count, isCurMon) }}
                >
                  {day.getDate()}
                </span>

                {/* Booking count badge */}
                {count > 0 && isCurMon && (
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1 py-0.5 rounded",
                      count >= 6 ? "text-white/90" : "text-[#0D1B2A]/60"
                    )}
                  >
                    {count}
                  </span>
                )}
              </div>

              {/* Staff color dots — shows which staff have bookings */}
              {staffColors.length > 0 && isCurMon && (
                <div className="flex items-center gap-0.5 mt-auto">
                  {staffColors.map((color, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  {dBks.length > 5 && (
                    <span className="text-[8px] text-[#8E95A5] ml-0.5">+</span>
                  )}
                </div>
              )}

              {/* Revenue — shown on desktop for busy days */}
              {revenue > 0 && isCurMon && count >= 2 && (
                <span className={cn(
                  "text-[8px] font-semibold mt-0.5 hidden sm:block",
                  count >= 6 ? "text-white/80" : "text-[#8E95A5]"
                )}>
                  ${revenue}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
