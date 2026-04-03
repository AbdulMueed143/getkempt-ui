import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
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
      </div>

      {/* Top warm divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/20 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="relative bg-[#0D1B2A] rounded-3xl overflow-hidden px-8 py-20 sm:px-16 text-center">
          {/* Background layers */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Warm glows */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#C4A882]/[0.08] rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#1B3163]/30 rounded-full blur-3xl" />

            {/* Brick texture */}
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

            {/* Gold accent line at top of card */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/25 to-transparent" />
          </div>

          <div className="relative z-10">
            {/* Decorative element */}
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/50 to-transparent mx-auto mb-8" />

            <h2 className="text-3xl sm:text-5xl text-white mb-5 leading-tight">
              <span className="heading-serif">Ready to run your shop</span>
              <br />
              <span className="heading-serif text-transparent bg-clip-text bg-gradient-to-r from-[#C4A882] via-[#D5C4A8] to-[#C4A882]">
                like a pro?
              </span>
            </h2>
            <p className="text-lg text-white/45 mb-10 max-w-xl mx-auto leading-relaxed">
              Join hundreds of Melbourne salons and barbershops who have already
              made the switch. Start free — upgrade when you&apos;re ready.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#C4A882] to-[#D5B584] text-[#0D1B2A] font-bold text-base px-8 py-4 rounded-2xl hover:from-[#D5C4A8] hover:to-[#E5C594] transition-all hover:scale-[1.02] shadow-xl shadow-[#C4A882]/10"
              >
                Start for free today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="mailto:hello@getkempt.com"
                className="w-full sm:w-auto text-center text-white/60 hover:text-white font-semibold text-base px-8 py-4 rounded-2xl border border-white/15 hover:border-[#C4A882]/40 transition-all"
              >
                Talk to us first
              </a>
            </div>

            <p className="text-xs text-white/25 mt-8">
              No credit card required · First month free · Cancel any time · GST applies
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
