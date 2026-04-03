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
    color: "#C4A882",
    tag:   "Core",
  },
  {
    icon:  Users,
    title: "Staff & Availability",
    desc:  "Set weekly schedules, date overrides, breaks and public holidays. Each staff member gets their own colour-coded calendar.",
    color: "#86B0A5",
    tag:   "Core",
  },
  {
    icon:  CalendarCheck2,
    title: "Visit Tracker",
    desc:  "Mark past appointments as attended or no-show. Bulk actions for end-of-day processing. Track your attendance rate over time.",
    color: "#9FB2D9",
    tag:   "Operations",
  },
  {
    icon:  Scissors,
    title: "Services & Packages",
    desc:  "Full service catalogue with pricing, duration, and buffer time. Bundle services into packages with automatic discount calculation.",
    color: "#C4A882",
    tag:   "Core",
  },
  {
    icon:  Gift,
    title: "Loyalty Programs",
    desc:  "Sequential loyalty programs. Reward repeat clients with discounts, free services, or partner shop vouchers. Set your own triggers.",
    color: "#D5B584",
    tag:   "Retention",
  },
  {
    icon:  Users,
    title: "Client Management",
    desc:  "Complete client history, booking stats, and upcoming appointment indicators. Bulk email your entire client base in one click.",
    color: "#86B0A5",
    tag:   "Growth",
  },
  {
    icon:  MessageSquare,
    title: "Automated Reminders",
    desc:  "Reduce no-shows with automatic SMS and email reminders. Configurable timing — send 24 hours, 2 hours, or any lead time.",
    color: "#9FB2D9",
    tag:   "Coming soon",
    soon:  true,
  },
  {
    icon:  BarChart3,
    title: "Reports & Analytics",
    desc:  "Revenue by staff, service, and date range. Rebooking rates, peak hours, and capacity utilisation. Export to CSV.",
    color: "#C4A882",
    tag:   "Coming soon",
    soon:  true,
  },
  {
    icon:  MapPin,
    title: "Store Profile & Settings",
    desc:  "Google Maps location, booking window limits, slot intervals, holiday surcharges, and full cancellation & privacy policies.",
    color: "#86B0A5",
    tag:   "Settings",
  },
  {
    icon:  Shield,
    title: "Secure & Compliant",
    desc:  "Role-based access control. Staff only see their own data. Built with Australian privacy law in mind from the ground up.",
    color: "#D5B584",
    tag:   "Trust",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative bg-[#F8F6F1] py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Warm texture background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle warm grain */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />
        {/* Warm ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C4A882]/[0.06] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1B3163]/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* Top warm divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-xs font-bold text-[#C4A882] uppercase tracking-[0.2em] bg-[#C4A882]/10 px-4 py-2 rounded-full">
            Everything you need
          </span>
          <h2 className="mt-6 text-3xl sm:text-5xl text-[#0D1B2A] leading-tight">
            <span className="heading-serif">Built for the way salons</span>
            <br />
            <span className="heading-serif text-[#1B3163]">actually work</span>
          </h2>
          <p className="mt-5 text-lg text-[#5A6170] max-w-2xl mx-auto leading-relaxed">
            No bloated dashboards. No learning curve. Just the tools your team
            needs to take bookings, manage clients, and grow.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#E8E2D8] hover:border-[#C4A882]/30 hover:shadow-xl hover:shadow-[#C4A882]/[0.06] hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${f.color}15` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>

              {/* Tag */}
              <span
                className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{
                  color: f.soon ? "#92400E" : f.color,
                  backgroundColor: f.soon ? "#FEF9C3" : `${f.color}12`,
                }}
              >
                {f.tag}
              </span>

              <h3 className="text-sm font-bold text-[#0D1B2A] mb-2">{f.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>

              {f.soon && (
                <div className="mt-3 pt-3 border-t border-amber-100">
                  <span className="text-xs text-amber-600 font-medium">🚀 In development</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom warm divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/20 to-transparent" />
    </section>
  );
}
