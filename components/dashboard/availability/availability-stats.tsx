import { Users, CalendarCheck, CalendarX, RefreshCw } from "lucide-react";
import type { WeeklySchedule, AvailabilityOverride, DayOfWeek } from "@/types/availability";

interface AvailabilityStatsProps {
  schedules: WeeklySchedule[];
  overrides: AvailabilityOverride[];
}

function todayDow(): DayOfWeek {
  return new Date().getDay() as DayOfWeek;
}

function countWorkingToday(
  schedules: WeeklySchedule[],
  overrides: AvailabilityOverride[],
): number {
  const today = new Date().toISOString().split("T")[0];
  const dow = todayDow();

  return schedules.filter((sched) => {
    const override = overrides.find((o) => o.staffId === sched.staffId && o.date === today);
    if (override) return override.isWorking;
    const daySchedule = sched.days.find((d) => d.dayOfWeek === dow);
    return daySchedule?.isWorking ?? false;
  }).length;
}

function countOffToday(schedules: WeeklySchedule[], overrides: AvailabilityOverride[]): number {
  return schedules.length - countWorkingToday(schedules, overrides);
}

function countUpcomingOverrides(overrides: AvailabilityOverride[]): number {
  const today = new Date().toISOString().split("T")[0];
  return overrides.filter((o) => o.date >= today).length;
}

function countTotalSlotsThisWeek(schedules: WeeklySchedule[]): number {
  return schedules.reduce((sum, s) => {
    return sum + s.days.reduce((d, day) => d + (day.isWorking ? day.slots.length : 0), 0);
  }, 0);
}

export function AvailabilityStats({ schedules, overrides }: AvailabilityStatsProps) {
  const working = countWorkingToday(schedules, overrides);
  const offToday = countOffToday(schedules, overrides);
  const upcomingOverrides = countUpcomingOverrides(overrides);
  const totalSlots = countTotalSlotsThisWeek(schedules);

  const stats = [
    {
      label: "Working today",
      value: working,
      icon: CalendarCheck,
      accent: "text-emerald-700",
      bg: "bg-emerald-50",
      strip: "from-emerald-400 to-emerald-500",
    },
    {
      label: "Off today",
      value: offToday,
      icon: CalendarX,
      accent: "text-rose-600",
      bg: "bg-rose-50",
      strip: "from-rose-300 to-rose-400",
    },
    {
      label: "Upcoming overrides",
      value: upcomingOverrides,
      icon: RefreshCw,
      accent: "text-amber-700",
      bg: "bg-amber-50",
      strip: "from-amber-300 to-amber-500",
    },
    {
      label: "Shifts / week",
      value: totalSlots,
      icon: Users,
      accent: "text-[#1B3163]",
      bg: "bg-[#EEF1F8]",
      strip: "from-[#1B3163] to-[#3955A0]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="relative bg-white rounded-2xl border border-[#E5E2D9] p-3 sm:p-4 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
        >
          {/* Accent strip */}
          <span
            aria-hidden
            className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${s.strip}`}
          />

          <div className="flex items-start gap-3">
            <div className={`${s.bg} p-2 sm:p-2.5 rounded-xl shrink-0`}>
              <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.accent}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] leading-none tabular-nums">
                {s.value}
              </p>
              <p className="text-[11px] sm:text-xs text-[#64748B] mt-1.5 font-medium leading-tight">
                {s.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
