import { Package2, CheckCircle2, Tag, TrendingDown } from "lucide-react";
import type { Package } from "@/types/package";
import type { Service } from "@/types/service";
import {
  calculateBasePrice,
  calculateFinalPrice,
  calculateSaving,
} from "@/lib/utils/package-calculations";

interface PackageStatsProps {
  packages: Package[];
  services: Service[];
}

export function PackageStats({ packages, services }: PackageStatsProps) {
  const total        = packages.length;
  const active       = packages.filter((p) => p.status === "active").length;
  const discounted   = packages.filter((p) => p.discountEnabled).length;

  /* Average saving % across discounted packages */
  const avgSaving = (() => {
    if (discounted === 0) return 0;
    const totalPct = packages
      .filter((p) => p.discountEnabled)
      .reduce((sum, p) => {
        const included  = services.filter((s) => p.serviceIds.includes(s.id));
        const base      = calculateBasePrice(included);
        const final     = calculateFinalPrice(base, p.discountType, p.discountValue);
        const { percentage } = calculateSaving(base, final);
        return sum + percentage;
      }, 0);
    return Math.round((totalPct / discounted) * 10) / 10;
  })();

  const stats = [
    {
      icon:      <Package2 size={18} />,
      label:     "Total Packages",
      value:     total,
      iconColor: "#0D1B2A",
      iconBg:    "#E8E4DA",
    },
    {
      icon:      <CheckCircle2 size={18} />,
      label:     "Active",
      value:     active,
      iconColor: "#16A34A",
      iconBg:    "#DCFCE7",
    },
    {
      icon:      <Tag size={18} />,
      label:     "With Discounts",
      value:     discounted,
      iconColor: "#D97706",
      iconBg:    "#FEF3C7",
    },
    {
      icon:      <TrendingDown size={18} />,
      label:     "Avg Saving",
      value:     discounted > 0 ? `${avgSaving}%` : "—",
      sub:       discounted > 0 ? "across discounted packages" : undefined,
      iconColor: "#9D174D",
      iconBg:    "#FCE7F3",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-[#E8E4DA] shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
          >
            {stat.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs truncate text-[#6B7280]">{stat.label}</p>
            <p className="text-lg font-bold leading-tight truncate text-[#0D1B2A]">
              {stat.value}
            </p>
            {stat.sub && (
              <p className="text-[10px] truncate text-[#9FB2D9]">{stat.sub}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
