import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const BUSINESS_TYPES = [
  "Barbershops", "Hair Salons", "Nail Studios",
  "Beauty Spas", "Lash & Brow Studios", "Massage Clinics",
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-[#0D1B2A] flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Layered background — warm Melbourne evening atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep warm gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1B2A] via-[#111D2E] to-[#0D1B2A]" />

        {/* Warm amber glow — like laneway lighting */}
        <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] rounded-full bg-[#C4A882]/[0.06] blur-[150px]" />
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-[#1B3163]/25 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#4B2D6E]/15 blur-[120px]" />

        {/* Subtle warm spotlight from above */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-[#C4A882]/[0.04] to-transparent" />

        {/* Brick-like texture overlay — Melbourne laneway feel */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #C4A882 1px, transparent 1px), linear-gradient(#C4A882 1px, transparent 1px)",
            backgroundSize: "48px 24px",
          }}
        />

        {/* Fine noise grain — vintage warmth */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* Warm gold accent line at top — like a shop awning edge */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Trust badge */}
        <div className="inline-flex items-center gap-2 bg-[#C4A882]/10 border border-[#C4A882]/20 text-[#C4A882] text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Trusted by Melbourne&apos;s finest grooming shops</span>
        </div>

        {/* Headline — using serif for luxurious feel */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl text-white leading-[1.08] tracking-tight mb-6">
          <span className="heading-serif">The craft of grooming,</span>
          <br />
          <span className="heading-serif text-transparent bg-clip-text bg-gradient-to-r from-[#C4A882] via-[#D5C4A8] to-[#C4A882]">
            perfected
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Bookings, staff scheduling, client loyalty and more — all in one
          beautifully simple platform. Spend less time managing and more time
          doing what you love.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href="/signup"
            className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#C4A882] to-[#D5B584] text-[#0D1B2A] font-bold text-base px-8 py-4 rounded-2xl hover:from-[#D5C4A8] hover:to-[#E5C594] transition-all hover:scale-[1.02] shadow-xl shadow-[#C4A882]/10"
          >
            Start for free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto text-center text-white/60 hover:text-white font-semibold text-base px-8 py-4 rounded-2xl border border-white/15 hover:border-[#C4A882]/40 transition-all backdrop-blur-sm"
          >
            See all features
          </a>
        </div>

        {/* Business type tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
          <span className="text-xs text-[#C4A882]/60 font-medium mr-2 uppercase tracking-wider">Perfect for</span>
          {BUSINESS_TYPES.map((t) => (
            <span
              key={t}
              className="text-xs text-white/50 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-full font-medium hover:border-[#C4A882]/20 hover:text-white/70 transition-all"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Dashboard mockup card */}
        <div className="relative mx-auto max-w-4xl">
          {/* Warm glow under card */}
          <div className="absolute inset-x-8 -bottom-8 h-24 bg-[#C4A882]/10 blur-3xl rounded-full" />
          <div className="absolute inset-x-16 -bottom-4 h-16 bg-[#1B3163]/30 blur-2xl rounded-full" />

          <div className="relative bg-[#111E2E] rounded-2xl border border-[#C4A882]/10 overflow-hidden shadow-2xl shadow-black/50">
            {/* Fake browser chrome */}
            <div className="bg-[#0A1420] px-4 py-3 flex items-center gap-3 border-b border-[#C4A882]/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#C4A882]/40" />
                <div className="w-3 h-3 rounded-full bg-[#C4A882]/25" />
                <div className="w-3 h-3 rounded-full bg-[#C4A882]/15" />
              </div>
              <div className="flex-1 bg-white/[0.05] rounded-lg h-6 flex items-center px-3">
                <span className="text-[10px] text-white/25 font-mono">app.getkempt.com/bookings</span>
              </div>
            </div>

            {/* Mock dashboard UI */}
            <div className="p-4 grid grid-cols-3 gap-3">
              {/* Stat cards */}
              {[
                { label: "Bookings Today",     value: "14",  sub: "+3 from yesterday",  color: "#C4A882" },
                { label: "Revenue This Week",  value: "$2,840", sub: "↑ 12% vs last week", color: "#86B0A5" },
                { label: "Active Clients",     value: "312", sub: "18 new this month",   color: "#9FB2D9" },
              ].map((s) => (
                <div key={s.label} className="bg-[#0D1825] rounded-xl p-3 border border-[#C4A882]/[0.06]">
                  <p className="text-[10px] text-white/35 uppercase tracking-wide mb-1">{s.label}</p>
                  <p className="text-xl font-black text-white">{s.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: s.color }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Mock calendar strip */}
            <div className="px-4 pb-4">
              <div className="bg-[#0D1825] rounded-xl p-3 border border-[#C4A882]/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white/60">Today&apos;s Bookings</span>
                  <span className="text-[10px] text-[#C4A882]/50">Saturday, 28 Feb</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { time: "9:00 AM",  client: "Nathan Scott",  svc: "Fade",         staff: "Alex R.",  color: "#C4A882" },
                    { time: "9:30 AM",  client: "Ruby Clarke",   svc: "Gel Nails",    staff: "Casey W.", color: "#86B0A5" },
                    { time: "10:00 AM", client: "Oscar Reid",    svc: "Beard Trim",   staff: "Alex R.",  color: "#C4A882" },
                    { time: "2:00 PM",  client: "Caleb Moore",   svc: "Haircut",      staff: "Taylor B.", color: "#9FB2D9" },
                    { time: "3:00 PM",  client: "Eli Turner",    svc: "Hot Towel Shave", staff: "Alex R.", color: "#C4A882" },
                  ].map((b) => (
                    <div
                      key={b.time}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left"
                      style={{ backgroundColor: `${b.color}0A`, borderLeft: `3px solid ${b.color}40` }}
                    >
                      <span className="text-[10px] text-white/40 w-14 shrink-0 font-mono">{b.time}</span>
                      <span className="text-[11px] text-white/80 font-semibold flex-1">{b.client}</span>
                      <span className="text-[10px] text-white/40 hidden sm:inline">{b.svc}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full hidden sm:inline"
                        style={{ color: b.color, backgroundColor: `${b.color}15` }}
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

      {/* Warm divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/15 to-transparent" />

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#C4A882]/40">
        <div className="w-5 h-9 rounded-full border-2 border-[#C4A882]/20 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-[#C4A882]/40 animate-bounce" />
        </div>
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
      </div>
    </section>
  );
}
