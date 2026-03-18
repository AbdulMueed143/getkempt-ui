import {
  CalendarDays, Users, CalendarCheck2, Scissors,
  PackagePlus, Gift, BarChart3, MessageSquare,
  MapPin, Shield,
} from "lucide-react";

const FEATURES = [
  {
    icon:  CalendarDays,
    title: "Smart Booking Calendar",
    desc:  "Day, week, and month views. Colour-coded by staff. Overlapping bookings tile side-by-side. Create appointments in seconds.",
    color: "#1B3163",
    tag:   "Core",
  },
  {
    icon:  Users,
    title: "Staff & Availability",
    desc:  "Set weekly schedules, date overrides, breaks and public holidays. Each staff member gets their own colour-coded calendar.",
    color: "#0369A1",
    tag:   "Core",
  },
  {
    icon:  CalendarCheck2,
    title: "Visit Tracker",
    desc:  "Mark past appointments as attended or no-show. Bulk actions for end-of-day processing. Track your attendance rate over time.",
    color: "#047857",
    tag:   "Operations",
  },
  {
    icon:  Scissors,
    title: "Services & Packages",
    desc:  "Full service catalogue with pricing, duration, and buffer time. Bundle services into packages with automatic discount calculation.",
    color: "#7C3AED",
    tag:   "Core",
  },
  {
    icon:  Gift,
    title: "Loyalty Programs",
    desc:  "Sequential loyalty programs. Reward repeat clients with discounts, free services, or partner shop vouchers. Set your own triggers.",
    color: "#B45309",
    tag:   "Retention",
  },
  {
    icon:  Users,
    title: "Client Management",
    desc:  "Complete client history, booking stats, and upcoming appointment indicators. Bulk email your entire client base in one click.",
    color: "#0D9488",
    tag:   "Growth",
  },
  {
    icon:  MessageSquare,
    title: "Automated Reminders",
    desc:  "Reduce no-shows with automatic SMS and email reminders. Configurable timing — send 24 hours, 2 hours, or any lead time.",
    color: "#DB2777",
    tag:   "Coming soon",
    soon:  true,
  },
  {
    icon:  BarChart3,
    title: "Reports & Analytics",
    desc:  "Revenue by staff, service, and date range. Rebooking rates, peak hours, and capacity utilisation. Export to CSV.",
    color: "#EA580C",
    tag:   "Coming soon",
    soon:  true,
  },
  {
    icon:  MapPin,
    title: "Store Profile & Settings",
    desc:  "Google Maps location, booking window limits, slot intervals, holiday surcharges, and full cancellation & privacy policies.",
    color: "#6B8FD4",
    tag:   "Settings",
  },
  {
    icon:  Shield,
    title: "Secure & Compliant",
    desc:  "Role-based access control. Staff only see their own data. Built with Australian privacy law in mind from the ground up.",
    color: "#16A34A",
    tag:   "Trust",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-[#FAFAF8] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#1B3163] uppercase tracking-widest bg-[#EEF1F8] px-3 py-1.5 rounded-full">
            Everything you need
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black text-[#0D1B2A] leading-tight">
            Built for the way salons
            <br />
            <span className="text-[#1B3163]">actually work</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            No bloated dashboards. No learning curve. Just the tools your team
            needs to take bookings, manage clients, and grow.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
            >
              {/* Icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${f.color}15` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>

              {/* Tag */}
              <span
                className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{
                  color: f.soon ? "#92400E" : f.color,
                  backgroundColor: f.soon ? "#FEF9C3" : `${f.color}12`,
                }}
              >
                {f.tag}
              </span>

              <h3 className="text-sm font-bold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>

              {f.soon && (
                <div className="mt-3 pt-3 border-t border-amber-100">
                  <span className="text-xs text-amber-600 font-medium">🚀 In development</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
