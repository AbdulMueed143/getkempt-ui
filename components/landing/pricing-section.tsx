"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, MessageSquare, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Per-staff monthly rate decreases at volume tiers
const VOLUME_TIERS = [
  { min: 1,  max: 5,        rate: 67, label: "1–5 staff" },
  { min: 6,  max: 15,       rate: 59, label: "6–15 staff" },
  { min: 16, max: 30,       rate: 52, label: "16–30 staff" },
  { min: 31, max: Infinity, rate: 45, label: "31+ staff (enterprise)" },
];

// SMS credit bundles — priced to cover Twilio AU carrier costs (~AUD $0.135/SMS) + margin
const SMS_BUNDLES = [
  { credits: 500,    price: 80,   perSms: "0.16", saving: null },
  { credits: 1_000,  price: 149,  perSms: "0.149", saving: "7% cheaper" },
  { credits: 2_500,  price: 349,  perSms: "0.14",  saving: "13% cheaper" },
  { credits: 5_000,  price: 649,  perSms: "0.13",  saving: "19% cheaper" },
  { credits: 10_000, price: 1_199, perSms: "0.12", saving: "25% cheaper", best: true },
];

const INCLUDED_FEATURES = [
  "Unlimited bookings & services",
  "Full booking calendar (day / week / month)",
  "Staff availability & schedule management",
  "Client management & history",
  "Services, packages & loyalty programs",
  "Visits & attendance tracking",
  "Store profile, settings & policies",
  "In-app push notifications (free, unlimited)",
  "Transactional email confirmations (free, unlimited)",
  "14-day free trial · first month on us",
];

function getTier(staffCount: number) {
  return VOLUME_TIERS.find((t) => staffCount >= t.min && staffCount <= t.max)!;
}

export function PricingSection() {
  const [staffCount, setStaffCount] = useState(3);
  const [billing,    setBilling]    = useState<"monthly" | "annual">("monthly");

  const tier          = getTier(staffCount);
  const monthlyRate   = billing === "annual" ? Math.round(tier.rate * 0.83) : tier.rate;
  const monthlyTotal  = monthlyRate * staffCount;
  const annualTotal   = monthlyTotal * 12;
  const annualSaving  = tier.rate * staffCount * 12 - annualTotal;

  return (
    <section id="pricing" className="bg-[#FAFAF8] py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-[#1B3163] uppercase tracking-widest bg-[#EEF1F8] px-3 py-1.5 rounded-full">
            Simple, transparent pricing
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black text-[#0D1B2A] leading-tight">
            Pay per team member,
            <br />
            <span className="text-[#1B3163]">nothing hidden</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            One flat plan with everything included. The price simply scales with
            your team size, and SMS credits are topped up separately when you need
            them — no forced bundles.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── Left: interactive price calculator ── */}
          <div className="bg-[#0D1B2A] rounded-3xl p-8 text-white relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#1B3163]/30 rounded-full blur-3xl pointer-events-none" />

            {/* First month badge */}
            <div className="relative z-10 inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              🎉 First month completely free — no credit card required
            </div>

            {/* Staff count slider */}
            <div className="relative z-10 mb-8">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-white/70">
                  How many staff members?
                </label>
                <div className="flex items-center gap-2 bg-[#1B3163]/50 border border-[#1B3163]/80 rounded-xl px-3 py-1">
                  <button
                    type="button"
                    onClick={() => setStaffCount((v) => Math.max(1, v - 1))}
                    className="text-white/60 hover:text-white w-5 text-lg leading-none font-bold"
                  >
                    −
                  </button>
                  <span className="text-lg font-black text-white w-8 text-center">
                    {staffCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStaffCount((v) => Math.min(50, v + 1))}
                    className="text-white/60 hover:text-white w-5 text-lg leading-none font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                type="range"
                min={1}
                max={50}
                value={staffCount}
                onChange={(e) => setStaffCount(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #1B3163 0%, #6B8FD4 ${(staffCount / 50) * 100}%, #ffffff20 ${(staffCount / 50) * 100}%, #ffffff20 100%)`,
                }}
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-white/30">1</span>
                <span className="text-[10px] text-white/30">50</span>
              </div>
            </div>

            {/* Volume tier badge */}
            <div className="relative z-10 mb-5">
              <div className="flex gap-2 flex-wrap">
                {VOLUME_TIERS.slice(0, 3).map((t) => (
                  <span
                    key={t.label}
                    className={cn(
                      "text-[11px] font-bold px-2.5 py-1 rounded-full transition-all",
                      tier.min === t.min
                        ? "bg-[#6B8FD4] text-white"
                        : "bg-white/8 text-white/40"
                    )}
                  >
                    {t.label} · ${t.rate}/staff
                  </span>
                ))}
              </div>
            </div>

            {/* Price display */}
            <div className="relative z-10 bg-white/8 border border-white/10 rounded-2xl p-5 mb-6">
              {/* Billing toggle inside card */}
              <div className="flex items-center bg-white/8 rounded-xl p-1 mb-4 self-start w-fit">
                <button
                  onClick={() => setBilling("monthly")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    billing === "monthly" ? "bg-white text-[#0D1B2A] shadow" : "text-white/50 hover:text-white"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("annual")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                    billing === "annual" ? "bg-white text-[#0D1B2A] shadow" : "text-white/50 hover:text-white"
                  )}
                >
                  Annual
                  <span className="text-[9px] font-black bg-emerald-500/30 text-emerald-400 px-1 py-0.5 rounded">
                    −17%
                  </span>
                </button>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-white/40 mb-1">
                    {staffCount} staff × ${monthlyRate}/staff/mo
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-xs text-white/50 mb-1">AUD $</span>
                    <span className="text-5xl font-black text-white leading-none">
                      {monthlyTotal.toLocaleString()}
                    </span>
                    <span className="text-sm text-white/50 mb-1">/mo</span>
                  </div>
                  {billing === "annual" && (
                    <p className="text-xs text-emerald-400 mt-1.5">
                      Billed ${annualTotal.toLocaleString()}/yr · saves ${annualSaving.toLocaleString()}/yr
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Per staff</p>
                  <p className="text-xl font-black text-[#6B8FD4]">${monthlyRate}</p>
                  <p className="text-[10px] text-white/30">/mo</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/signup"
              className="relative z-10 block text-center bg-white text-[#1B3163] font-bold text-sm py-4 rounded-2xl hover:bg-[#F5E6D3] transition-all hover:scale-[1.01] shadow-lg"
            >
              Start your free month — no card needed →
            </Link>

            <p className="relative z-10 text-center text-[10px] text-white/30 mt-3">
              Cancel any time · No lock-in · GST applies
            </p>
          </div>

          {/* ── Right: what's included + SMS bundles ── */}
          <div className="space-y-6">

            {/* Included features */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h3 className="text-sm font-black text-gray-900 mb-4">
                Everything included in every plan
              </h3>
              <ul className="space-y-2.5">
                {INCLUDED_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#1B3163] mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SMS add-on callout */}
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-1">
                <MessageSquare className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-violet-900">SMS notifications are included</p>
                  <p className="text-xs text-violet-600 mt-0.5 leading-relaxed">
                    All plans include <strong>free</strong> in-app push notifications and email
                    confirmations. Buy SMS credits as a separate top-up if you also want to reach
                    clients via text — no monthly commitment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SMS Credit Bundles ── */}
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-violet-600" />
            <h3 className="text-xl font-black text-gray-900">SMS Credit Top-ups</h3>
            <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2 py-1 rounded-full">
              Optional add-on
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6 max-w-2xl">
            Credits never expire and work across all SMS types — reminders, confirmations, bulk
            campaigns. Pricing reflects carrier delivery costs (Twilio AU network) plus platform
            infrastructure. Larger bundles cost less per SMS.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {SMS_BUNDLES.map((b) => (
              <div
                key={b.credits}
                className={cn(
                  "relative rounded-2xl border p-4 flex flex-col",
                  b.best
                    ? "bg-[#0D1B2A] border-[#1B3163] shadow-xl"
                    : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
                )}
              >
                {b.best && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest bg-violet-600 text-white px-3 py-1 rounded-full whitespace-nowrap">
                    Best value
                  </div>
                )}

                <p className={cn("text-lg font-black mb-0.5", b.best ? "text-white" : "text-gray-900")}>
                  {b.credits >= 1_000 ? `${b.credits / 1_000}k` : b.credits} SMS
                </p>

                <div className="flex items-end gap-1 mb-2">
                  <span className={cn("text-xs mb-0.5", b.best ? "text-white/50" : "text-gray-400")}>$</span>
                  <span className={cn("text-3xl font-black", b.best ? "text-white" : "text-gray-900")}>
                    {b.price.toLocaleString()}
                  </span>
                  <span className={cn("text-xs mb-0.5", b.best ? "text-white/50" : "text-gray-400")}>AUD</span>
                </div>

                <p className={cn("text-xs font-mono mb-1", b.best ? "text-[#6B8FD4]" : "text-gray-400")}>
                  ${b.perSms} / SMS
                </p>

                {b.saving ? (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full mt-auto self-start",
                      b.best
                        ? "bg-violet-500/30 text-violet-300"
                        : "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    {b.saving}
                  </span>
                ) : (
                  <span className={cn("text-[10px] mt-auto", b.best ? "text-white/20" : "text-gray-200")}>—</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 max-w-2xl">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              SMS delivery rates vary slightly by carrier. Pricing is inclusive of Twilio network fees
              for Australian mobile numbers. International SMS rates differ — contact us for bulk
              international pricing. Credits do not expire.
            </span>
          </div>
        </div>

        {/* Enterprise + bottom note */}
        <div className="mt-10 bg-[#0D1B2A] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black text-white">30+ staff or multiple locations?</h3>
            <p className="text-sm text-white/50 mt-1 max-w-lg">
              Custom pricing available for franchises and large teams. Includes dedicated support,
              custom integrations, and SLA guarantees.
            </p>
          </div>
          <a
            href="mailto:hello@getsquire.com"
            className="shrink-0 px-6 py-3 bg-[#1B3163] text-white font-bold text-sm rounded-xl hover:bg-[#243F80] transition-colors whitespace-nowrap"
          >
            Contact us →
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          All prices in AUD · GST applies to Australian businesses · 14-day trial then first full month free
        </p>
      </div>
    </section>
  );
}
