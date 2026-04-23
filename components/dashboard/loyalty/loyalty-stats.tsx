import { Award, CheckCircle2, TrendingUp, Repeat2 } from "lucide-react";
import type { LoyaltyProgram } from "@/types/loyalty";

interface LoyaltyStatsProps {
  programs: LoyaltyProgram[];
}

export function LoyaltyStats({ programs }: LoyaltyStatsProps) {
  const active       = programs.filter((p) => p.status === "active").length;
  const totalEarned  = programs.reduce((s, p) => s + p.totalEarned,    0);
  const totalRedeemed = programs.reduce((s, p) => s + p.totalRedeemed, 0);
  const redeemRate   = totalEarned > 0 ? Math.round((totalRedeemed / totalEarned) * 100) : 0;

  const stats = [
    {
      icon:      <Award size={18} />,
      label:     "Total Programs",
      value:     programs.length,
      sub:       `${active} active`,
      iconColor: "#1B3163",
      iconBg:    "#EEF1F8",
    },
    {
      icon:      <CheckCircle2 size={18} />,
      label:     "Rewards Earned",
      value:     totalEarned,
      sub:       "all time",
      iconColor: "#16A34A",
      iconBg:    "#DCFCE7",
    },
    {
      icon:      <Repeat2 size={18} />,
      label:     "Rewards Redeemed",
      value:     totalRedeemed,
      sub:       "all time",
      iconColor: "#D97706",
      iconBg:    "#FEF3C7",
    },
    {
      icon:      <TrendingUp size={18} />,
      label:     "Redemption Rate",
      value:     `${redeemRate}%`,
      sub:       "rewards used",
      iconColor: "#9D174D",
      iconBg:    "#FCE7F3",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3"
          style={{ border: "1px solid #E8E4DA" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: s.iconBg, color: s.iconColor }}
          >
            {s.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs truncate" style={{ color: "#6B7280" }}>{s.label}</p>
            <p className="text-lg font-bold leading-tight" style={{ color: "#1B3163" }}>{s.value}</p>
            {s.sub && <p className="text-[10px] truncate" style={{ color: "#9FB2D9" }}>{s.sub}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
