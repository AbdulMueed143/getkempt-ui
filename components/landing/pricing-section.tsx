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
            One flat plan with everything included. Price scales with your team size.
            Add SMS reminders for <strong className="text-gray-700">$30 more per staff member</strong> — no credit bundles, no surprises.
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
            <div className="relative z-10 mb-6">
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

            {/* Volume tier badges */}
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
                    ? "bg-violet-600/20 border-violet-500/50"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className={cn("w-4 h-4 shrink-0", includeSms ? "text-violet-400" : "text-white/40")} />
                  <div>
                    <p className={cn("text-sm font-bold", includeSms ? "text-white" : "text-white/60")}>
                      Include SMS reminders
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      +${SMS_ADD_ON}/staff/mo · automated texts to your clients
                    </p>
                  </div>
                </div>
                {/* Toggle knob */}
                <div className={cn(
                  "relative w-10 h-6 rounded-full shrink-0 transition-all",
                  includeSms ? "bg-violet-500" : "bg-white/20"
                )}>
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                    includeSms ? "left-5" : "left-1"
                  )} />
                </div>
              </button>
            </div>

            {/* Price display */}
            <div className="relative z-10 bg-white/8 border border-white/10 rounded-2xl p-5 mb-6">
              {/* Billing toggle */}
              <div className="flex items-center bg-white/8 rounded-xl p-1 mb-4 w-fit">
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

              {isEnterprise ? (
                <div className="text-center py-4">
                  <p className="text-2xl font-black text-white">Let's talk</p>
                  <p className="text-sm text-white/50 mt-1">Custom pricing for 31+ staff</p>
                </div>
              ) : (
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">
                      {staffCount} staff × ${billedRate}/staff/mo
                      {includeSms && (
                        <span className="text-violet-400"> (incl. SMS)</span>
                      )}
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
                    <p className="text-xl font-black text-[#6B8FD4]">${billedRate}</p>
                    <p className="text-[10px] text-white/30">/mo</p>
                  </div>
                </div>
              )}
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

          {/* ── Right: what's included ── */}
          <div className="space-y-5">

            {/* Base features */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h3 className="text-sm font-black text-gray-900 mb-4">
                Everything included in every plan
              </h3>
              <ul className="space-y-2.5">
                {BASE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#1B3163] mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-600 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SMS plan callout */}
            <div className={cn(
              "rounded-2xl border p-5 transition-all",
              includeSms
                ? "bg-violet-50 border-violet-200"
                : "bg-gray-50 border-gray-200"
            )}>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className={cn("w-4 h-4 shrink-0", includeSms ? "text-violet-600" : "text-gray-400")} />
                <p className={cn("text-sm font-bold", includeSms ? "text-violet-900" : "text-gray-500")}>
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
                    <Zap className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", includeSms ? "text-violet-500" : "text-gray-300")} />
                    <span className={cn("text-sm leading-snug", includeSms ? "text-violet-700" : "text-gray-400")}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              {!includeSms && (
                <button
                  type="button"
                  onClick={() => setIncludeSms(true)}
                  className="mt-4 text-xs font-bold text-[#1B3163] hover:underline"
                >
                  Add SMS to your plan →
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Enterprise callout */}
        <div className="mt-10 bg-[#0D1B2A] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black text-white">30+ staff or multiple locations?</h3>
            <p className="text-sm text-white/50 mt-1 max-w-lg">
              Custom pricing available for franchises and large teams. Includes dedicated support,
              custom integrations, and SLA guarantees.
            </p>
          </div>
          <a
            href="mailto:hello@getkempt.com"
            className="shrink-0 px-6 py-3 bg-[#1B3163] text-white font-bold text-sm rounded-xl hover:bg-[#243F80] transition-colors whitespace-nowrap"
          >
            Contact us →
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          All prices in AUD · GST applies to Australian businesses · First month free, no credit card required
        </p>
      </div>
    </section>
  );
}
