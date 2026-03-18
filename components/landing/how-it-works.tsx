const STEPS = [
  {
    number: "01",
    title:  "Set up your shop",
    desc:   "Add your shop details, services, packages, and opening hours in minutes. No developer required — if you can use Instagram you can use GetSquire.",
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
    desc:   "Your clients book via your public booking page, the GetSquire app, or walk in. You take phone bookings directly from the calendar. Everything syncs instantly.",
    emoji:  "📱",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#0D1B2A] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1B3163]/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#6B8FD4] uppercase tracking-widest bg-[#1B3163]/30 px-3 py-1.5 rounded-full">
            Simple by design
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white leading-tight">
            Up and running
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6B8FD4] to-[#C4A882]">
              in under 15 minutes
            </span>
          </h2>
          <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto">
            No training. No onboarding calls. No IT team.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-px bg-gradient-to-r from-[#1B3163] via-[#6B8FD4] to-[#1B3163]" />

          {STEPS.map((s) => (
            <div key={s.number} className="flex flex-col items-center text-center relative">
              {/* Emoji circle */}
              <div className="w-24 h-24 rounded-full bg-[#1B3163]/40 border border-[#1B3163]/80 flex items-center justify-center mb-6 text-4xl relative z-10 ring-4 ring-[#0D1B2A]">
                {s.emoji}
              </div>

              {/* Step number */}
              <span className="text-xs font-black text-[#6B8FD4] tracking-[0.25em] uppercase mb-2">
                Step {s.number}
              </span>

              <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed max-w-xs">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Industry coverage */}
        <div className="mt-20 text-center">
          <p className="text-sm text-white/40 font-medium mb-5">Designed for every kind of grooming business</p>
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
                className="flex items-center gap-2 bg-white/6 border border-white/10 rounded-xl px-4 py-2.5"
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-sm text-white/70 font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
