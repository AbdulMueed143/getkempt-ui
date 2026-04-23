"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, MessageSquare, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Base per-staff monthly rate (without SMS) decreases at volume
const VOLUME_TIERS = [
  { min: 1,  max: 5,        rate: 67,  label: "1–5 staff" },
  { min: 6,  max: 15,       rate: 59,  label: "6–15 staff" },
  { min: 16, max: 30,       rate: 52,  label: "16–30 staff" },
  { min: 31, max: Infinity, rate: null, label: "31+ staff" },
];

// SMS adds a flat $30/staff/mo on top of the base tier rate
const SMS_ADD_ON = 30;

const BASE_FEATURES = [
  "Unlimited bookings & services",
  "Full booking calendar (day / week / month)",
  "Staff availability & schedule management",
  "Client management & history",
  "Services, packages & loyalty programs",
  "Visits & attendance tracking",
  "Store profile, settings & policies",
  "In-app push notifications (free, unlimited)",
  "Transactional email confirmations (free, unlimited)",
  "First month completely free",
];

const SMS_FEATURES = [
  "Automated SMS booking reminders",
  "SMS no-show & cancellation alerts",
  "Bulk SMS campaigns to your client list",
  "Two-way SMS replies from clients",
];

function getTier(staffCount: number) {
  return VOLUME_TIERS.find((t) => staffCount >= t.min && staffCount <= t.max)!;
}

export function PricingSection() {
  const [staffCount, setStaffCount] = useState(3);
  const [billing,    setBilling]    = useState<"monthly" | "annual">("monthly");
  const [includeSms, setIncludeSms] = useState(false);

  const tier        = getTier(staffCount);
  const isEnterprise = tier.rate === null;

  const baseRate     = isEnterprise ? 45 : tier.rate!;
  const ratePerStaff = includeSms ? baseRate + SMS_ADD_ON : baseRate;
  const billedRate   = billing === "annual" ? Math.round(ratePerStaff * 0.83) : ratePerStaff;
  const monthlyTotal = billedRate * staffCount;
  const annualTotal  = monthlyTotal * 12;
  const annualSaving = ratePerStaff * staffCount * 12 - annualTotal;

  return (
    <section id="pricing" className="relative bg-[#F8F6F1] py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Warm texture background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#C4A882]/[0.05] rounded-full blur-[150px]" />
      </div>

      {/* Top warm divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/20 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#C4A882] uppercase tracking-[0.2em] bg-[#C4A882]/10 px-4 py-2 rounded-full">
            Simple, transparent pricing
          </span>
          <h2 className="mt-6 text-3xl sm:text-5xl text-[#0D1B2A] leading-tight">
            <span className="heading-serif">Pay per team member,</span>
            <br />
            <span className="heading-serif text-[#1B3163]">nothing hidden</span>
          </h2>
          <p className="mt-5 text-lg text-[#5A6170] max-w-2xl mx-auto">
            One flat plan with everything included. Price scales with your team size.
            Add SMS reminders for <strong className="text-[#0D1B2A]">$30 more per staff member</strong> — no credit bundles, no surprises.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── Left: interactive price calculator ── */}
          <div className="relative bg-[#0D1B2A] rounded-3xl p-8 text-white overflow-hidden">
            {/* Background accents */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C4A882]/[0.08] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#1B3163]/30 rounded-full blur-3xl pointer-events-none" />

            {/* Brick texture */}
            <div
              className="absolute inset-0 opacity-[0.012] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #C4A882 1px, transparent 1px), linear-gradient(#C4A882 1px, transparent 1px)",
                backgroundSize: "48px 24px",
              }}
            />

            {/* First month badge */}
            <div className="relative z-10 inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              🎉 First month completely free — no credit card required
            </div>

            {/* Staff count slider */}
            <div className="relative z-10 mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-white/60">
                  How many staff members?
                </label>
                <div className="flex items-center gap-2 bg-[#1B3163]/40 border border-[#C4A882]/15 rounded-xl px-3 py-1">
                  <button
                    type="button"
                    onClick={() => setStaffCount((v) => Math.max(1, v - 1))}
                    className="text-white/50 hover:text-[#C4A882] w-5 text-lg leading-none font-bold transition-colors"
                  >
                    −
                  </button>
                  <span className="text-lg font-black text-white w-8 text-center">
                    {staffCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStaffCount((v) => Math.min(50, v + 1))}
                    className="text-white/50 hover:text-[#C4A882] w-5 text-lg leading-none font-bold transition-colors"
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
                  background: `linear-gradient(to right, #C4A882 0%, #D5B584 ${(staffCount / 50) * 100}%, #ffffff10 ${(staffCount / 50) * 100}%, #ffffff10 100%)`,
                }}
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-white/25">1</span>
                <span className="text-[10px] text-white/25">50</span>
              </div>
            </div>

            {/* Volume tier badges */}
            <div className="relative z-10 mb-5">
              <div className="flex gap-2 flex-wrap">
                {VOLUME_TIERS.slice(0, 3).map((t) => (
                  <span
                    key={t.label}
                    className={cn(
                      "text-[11px] font-bold px-2.5 py-1 rounded-full transition-all",
                      tier.min === t.min
                        ? "bg-[#C4A882] text-[#0D1B2A]"
                        : "bg-white/[0.06] text-white/35"
                    )}
                  >
                    {t.label} · ${includeSms ? t.rate! + SMS_ADD_ON : t.rate}/staff
                  </span>
                ))}
              </div>
            </div>

            {/* SMS toggle */}
            <div className="relative z-10 mb-5">
              <button
                type="button"
                onClick={() => setIncludeSms((v) => !v)}
                className={cn(
                  "w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 border transition-all text-left",
                  includeSms
                    ? "bg-violet-600/15 border-violet-500/40"
                    : "bg-white/[0.03] border-white/[0.08] hover:border-white/15"
                )}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className={cn("w-4 h-4 shrink-0", includeSms ? "text-violet-400" : "text-white/35")} />
                  <div>
                    <p className={cn("text-sm font-bold", includeSms ? "text-white" : "text-white/55")}>
                      Include SMS reminders
                    </p>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      +${SMS_ADD_ON}/staff/mo · automated texts to your clients
                    </p>
                  </div>
                </div>
                {/* Toggle knob */}
                <div className={cn(
                  "relative w-10 h-6 rounded-full shrink-0 transition-all",
                  includeSms ? "bg-violet-500" : "bg-white/15"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                    includeSms ? "left-5" : "left-1"
                  )} />
                </div>
              </button>
            </div>

            {/* Price display */}
            <div className="relative z-10 bg-white/[0.05] border border-[#C4A882]/10 rounded-2xl p-5 mb-6">
              {/* Billing toggle */}
              <div className="flex items-center bg-white/[0.06] rounded-xl p-1 mb-4 w-fit">
                <button
                  onClick={() => setBilling("monthly")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    billing === "monthly" ? "bg-[#C4A882] text-[#0D1B2A] shadow" : "text-white/45 hover:text-white"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("annual")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                    billing === "annual" ? "bg-[#C4A882] text-[#0D1B2A] shadow" : "text-white/45 hover:text-white"
                  )}
                >
                  Annual
                  <span className="text-[9px] font-black bg-emerald-500/25 text-emerald-400 px-1 py-0.5 rounded">
                    −17%
                  </span>
                </button>
              </div>

              {isEnterprise ? (
                <div className="text-center py-4">
                  <p className="text-2xl font-black text-white heading-serif">Let&apos;s talk</p>
                  <p className="text-sm text-white/45 mt-1">Custom pricing for 31+ staff</p>
                </div>
              ) : (
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-white/35 mb-1">
                      {staffCount} staff × ${billedRate}/staff/mo
                      {includeSms && (
                        <span className="text-violet-400"> (incl. SMS)</span>
                      )}
                    </p>
                    <div className="flex items-end gap-1">
                      <span className="text-xs text-white/45 mb-1">AUD $</span>
                      <span className="text-5xl font-black text-white leading-none">
                        {monthlyTotal.toLocaleString()}
                      </span>
                      <span className="text-sm text-white/45 mb-1">/mo</span>
                    </div>
                    {billing === "annual" && (
                      <p className="text-xs text-emerald-400 mt-1.5">
                        Billed ${annualTotal.toLocaleString()}/yr · saves ${annualSaving.toLocaleString()}/yr
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/35">Per staff</p>
                    <p className="text-xl font-black text-[#C4A882]">${billedRate}</p>
                    <p className="text-[10px] text-white/25">/mo</p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <Link
              href="/signup"
              className="relative z-10 block text-center bg-gradient-to-r from-[#C4A882] to-[#D5B584] text-[#0D1B2A] font-bold text-sm py-4 rounded-2xl hover:from-[#D5C4A8] hover:to-[#E5C594] transition-all hover:scale-[1.01] shadow-lg shadow-[#C4A882]/10"
            >
              Start your free month — no card needed →
            </Link>

            <p className="relative z-10 text-center text-[10px] text-white/25 mt-3">
              Cancel any time · No lock-in · GST applies
            </p>
          </div>

          {/* ── Right: what's included ── */}
          <div className="space-y-5">

            {/* Base features */}
            <div className="bg-white/80 backdrop-blur-sm border border-[#E8E2D8] rounded-2xl p-6">
              <h3 className="text-sm font-black text-[#0D1B2A] mb-4">
                Everything included in every plan
              </h3>
              <ul className="space-y-2.5">
                {BASE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C4A882] mt-0.5 shrink-0" />
                    <span className="text-sm text-[#5A6170] leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SMS plan callout */}
            <div className={cn(
              "rounded-2xl border p-5 transition-all",
              includeSms
                ? "bg-violet-50/80 border-violet-200"
                : "bg-white/60 border-[#E8E2D8]"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className={cn("w-4 h-4 shrink-0", includeSms ? "text-violet-600" : "text-[#6B7280]")} />
                <p className={cn("text-sm font-bold", includeSms ? "text-violet-900" : "text-[#6B7280]")}>
                  SMS plan · +${SMS_ADD_ON}/staff/mo
                </p>
                {includeSms && (
                  <span className="ml-auto text-[10px] font-black bg-violet-600 text-white px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>
              <ul className="space-y-2">
                {SMS_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Zap className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", includeSms ? "text-violet-500" : "text-[#D1D5DB]")} />
                    <span className={cn("text-sm leading-snug", includeSms ? "text-violet-700" : "text-[#9CA3AF]")}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              {!includeSms && (
                <button
                  type="button"
                  onClick={() => setIncludeSms(true)}
                  className="mt-4 text-xs font-bold text-[#C4A882] hover:text-[#1B3163] hover:underline transition-colors"
                >
                  Add SMS to your plan →
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Enterprise callout */}
        <div className="mt-10 relative bg-[#0D1B2A] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
          {/* Subtle texture */}
          <div
            className="absolute inset-0 opacity-[0.01] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #C4A882 1px, transparent 1px), linear-gradient(#C4A882 1px, transparent 1px)",
              backgroundSize: "48px 24px",
            }}
          />
          <div className="relative z-10">
            <h3 className="text-lg font-black text-white heading-serif">30+ staff or multiple locations?</h3>
            <p className="text-sm text-white/45 mt-1 max-w-lg">
              Custom pricing available for franchises and large teams. Includes dedicated support,
              custom integrations, and SLA guarantees.
            </p>
          </div>
          <a
            href="mailto:hello@getkempt.com"
            className="relative z-10 shrink-0 px-6 py-3 bg-[#C4A882] text-[#0D1B2A] font-bold text-sm rounded-xl hover:bg-[#D5C4A8] transition-colors whitespace-nowrap"
          >
            Contact us →
          </a>
        </div>

        <p className="text-center text-xs text-[#6B7280] mt-6">
          All prices in AUD · GST applies to Australian businesses · First month free, no credit card required
        </p>
      </div>

      {/* Bottom warm divider */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C4A882]/20 to-transparent" />
    </section>
  );
}
