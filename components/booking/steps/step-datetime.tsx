"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { minsToDisplay, hhmm } from "@/lib/utils/booking-slots";
import { stepTitleClass, stepSubClass } from "./shared";
import type { TimeSlot, DayAvailability } from "@/types/public-booking";

interface Props {
  date:        string;             // YYYY-MM-DD
  startTime:   string;             // HH:MM
  days:        DayAvailability[];  // today → horizon, with availability flags
  daysLoading: boolean;
  slots:       TimeSlot[];
  loading:     boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

function parseYmd(ymd: string): Date {
  return new Date(ymd + "T12:00:00");
}

const TODAY_YMD = () => new Date().toLocaleDateString("en-CA");

export function StepDateTime({
  date,
  startTime,
  days,
  daysLoading,
  slots,
  loading,
  onDateChange,
  onTimeChange,
}: Props) {
  const groups = useMemo(() => {
    const morning:   TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening:   TimeSlot[] = [];
    for (const s of slots) {
      const mins = hhmm(s.time);
      if (mins < 12 * 60) morning.push(s);
      else if (mins < 17 * 60) afternoon.push(s);
      else evening.push(s);
    }
    return { morning, afternoon, evening };
  }, [slots]);

  const hasAny = slots.some((s) => s.available);
  const today = TODAY_YMD();

  return (
    <div>
      <h2 className={stepTitleClass}>Pick a time</h2>
      <p className={stepSubClass}>Select a day, then choose a slot that suits you.</p>

      {/* Day strip — horizontally scrollable, constrained to the card width */}
      <div className="mt-5 -mx-5 sm:-mx-7 px-5 sm:px-7">
        {daysLoading ? (
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[68px] w-14 shrink-0 rounded-xl bg-white border border-border-soft animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {days.map((d) => {
              const dt = parseYmd(d.date);
              const selected = d.date === date;
              const isToday = d.date === today;
              const disabled = !d.available;
              return (
                <button
                  key={d.date}
                  type="button"
                  disabled={disabled}
                  onClick={() => onDateChange(d.date)}
                  className={cn(
                    "flex w-14 shrink-0 flex-col items-center gap-0.5 rounded-xl border-2 py-2.5 transition-all",
                    selected
                      ? "border-royal-indigo bg-royal-indigo text-white"
                      : disabled
                      ? "border-transparent bg-stone-beige/30 text-ink-300 cursor-not-allowed"
                      : "border-border-soft bg-white text-ink-700 hover:border-ink-300"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wide",
                      selected ? "text-white/80" : disabled ? "text-ink-300" : "text-ink-400"
                    )}
                  >
                    {dt.toLocaleDateString("en-AU", { weekday: "short" })}
                  </span>
                  <span className="text-lg font-bold leading-none">{dt.getDate()}</span>
                  <span
                    className={cn(
                      "text-[9px]",
                      selected ? "text-white/70" : "text-ink-300"
                    )}
                  >
                    {isToday ? "Today" : dt.toLocaleDateString("en-AU", { month: "short" })}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Slots */}
      <div className="mt-6">
        {!date ? (
          <EmptyHint text="Select a day above to see available times." />
        ) : loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-xl bg-white border border-border-soft animate-pulse"
              />
            ))}
          </div>
        ) : !hasAny ? (
          <EmptyHint text="No times available on this day. Try another date." />
        ) : (
          <div className="space-y-5">
            <SlotGroup title="Morning"   slots={groups.morning}   selected={startTime} onPick={onTimeChange} />
            <SlotGroup title="Afternoon" slots={groups.afternoon} selected={startTime} onPick={onTimeChange} />
            <SlotGroup title="Evening"   slots={groups.evening}   selected={startTime} onPick={onTimeChange} />
          </div>
        )}
      </div>
    </div>
  );
}

function SlotGroup({
  title,
  slots,
  selected,
  onPick,
}: {
  title: string;
  slots: TimeSlot[];
  selected: string;
  onPick: (time: string) => void;
}) {
  if (slots.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2.5">
        {title}
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((s) => (
          <button
            key={s.time}
            type="button"
            disabled={!s.available}
            onClick={() => onPick(s.time)}
            className={cn(
              "py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
              selected === s.time
                ? "border-royal-indigo bg-royal-indigo text-white"
                : s.available
                ? "border-border-soft bg-white text-ink-700 hover:border-royal-indigo hover:text-royal-indigo"
                : "border-transparent bg-stone-beige/40 text-ink-300 cursor-not-allowed line-through"
            )}
          >
            {minsToDisplay(hhmm(s.time))}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <CalendarDays className="h-6 w-6 text-ink-300" />
      <p className="text-sm text-ink-400">{text}</p>
    </div>
  );
}
