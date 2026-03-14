import { Users, CalendarCheck, CalendarX, RefreshCw } from "lucide-react";
import type { WeeklySchedule, AvailabilityOverride, DayOfWeek } from "@/types/availability";

interface AvailabilityStatsProps {
  schedules: WeeklySchedule[];
  overrides: AvailabilityOverride[];
}

function todayDow(): DayOfWeek {
  return new Date().getDay() as DayOfWeek;
}

function countWorkingToday(schedules: WeeklySchedule[], overrides: AvailabilityOverride[]): number {
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
      label: "Working Today",
      value: working,
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Off Today",
      value: offToday,
      icon: CalendarX,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      label: "Upcoming Overrides",
      value: upcomingOverrides,
      icon: RefreshCw,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Total Shifts / Week",
      value: totalSlots,
      icon: Users,
      color: "text-[#1B3163]",
      bg: "bg-[#EEF1F8]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4"
        >
          <div className={`${s.bg} p-3 rounded-lg shrink-0`}>
            <s.icon className={`w-5 h-5 ${s.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
