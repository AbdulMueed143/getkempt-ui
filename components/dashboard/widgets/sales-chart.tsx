"use client";

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
      className="rounded-xl p-3 text-sm shadow-lg"
      style={{
        backgroundColor: "#1B3163",
        border: "1px solid rgba(255,255,255,0.1)",
        minWidth: 160,
      }}
    >
      <p className="font-semibold mb-2" style={{ color: "#EAEAEA" }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-4">
          <span style={{ color: "rgba(234,234,234,0.6)" }}>{entry.name}</span>
          <span className="font-medium" style={{ color: entry.color as string }}>
            {entry.name === "Revenue" ? `$${(entry.value as number).toLocaleString()}` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SalesChart() {
  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(27,49,99,0.06)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "#1B3163" }}>
            Activity Overview
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#8E95A5" }}>
            Bookings & revenue — last 7 days
          </p>
        </div>

        {/* Period badge */}
        <span
          className="text-xs font-medium px-3 py-1 rounded-full"
          style={{ backgroundColor: "#F0F3FA", color: "#1B3163" }}
        >
          This week
        </span>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={CHART_DATA} barCategoryGap="30%" barGap={4}>
          <CartesianGrid
            vertical={false}
            stroke="#E8ECF4"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 11, fill: "#8E95A5" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="bookings"
            tick={{ fontSize: 11, fill: "#8E95A5" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <YAxis
            yAxisId="revenue"
            orientation="right"
            tick={{ fontSize: 11, fill: "#8E95A5" }}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v: number) => `$${v / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(27,49,99,0.04)" }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: "#8E95A5", paddingTop: 16 }}
          />
          <Bar
            yAxisId="bookings"
            dataKey="bookings"
            name="Bookings"
            fill="#1B3163"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            yAxisId="revenue"
            dataKey="revenue"
            name="Revenue"
            fill="#D5B584"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            yAxisId="bookings"
            dataKey="loyaltyVisits"
            name="Loyalty visits"
            fill="#9FB2D9"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
