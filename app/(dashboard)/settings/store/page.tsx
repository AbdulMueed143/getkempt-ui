import { StoreSettingsClient } from "@/components/dashboard/settings/store-settings-client";

export const metadata = {
  title: "Store Settings | GetKempt",
  description: "Manage scheduling limits, holidays, surcharges, and policies",
};

const NAV_ITEMS = [
  { href: "#scheduling",   label: "Scheduling",   icon: "📅" },
  { href: "#payments",     label: "Payments",     icon: "💳" },
  { href: "#cancellation", label: "Cancellation", icon: "⚠️" },
  { href: "#holidays",     label: "Holidays",     icon: "🏖️" },
  { href: "#surcharges",   label: "Surcharges",   icon: "💲" },
  { href: "#policies",     label: "Policies",     icon: "📄" },
];

export default function StoreSettingsPage() {
  return (
    <div className="max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage booking windows, slot intervals, holidays, surcharges, and client policies
        </p>
      </div>

      {/* Two-column layout: sticky nav on desktop, single column on mobile */}
      <div className="lg:grid lg:grid-cols-[180px_1fr] lg:gap-10 lg:items-start">

        {/* ── Sticky section nav (desktop only) ── */}
        <nav className="hidden lg:block sticky top-6 space-y-0.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
            Sections
          </p>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500
                         hover:text-[#1B3163] hover:bg-[#EEF1F8] transition-all group"
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="font-medium group-hover:font-semibold transition-all">
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        {/* ── Main form ── */}
        <div className="min-w-0">
          <StoreSettingsClient />
        </div>
      </div>
    </div>
  );
}
