import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

const BUSINESS_TYPES = [
  "Barbershops", "Hair Salons", "Nail Studios",
  "Beauty Spas", "Lash & Brow Studios", "Massage Clinics",
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#0D1B2A] flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#1B3163]/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#4B2D6E]/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#1B3163]/10 blur-[80px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
          The smarter way
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B8FD4] to-[#C4A882]">
            to run your salon
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          Bookings, staff scheduling, client loyalty and more — all in one
          beautifully simple platform. Spend less time managing and more time
          doing what you love.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href="/signup"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#1B3163] font-bold text-base px-8 py-4 rounded-2xl hover:bg-[#F5E6D3] transition-all hover:scale-[1.02] shadow-xl shadow-white/10"
          >
            Start for free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto text-center text-white/70 hover:text-white font-semibold text-base px-8 py-4 rounded-2xl border border-white/20 hover:border-white/40 transition-all"
          >
            See all features
          </a>
        </div>

        {/* Business type tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
          <span className="text-xs text-white/40 font-medium mr-2">Perfect for</span>
          {BUSINESS_TYPES.map((t) => (
            <span
              key={t}
              className="text-xs text-white/60 bg-white/8 border border-white/10 px-3 py-1.5 rounded-full font-medium"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Dashboard mockup card */}
        <div className="relative mx-auto max-w-4xl">
          {/* Glow under card */}
          <div className="absolute inset-x-8 -bottom-6 h-20 bg-[#1B3163]/40 blur-2xl rounded-full" />

          <div className="relative bg-[#111E2E] rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
            {/* Fake browser chrome */}
            <div className="bg-[#0D1625] px-4 py-3 flex items-center gap-3 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <div className="flex-1 bg-white/8 rounded-lg h-6 flex items-center px-3">
                <span className="text-[10px] text-white/30">app.getsquire.com/bookings</span>
              </div>
            </div>

            {/* Mock dashboard UI */}
            <div className="p-4 grid grid-cols-3 gap-3">
              {/* Stat cards */}
              {[
                { label: "Bookings Today",     value: "14",  sub: "+3 from yesterday",  color: "#6B8FD4" },
                { label: "Revenue This Week",  value: "$2,840", sub: "↑ 12% vs last week", color: "#4ADE80" },
                { label: "Active Clients",     value: "312", sub: "18 new this month",   color: "#C084FC" },
              ].map((s) => (
                <div key={s.label} className="bg-[#1A2D45] rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-white/40 uppercase tracking-wide mb-1">{s.label}</p>
                  <p className="text-xl font-black text-white">{s.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: s.color }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Mock calendar strip */}
            <div className="px-4 pb-4">
              <div className="bg-[#1A2D45] rounded-xl p-3 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white/70">Today's Bookings</span>
                  <span className="text-[10px] text-white/40">Saturday, 28 Feb</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { time: "9:00 AM",  client: "Nathan Scott",  svc: "Fade",         staff: "Alex R.",  color: "#1B3163" },
                    { time: "9:30 AM",  client: "Ruby Clarke",   svc: "Gel Nails",    staff: "Casey W.", color: "#0369A1" },
                    { time: "10:00 AM", client: "Oscar Reid",    svc: "Beard Trim",   staff: "Alex R.",  color: "#1B3163" },
                    { time: "2:00 PM",  client: "Caleb Moore",   svc: "Haircut",      staff: "Taylor B.", color: "#B45309" },
                    { time: "3:00 PM",  client: "Eli Turner",    svc: "Hot Towel Shave", staff: "Alex R.", color: "#1B3163" },
                  ].map((b) => (
                    <div
                      key={b.time}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left"
                      style={{ backgroundColor: `${b.color}18`, borderLeft: `3px solid ${b.color}` }}
                    >
                      <span className="text-[10px] text-white/50 w-14 shrink-0 font-mono">{b.time}</span>
                      <span className="text-[11px] text-white/90 font-semibold flex-1">{b.client}</span>
                      <span className="text-[10px] text-white/50 hidden sm:inline">{b.svc}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full hidden sm:inline"
                        style={{ color: b.color, backgroundColor: `${b.color}25` }}
                      >
                        {b.staff}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30">
        <div className="w-5 h-9 rounded-full border-2 border-white/20 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-white/40 animate-bounce" />
        </div>
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
      </div>
    </section>
  );
}
