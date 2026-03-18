import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name:    "Marcus D.",
    role:    "Owner, Heritage Barbershop",
    suburb:  "Fitzroy, VIC",
    rating:  5,
    text:    "We used to manage bookings through a Google sheet and a WhatsApp group. GetSquire replaced all of that. My team knows their schedule, clients book themselves, and I can actually see who's shown up at the end of the day. Night and day difference.",
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
    <section className="bg-[#FAFAF8] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-[#1B3163] uppercase tracking-widest bg-[#EEF1F8] px-3 py-1.5 rounded-full">
            Real people, real results
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black text-[#0D1B2A] leading-tight">
            Melbourne shops
            <br />
            <span className="text-[#1B3163]">trust GetSquire</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <Quote className="w-6 h-6 text-gray-200 mb-3" />
              <p className="text-sm text-gray-600 leading-relaxed flex-1 italic">
                "{t.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#EEF1F8] flex items-center justify-center text-xl shrink-0">
                  {t.emoji}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                  <p className="text-xs text-[#1B3163] font-medium">{t.suburb}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stat strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "4.9★",   label: "Average rating" },
            { value: "2 min",  label: "Average setup time" },
            { value: "-42%",   label: "No-show reduction" },
            { value: "100%",   label: "Melbourne-made" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-[#1B3163]">{s.value}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
