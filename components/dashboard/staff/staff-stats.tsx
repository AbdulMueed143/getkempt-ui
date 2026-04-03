import { Users, UserCheck, Coffee, UserX } from "lucide-react";
import type { StaffMember } from "@/types/staff";

interface StaffStatsProps {
  staff: StaffMember[];
}

export function StaffStats({ staff }: StaffStatsProps) {
  const total    = staff.length;
  const active   = staff.filter((s) => s.status === "active").length;
  const onLeave  = staff.filter((s) => s.status === "on_leave").length;
  const inactive = staff.filter((s) => s.status === "inactive").length;

  const stats = [
    {
      label: "Total Members",
      value: total,
      icon: Users,
      accentColor: "#0D1B2A",
      accentBg: "#E8ECF4",
    },
    {
      label: "Active",
      value: active,
      icon: UserCheck,
      accentColor: "#16A34A",
      accentBg: "#DCFCE7",
    },
    {
      label: "On Leave",
      value: onLeave,
      icon: Coffee,
      accentColor: "#D97706",
      accentBg: "#FEF3C7",
    },
    {
      label: "Inactive",
      value: inactive,
      icon: UserX,
      accentColor: "#8E95A5",
      accentBg: "#F3F4F6",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 border border-[#E8ECF4] shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: s.accentBg, color: s.accentColor }}
            >
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-[#0D1B2A]">
                {s.value}
              </p>
              <p className="text-xs mt-1 text-[#8E95A5]">
                {s.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
