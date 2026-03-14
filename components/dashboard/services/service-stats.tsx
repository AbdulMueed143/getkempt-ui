import { Layers, CheckCircle2, WifiOff, Tag } from "lucide-react";
import type { Service } from "@/types/service";
import { CATEGORY_LABELS } from "@/types/service";

interface ServiceStatsProps {
  services: Service[];
}

export function ServiceStats({ services }: ServiceStatsProps) {
  const total           = services.length;
  const active          = services.filter((s) => s.status === "active").length;
  const offlineOnly     = services.filter((s) => !s.onlineBookingEnabled).length;

  const categoryCounts  = services.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1;
    return acc;
  }, {});
  const topCategory     = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    {
      icon:      <Layers size={18} />,
      label:     "Total Services",
      value:     total,
      iconColor: "#1B3163",
      iconBg:    "#EEF1F8",
    },
    {
      icon:      <CheckCircle2 size={18} />,
      label:     "Active",
      value:     active,
      iconColor: "#16A34A",
      iconBg:    "#DCFCE7",
    },
    {
      icon:      <WifiOff size={18} />,
      label:     "Walk-in only",
      value:     offlineOnly,
      iconColor: "#D97706",
      iconBg:    "#FEF3C7",
    },
    {
      icon:      <Tag size={18} />,
      label:     "Top category",
      value:     topCategory ? CATEGORY_LABELS[topCategory[0] as keyof typeof CATEGORY_LABELS] : "—",
      sub:       topCategory ? `${topCategory[1]} services` : undefined,
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
            <p className="text-lg font-bold leading-tight truncate" style={{ color: "#1B3163" }}>
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
