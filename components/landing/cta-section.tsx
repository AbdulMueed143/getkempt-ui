import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="bg-[#FAFAF8] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-[#0D1B2A] rounded-3xl overflow-hidden px-8 py-16 sm:px-16 text-center">
          {/* Background blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#1B3163]/40 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#4B2D6E]/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <span className="text-4xl mb-4 block">🚀</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Ready to run your shop
              <br />
              like a pro?
            </h2>
            <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto">
              Join hundreds of Melbourne salons and barbershops who have already
              made the switch. Start free — upgrade when you're ready.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#1B3163] font-bold text-base px-8 py-4 rounded-2xl hover:bg-[#F5E6D3] transition-all hover:scale-[1.02] shadow-xl shadow-white/10"
              >
                Start for free today
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="mailto:hello@getsquire.com"
                className="w-full sm:w-auto text-center text-white/70 hover:text-white font-semibold text-base px-8 py-4 rounded-2xl border border-white/20 hover:border-white/40 transition-all"
              >
                Talk to us first
              </a>
            </div>

            <p className="text-xs text-white/30 mt-6">
              No credit card required · First month free · Cancel any time · GST applies
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
