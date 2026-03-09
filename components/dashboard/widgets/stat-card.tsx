import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { StatCardData } from "@/types/dashboard";

interface StatCardProps {
  data: StatCardData;
}

export function StatCard({ data }: StatCardProps) {
  const Icon = data.icon;

  const trendConfig = data.trend
    ? {
        up: {
          icon: TrendingUp,
          color: "#16A34A",
          bg: "#DCFCE7",
          label: `↑ ${data.trend.value} ${data.trend.label}`,
        },
        down: {
          icon: TrendingDown,
          color: "#DC2626",
          bg: "#FEE2E2",
          label: `↓ ${data.trend.value} ${data.trend.label}`,
        },
        neutral: {
          icon: Minus,
          color: "#6B7280",
          bg: "#F3F4F6",
          label: `${data.trend.value} ${data.trend.label}`,
        },
      }[data.trend.direction]
    : null;

  return (
    <div
      className="bg-white rounded-2xl p-5 flex flex-col gap-4"
      style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(27,49,99,0.06)" }}
    >
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium" style={{ color: "#8E95A5" }}>
          {data.label}
        </p>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${data.accentColor}14` }}
        >
          <Icon size={18} style={{ color: data.accentColor }} />
        </div>
      </div>

      {/* Value */}
      <div>
        <p
          className="text-3xl font-bold font-sans leading-none"
          style={{ color: "#1B3163" }}
        >
          {data.value}
        </p>
        {data.subValue && (
          <p className="text-xs mt-1" style={{ color: "#8E95A5" }}>
            {data.subValue}
          </p>
        )}
      </div>

      {/* Trend pill */}
      {trendConfig && (
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ color: trendConfig.color, backgroundColor: trendConfig.bg }}
          >
            <trendConfig.icon size={11} />
            {data.trend!.value}
          </span>
          <span className="text-xs" style={{ color: "#8E95A5" }}>
            {data.trend!.label}
          </span>
        </div>
      )}
    </div>
  );
}
