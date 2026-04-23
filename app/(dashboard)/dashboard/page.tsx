import type { Metadata } from "next";
import { StatCard } from "@/components/dashboard/widgets/stat-card";
import { SalesChart } from "@/components/dashboard/widgets/sales-chart";
import { QuickActions } from "@/components/dashboard/widgets/quick-actions";
import { AlertsPanel } from "@/components/dashboard/widgets/alerts-panel";
import { UpcomingBookings } from "@/components/dashboard/widgets/upcoming-bookings";
import { STAT_CARDS } from "@/lib/mock/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

/** Time-of-day aware greeting — server-rendered; safe for static export. */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">

      {/* ── Welcome header ─────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C4A882] mb-1.5">
            {today}
          </p>
          <h2 className="text-[26px] md:text-[30px] font-extrabold font-sans text-[#0B1220] leading-tight tracking-tight">
            {getGreeting()} <span className="inline-block">👋</span>
          </h2>
          <p className="text-sm mt-1 text-[#4B5563] font-medium">
            Here&apos;s what&apos;s happening at your business today.
          </p>
        </div>
      </header>

      {/* ── Stat cards — 4 across ───────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.id} data={card} />
        ))}
      </div>

      {/* ── Main grid: chart + sidebar ──────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">

        {/* Left column */}
        <div className="space-y-6 min-w-0">
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
