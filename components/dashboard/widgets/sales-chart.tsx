"use client";

import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CHART_DATA } from "@/lib/mock/dashboard";

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

/* ── Custom tooltip ──────────────────────────────── */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-xl px-3.5 py-3 text-sm"
      style={{
        backgroundColor: "#0B1220",
        border: "1px solid rgba(196,168,130,0.2)",
        minWidth: 170,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      }}
    >
      <p className="font-bold mb-2 text-[#EAEAEA] text-[13px]">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div
            key={entry.name}
            className="flex justify-between items-center gap-4"
          >
            <span className="text-[11px] text-white/60 flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span
              className="font-bold text-[12px]"
              style={{ color: entry.color }}
            >
              {entry.name === "Revenue"
                ? `$${(entry.value as number).toLocaleString()}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SalesChart() {
  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{
        border: "1px solid #E8E4DA",
        boxShadow:
          "0 1px 2px rgba(11,18,32,0.04), 0 1px 3px rgba(11,18,32,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: "#EEF1F8",
              border: "1px solid #CBD5ED",
            }}
          >
            <BarChart3
              size={18}
              className="text-[#1B3163]"
              strokeWidth={2.25}
            />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-[#0B1220] leading-tight">
              Activity Overview
            </h2>
            <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">
              Bookings & revenue — last 7 days
            </p>
          </div>
        </div>

        {/* Period badge */}
        <span
          className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#EEF1F8] text-[#1B3163] border border-[#CBD5ED]"
        >
          This week
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={CHART_DATA} barCategoryGap="30%" barGap={4}>
          <defs>
            <linearGradient id="bookings-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B3163" stopOpacity={1} />
              <stop offset="100%" stopColor="#2A4A8C" stopOpacity={0.85} />
            </linearGradient>
            <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C4A882" stopOpacity={1} />
              <stop offset="100%" stopColor="#D5B584" stopOpacity={0.85} />
            </linearGradient>
            <linearGradient id="loyalty-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9FB2D9" stopOpacity={1} />
              <stop offset="100%" stopColor="#B5C4E2" stopOpacity={0.85} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#F0EEE6"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="bookings"
            tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v: number) => `$${v / 1000}k`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(27,49,99,0.04)" }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              fontSize: 11,
              color: "#4B5563",
              fontWeight: 600,
              paddingTop: 16,
            }}
          />
          <Bar
            yAxisId="bookings"
            dataKey="bookings"
            name="Bookings"
            fill="url(#bookings-gradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            yAxisId="revenue"
            dataKey="revenue"
            name="Revenue"
            fill="url(#revenue-gradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            yAxisId="bookings"
            dataKey="loyaltyVisits"
            name="Loyalty visits"
            fill="url(#loyalty-gradient)"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
