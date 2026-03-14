import { AlertCircle, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import type { AppointmentRecord } from "@/types/visits";

interface VisitsStatsProps {
  appointments: AppointmentRecord[];
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function localDate(isoUtc: string): string {
  return new Date(isoUtc).toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

export function VisitsStats({ appointments }: VisitsStatsProps) {
  const today = todayStr();

  const pending = appointments.filter((a) => a.status === "pending").length;

  const completedToday = appointments.filter(
    (a) => a.status === "completed" && localDate(a.scheduledAt) === today
  ).length;

  // No-shows in the past 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const noShowsWeek = appointments.filter(
    (a) => a.status === "no_show" && localDate(a.scheduledAt) >= sevenDaysAgo
  ).length;

  // Completion rate (of all reviewed = completed + no_show)
  const reviewed = appointments.filter(
    (a) => a.status === "completed" || a.status === "no_show"
  ).length;
  const completedAll = appointments.filter((a) => a.status === "completed").length;
  const rate = reviewed > 0 ? Math.round((completedAll / reviewed) * 100) : 0;

  const stats = [
    {
      label: "Needs Review",
      value: pending,
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      urgent: pending > 0,
    },
    {
      label: "Attended Today",
      value: completedToday,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      urgent: false,
    },
    {
      label: "No-shows (7 days)",
      value: noShowsWeek,
      icon: XCircle,
      color: "text-rose-500",
      bg: "bg-rose-50",
      urgent: false,
    },
    {
      label: "Attendance Rate",
      value: `${rate}%`,
      icon: TrendingUp,
      color: "text-[#1B3163]",
      bg: "bg-[#EEF1F8]",
      urgent: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${
            s.urgent ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-100"
          }`}
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
