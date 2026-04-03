"use client";

import { Logo } from "@/components/ui/logo";
import { Shield, Sparkles, Clock, Heart } from "lucide-react";

const HEADLINE = "Where craft meets\nmodern convenience.";
const SUBLINE = "The booking platform built for grooming businesses that take pride in their work.";

const FEATURES = [
  { icon: Sparkles, label: "Smart booking & scheduling" },
  { icon: Heart,    label: "Client management & loyalty" },
  { icon: Clock,    label: "Real-time availability & reminders" },
  { icon: Shield,   label: "Secure, private & compliant" },
];

const SERVICES = ["Barbershops", "Hair Salons", "Nail Studios", "Beauty Spas", "Lash & Brow"];

export function AuthBrandPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between h-full p-12 overflow-hidden"
      style={{ backgroundColor: "#0D1B2A" }}
    >
      {/* ── Layered background — Melbourne laneway atmosphere ── */}

      {/* Warm amber glow — like laneway lighting */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[#C4A882]/[0.06] blur-[150px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#1B3163]/25 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-[#4B2D6E]/10 blur-[120px] pointer-events-none" />

      {/* Brick-like texture overlay — Melbourne laneway feel */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #C4A882 1px, transparent 1px), linear-gradient(#C4A882 1px, transparent 1px)",
          backgroundSize: "48px 24px",
        }}
      />

      {/* Fine noise grain — vintage warmth */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Gold accent line at right edge */}
      <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#C4A882]/15 to-transparent pointer-events-none" />

      {/* ── Top: Logo ───────────────────────────────────── */}
      <div className="relative z-10">
        <Logo variant="white" size="md" />
      </div>

      {/* ── Middle: Hero content ────────────────────────── */}
      <div className="relative z-10 space-y-8">

        {/* Warm accent line */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-[1px] bg-gradient-to-r from-[#C4A882] to-transparent" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[#C4A882]">
            Melbourne, Australia
          </span>
        </div>

        {/* Main headline + subline */}
        <div className="space-y-4">
          <h2 className="font-serif text-4xl xl:text-[2.75rem] leading-[1.15] text-white whitespace-pre-line">
            {HEADLINE}
          </h2>
          <p className="text-sm leading-relaxed text-white/45 max-w-sm">
            {SUBLINE}
          </p>
        </div>

        {/* Feature list — with icons instead of bullets */}
        <ul className="space-y-3.5 pt-2">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-[#C4A882]/10 border border-[#C4A882]/15 flex items-center justify-center shrink-0 group-hover:bg-[#C4A882]/15 transition-colors duration-300">
                <f.icon className="w-3.5 h-3.5 text-[#C4A882]" />
              </div>
              <span className="text-sm text-white/70 font-medium">
                {f.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Service tags */}
        <div className="flex flex-wrap gap-2 pt-2">
          {SERVICES.map((s) => (
            <span
              key={s}
              className="text-xs rounded-full px-3 py-1.5 text-[#C4A882] bg-[#C4A882]/[0.08] border border-[#C4A882]/15 hover:border-[#C4A882]/30 transition-colors duration-300"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── Bottom: Trust signals ─────────────────────────── */}
      <div className="relative z-10 space-y-4">
        {/* Warm divider */}
        <div className="h-[1px] bg-gradient-to-r from-[#C4A882]/20 via-[#C4A882]/10 to-transparent" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs text-white/50">
              Trusted by grooming businesses worldwide
            </span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3 h-3 text-[#C4A882] fill-[#C4A882]" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-white/35 ml-1">4.9</span>
          </div>
        </div>
      </div>
    </div>
  );
}
