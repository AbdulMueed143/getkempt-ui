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
          color: "#047857",
          bg: "#ECFDF5",
          border: "#A7F3D0",
        },
        down: {
          icon: TrendingDown,
          color: "#B91C1C",
          bg: "#FEF2F2",
          border: "#FECACA",
        },
        neutral: {
          icon: Minus,
          color: "#4B5563",
          bg: "#F3F4F6",
          border: "#E5E7EB",
        },
      }[data.trend.direction]
    : null;

  return (
    <div
      className="relative bg-white rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group"
      style={{
        border: "1px solid #E8E4DA",
        boxShadow:
          "0 1px 2px rgba(11,18,32,0.04), 0 1px 3px rgba(11,18,32,0.04)",
      }}
    >
      {/* subtle colour accent top strip */}
      <span
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, ${data.accentColor}, ${data.accentColor}80 60%, transparent)`,
        }}
      />

      {/* Top row: label + icon */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold text-[#4B5563] leading-snug">
          {data.label}
        </p>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{
            backgroundColor: `${data.accentColor}14`,
            border: `1px solid ${data.accentColor}22`,
          }}
        >
          <Icon size={18} style={{ color: data.accentColor }} strokeWidth={2.25} />
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="text-[30px] font-extrabold font-sans leading-none text-[#0B1220] tracking-tight">
          {data.value}
        </p>
        {data.subValue && (
          <p className="text-xs mt-1.5 text-[#6B7280] font-medium">
            {data.subValue}
          </p>
        )}
      </div>

      {/* Trend pill */}
      {trendConfig && (
        <div className="flex items-center gap-2 -mb-0.5">
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg"
            style={{
              color: trendConfig.color,
              backgroundColor: trendConfig.bg,
              border: `1px solid ${trendConfig.border}`,
            }}
          >
            <trendConfig.icon size={11} strokeWidth={2.5} />
            {data.trend!.value}
          </span>
          <span className="text-[11px] text-[#6B7280] font-medium">
            {data.trend!.label}
          </span>
        </div>
      )}
    </div>
  );
}
