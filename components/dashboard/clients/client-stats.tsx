import { Users, UserCheck, Sparkles, CalendarCheck } from "lucide-react";
import type { Client } from "@/types/client";
import { isActiveClient, isNewClient, hasUpcomingBooking } from "@/types/client";

interface ClientStatsProps {
  clients: Client[];
}

export function ClientStats({ clients }: ClientStatsProps) {
  const total    = clients.length;
  const active   = clients.filter((c) => isActiveClient(c)).length;
  const newCount = clients.filter((c) => isNewClient(c)).length;
  const upcoming = clients.filter((c) => hasUpcomingBooking(c)).length;

  const stats = [
    {
      icon:      <Users size={18} />,
      label:     "Total Clients",
      value:     total,
      iconColor: "#1B3163",
      iconBg:    "#EEF1F8",
    },
    {
      icon:      <UserCheck size={18} />,
      label:     "Active (90 days)",
      value:     active,
      sub:       `${Math.round((active / total) * 100)}% retention`,
      iconColor: "#16A34A",
      iconBg:    "#DCFCE7",
    },
    {
      icon:      <Sparkles size={18} />,
      label:     "New This Month",
      value:     newCount,
      iconColor: "#D97706",
      iconBg:    "#FEF3C7",
    },
    {
      icon:      <CalendarCheck size={18} />,
      label:     "Upcoming Bookings",
      value:     upcoming,
      sub:       "clients returning",
      iconColor: "#9D174D",
      iconBg:    "#FCE7F3",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3"
          style={{ border: "1px solid #E8ECF4" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
          >
            {stat.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs truncate" style={{ color: "#8E95A5" }}>{stat.label}</p>
            <p className="text-lg font-bold leading-tight" style={{ color: "#1B3163" }}>
              {stat.value}
            </p>
            {stat.sub && (
              <p className="text-[10px] truncate" style={{ color: "#9FB2D9" }}>{stat.sub}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
