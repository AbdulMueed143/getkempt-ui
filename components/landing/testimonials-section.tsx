import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name:    "Marcus D.",
    role:    "Owner, Heritage Barbershop",
    suburb:  "Fitzroy, VIC",
    rating:  5,
    text:    "We used to manage bookings through a Google sheet and a WhatsApp group. GetKempt replaced all of that. My team knows their schedule, clients book themselves, and I can actually see who's shown up at the end of the day. Night and day difference.",
    emoji:   "✂️",
  },
  {
    name:    "Priya S.",
    role:    "Founder, Blush & Bloom Studio",
    suburb:  "South Yarra, VIC",
    rating:  5,
    text:    "The loyalty programs are what sold me. My regulars love earning rewards, and it's completely automated — I set it up once and forgot about it. Retention has noticeably improved in the three months since I switched.",
    emoji:   "💅",
  },
  {
    name:    "Jamal H.",
    role:    "Co-owner, The Trim Room",
    suburb:  "Brunswick, VIC",
    rating:  5,
    text:    "We have 11 barbers across two chairs and the staff availability system saves me so much back-and-forth. Overrides for sick days, public holiday closures, it all just works. Honestly the best thing I've done for the business this year.",
    emoji:   "💈",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative bg-[#F8F6F1] py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Warm texture background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#C4A882]/[0.05] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#1B3163]/[0.04] rounded-full blur-[120px]" />
      </div>

      {/* Top warm divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#C4A882] uppercase tracking-[0.2em] bg-[#C4A882]/10 px-4 py-2 rounded-full">
            Real people, real results
          </span>
          <h2 className="mt-6 text-3xl sm:text-5xl text-[#0D1B2A] leading-tight">
            <span className="heading-serif">Melbourne shops</span>
            <br />
            <span className="heading-serif text-[#1B3163]">trust GetKempt</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-7 border border-[#E8E2D8] hover:border-[#C4A882]/30 hover:shadow-xl hover:shadow-[#C4A882]/[0.06] hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#C4A882] fill-[#C4A882]" />
                ))}
              </div>

              {/* Quote */}
              <Quote className="w-6 h-6 text-[#C4A882]/20 mb-3" />
              <p className="text-sm text-[#4A5568] leading-relaxed flex-1 italic">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[#E8E2D8]">
                <div className="w-11 h-11 rounded-full bg-[#C4A882]/10 border border-[#C4A882]/15 flex items-center justify-center text-xl shrink-0">
                  {t.emoji}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0D1B2A]">{t.name}</p>
                  <p className="text-xs text-[#8E95A5]">{t.role}</p>
                  <p className="text-xs text-[#C4A882] font-medium">{t.suburb}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stat strip */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "4.9★",   label: "Average rating" },
            { value: "2 min",  label: "Average setup time" },
            { value: "-42%",   label: "No-show reduction" },
            { value: "100%",   label: "Melbourne-made" },
          ].map((s) => (
            <div key={s.label} className="text-center group">
              <p className="text-3xl font-black text-[#1B3163] heading-serif group-hover:text-[#C4A882] transition-colors duration-300">{s.value}</p>
              <p className="text-sm text-[#8E95A5] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom warm divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/20 to-transparent" />
    </section>
  );
}
