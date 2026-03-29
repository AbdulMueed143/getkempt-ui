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
    <section id="faq" className="bg-[#0D1B2A] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-[#6B8FD4] uppercase tracking-widest bg-[#1B3163]/30 px-3 py-1.5 rounded-full">
            Got questions?
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white leading-tight">
            Frequently asked
          </h2>
          <p className="mt-3 text-white/50 text-lg">
            Can't find your answer?{" "}
            <a href="mailto:hello@getkempt.com" className="text-[#6B8FD4] hover:underline">
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
                "rounded-2xl border transition-all duration-200",
                open === idx
                  ? "bg-[#1B3163]/30 border-[#1B3163]/60"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span
                  className={cn(
                    "text-sm font-semibold",
                    open === idx ? "text-white" : "text-white/80"
                  )}
                >
                  {faq.q}
                </span>
                {open === idx ? (
                  <Minus className="w-4 h-4 text-[#6B8FD4] shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-white/40 shrink-0" />
                )}
              </button>

              {open === idx && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-white/60 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
