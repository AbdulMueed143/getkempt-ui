const STEPS = [
  {
    number: "01",
    title:  "Set up your shop",
    desc:   "Add your shop details, services, packages, and opening hours in minutes. No developer required — if you can use Instagram you can use GetKempt.",
    emoji:  "🏪",
  },
  {
    number: "02",
    title:  "Add your team",
    desc:   "Invite staff members and set their individual schedules, services, and permissions. Each team member gets their own colour-coded calendar.",
    emoji:  "👥",
  },
  {
    number: "03",
    title:  "Take bookings everywhere",
    desc:   "Your clients book via your public booking page, the GetKempt app, or walk in. You take phone bookings directly from the calendar. Everything syncs instantly.",
    emoji:  "📱",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-[#0D1B2A] py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background — Melbourne evening atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm ambient glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C4A882]/[0.05] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#1B3163]/20 rounded-full blur-[120px]" />

        {/* Brick texture — laneway feel */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #C4A882 1px, transparent 1px), linear-gradient(#C4A882 1px, transparent 1px)",
            backgroundSize: "48px 24px",
          }}
        />

        {/* Noise grain */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-xs font-bold text-[#C4A882] uppercase tracking-[0.2em] bg-[#C4A882]/10 px-4 py-2 rounded-full">
            Simple by design
          </span>
          <h2 className="mt-6 text-3xl sm:text-5xl text-white leading-tight">
            <span className="heading-serif">Up and running</span>
            <br />
            <span className="heading-serif text-transparent bg-clip-text bg-gradient-to-r from-[#C4A882] via-[#D5C4A8] to-[#C4A882]">
              in under 15 minutes
            </span>
          </h2>
          <p className="mt-5 text-lg text-white/40 max-w-xl mx-auto">
            No training. No onboarding calls. No IT team.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) — warm gold */}
          <div className="hidden md:block absolute top-14 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-[1px] bg-gradient-to-r from-[#C4A882]/20 via-[#C4A882]/40 to-[#C4A882]/20" />

          {STEPS.map((s) => (
            <div key={s.number} className="flex flex-col items-center text-center relative group">
              {/* Emoji circle — warm border */}
              <div className="w-28 h-28 rounded-full bg-[#1B3163]/30 border border-[#C4A882]/20 flex items-center justify-center mb-6 text-4xl relative z-10 ring-4 ring-[#0D1B2A] group-hover:border-[#C4A882]/40 group-hover:bg-[#1B3163]/40 transition-all duration-500">
                {s.emoji}
              </div>

              {/* Step number */}
              <span className="text-xs font-black text-[#C4A882] tracking-[0.25em] uppercase mb-2">
                Step {s.number}
              </span>

              <h3 className="text-xl font-bold text-white mb-3 heading-serif">{s.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed max-w-xs">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Industry coverage */}
        <div className="mt-24 text-center">
          {/* Warm divider */}
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/30 to-transparent mx-auto mb-8" />

          <p className="text-sm text-white/35 font-medium mb-6 uppercase tracking-wider">Designed for every kind of grooming business</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: "✂️", label: "Barbershops" },
              { icon: "💇", label: "Hair Salons" },
              { icon: "💅", label: "Nail Studios" },
              { icon: "🧖", label: "Beauty Spas" },
              { icon: "👁️", label: "Lash & Brow" },
              { icon: "🛁", label: "Massage" },
              { icon: "🌿", label: "Wellness" },
              { icon: "🪑", label: "Barber + Beauty" },
            ].map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-2 bg-white/[0.03] border border-[#C4A882]/10 rounded-xl px-4 py-2.5 hover:border-[#C4A882]/25 hover:bg-white/[0.05] transition-all duration-300"
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-sm text-white/60 font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom warm divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/15 to-transparent" />
    </section>
  );
}
