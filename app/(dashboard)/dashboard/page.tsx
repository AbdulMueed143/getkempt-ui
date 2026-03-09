import type { Metadata } from "next";
import { StatCard } from "@/components/dashboard/widgets/stat-card";
import { SalesChart } from "@/components/dashboard/widgets/sales-chart";
import { QuickActions } from "@/components/dashboard/widgets/quick-actions";
import { AlertsPanel } from "@/components/dashboard/widgets/alerts-panel";
import { UpcomingBookings } from "@/components/dashboard/widgets/upcoming-bookings";
import { STAT_CARDS } from "@/lib/mock/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">

      {/* ── Welcome header ─────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold font-sans" style={{ color: "#1B3163" }}>
          Good afternoon 👋
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "#8E95A5" }}>
          Here&apos;s what&apos;s happening at your business today.
        </p>
      </div>

      {/* ── Stat cards — 4 across ───────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.id} data={card} />
        ))}
      </div>

      {/* ── Main grid: chart + sidebar ──────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">

        {/* Left column */}
        <div className="space-y-6">
          {/* Chart */}
          <SalesChart />

          {/* Bottom row: quick actions + alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActions />
            <AlertsPanel />
          </div>
        </div>

        {/* Right column: upcoming bookings */}
        <div className="xl:sticky xl:top-4">
          <UpcomingBookings />
        </div>
      </div>
    </div>
  );
}
