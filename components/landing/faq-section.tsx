"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FAQS = [
  {
    q: "How does the trial work?",
    a: "Sign up and use GetKempt completely free for your first month — no credit card required. After that, you're billed based on the number of staff members in your account. Cancel before the trial ends and you'll never be charged.",
  },
  {
    q: "How is pricing calculated?",
    a: "It's simple: you pay a monthly rate per staff member. The rate drops as your team grows — $67/staff for 1–5 people, $59 for 6–15, and $52 for 16–30. There are no per-feature charges, no booking limits, and no hidden fees. Everything is included.",
  },
  {
    q: "What if I add or remove staff mid-month?",
    a: "Your bill is recalculated automatically at the start of each billing cycle based on your current active staff count. Adding a new staff member mid-month is pro-rated for the remaining days.",
  },
  {
    q: "How does SMS work?",
    a: "SMS is a simple monthly add-on of $30 per staff member. Enable it in the pricing calculator and it's included in your subscription — no separate credit bundles or top-ups. All plans already include unlimited in-app push notifications and transactional email confirmations for free. SMS is ideal for reaching clients who may not have the app installed.",
  },
  {
    q: "Can I add or remove SMS later?",
    a: "Yes. You can switch SMS on or off at any time from your account settings. Changes take effect at the start of your next billing cycle. There are no lock-in commitments on the SMS add-on.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. No lock-in contracts. Cancel through your account settings at any time and you won't be billed again. If you're on an annual plan, you'll receive a pro-rated refund for any unused full months.",
  },
  {
    q: "Do clients need to download an app to book?",
    a: "No. Clients book via your public booking page — a web link you can share on Instagram, Google My Business, or your website. An optional native client app is in development.",
  },
  {
    q: "How does staff availability work?",
    a: "Each staff member has their own weekly schedule with configurable work hours, break times, and date-specific overrides. The booking engine checks availability in real time before showing slots to clients — double-bookings are impossible.",
  },
  {
    q: "Is GetKempt suitable for salons outside Australia?",
    a: "Yes — GetKempt works anywhere in the world. All appointment times are stored in UTC and displayed in the shop's local timezone. Pricing is in AUD for now, with global currency support coming soon.",
  },
  {
    q: "Can I import my existing clients?",
    a: "CSV import for client lists is on the roadmap for Q2 2026. Our support team can also assist with data migration from Fresha, Booksy, Square, and other common platforms.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-[#0D1B2A] py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background textures */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm ambient glow */}
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#C4A882]/[0.04] rounded-full blur-[150px]" />

        {/* Brick texture */}
        <div
          className="absolute inset-0 opacity-[0.012]"
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

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#C4A882] uppercase tracking-[0.2em] bg-[#C4A882]/10 px-4 py-2 rounded-full">
            Got questions?
          </span>
          <h2 className="mt-6 text-3xl sm:text-5xl text-white leading-tight">
            <span className="heading-serif">Frequently asked</span>
          </h2>
          <p className="mt-4 text-white/40 text-lg">
            Can&apos;t find your answer?{" "}
            <a href="mailto:hello@getkempt.com" className="text-[#C4A882] hover:text-[#D5C4A8] hover:underline transition-colors">
              Email us
            </a>
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-2">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-2xl border transition-all duration-300",
                open === idx
                  ? "bg-[#C4A882]/[0.06] border-[#C4A882]/20"
                  : "bg-white/[0.02] border-white/[0.06] hover:border-[#C4A882]/15"
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    open === idx ? "text-white" : "text-white/70"
                  )}
                >
                  {faq.q}
                </span>
                {open === idx ? (
                  <Minus className="w-4 h-4 text-[#C4A882] shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-white/30 shrink-0" />
                )}
              </button>

              {open === idx && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom warm divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/15 to-transparent" />
    </section>
  );
}
