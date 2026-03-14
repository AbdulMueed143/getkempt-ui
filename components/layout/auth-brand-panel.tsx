"use client";

import { Logo } from "@/components/ui/logo";

const HEADLINE = "Run your grooming business without the chaos.";
const SUBLINE = "Built in Melbourne. Made for every chair, station & studio.";

const FEATURES = [
  { icon: "✦", label: "Smart booking & scheduling" },
  { icon: "✦", label: "Client management & loyalty" },
  { icon: "✦", label: "Works for barbershops, salons & studios" },
  { icon: "✦", label: "Real-time availability & reminders" },
];

const SERVICES = ["Barbershops", "Hair Salons", "Nail Studios", "Beauty Spas", "Lash & Brow"];

export function AuthBrandPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between h-full p-12 overflow-hidden"
      style={{ backgroundColor: "#1B3163" }}
    >
      {/* ── Subtle texture — warm sand grid, low opacity ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="gk-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#D5B584" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gk-grid)" />
      </svg>

      {/* Warm sand radial glow — top right, keeps the blue clearly blue */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-warm-sand/10 blur-[80px] pointer-events-none" />

      {/* ── Top: Logo ───────────────────────────────────── */}
      <div className="relative z-10">
        <Logo variant="white" size="md" />
      </div>

      {/* ── Middle: Hero content ────────────────────────── */}
      <div className="relative z-10 space-y-8">

        {/* Melbourne label */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-[1.5px]" style={{ backgroundColor: "#D5B584" }} />
          <span
            className="text-xs font-medium tracking-[0.2em] uppercase"
            style={{ color: "#D5B584" }}
          >
            Melbourne, Australia
          </span>
        </div>

        {/* Main headline + subline */}
        <div className="space-y-3">
          <h2
            className="font-serif text-4xl xl:text-[2.75rem] leading-[1.15]"
            style={{ color: "#EAEAEA" }}
          >
            {HEADLINE}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#9FB2D9" }}>
            {SUBLINE}
          </p>
        </div>

        {/* Feature list */}
        <ul className="space-y-3 pt-1">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex items-center gap-3">
              <span className="text-[10px] mt-px shrink-0" style={{ color: "#D5B584" }}>
                {f.icon}
              </span>
              <span className="text-sm font-sans" style={{ color: "#EAEAEA" }}>
                {f.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Service tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {SERVICES.map((s) => (
            <span
              key={s}
              className="text-xs font-sans rounded-full px-3 py-1"
              style={{
                color: "#D5B584",
                backgroundColor: "rgba(213,181,132,0.12)",
                border: "1px solid rgba(213,181,132,0.3)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── Bottom: Trust badge ─────────────────────────── */}
      <div className="relative z-10">
        <div
          className="inline-flex items-center gap-2.5 rounded-full px-4 py-2.5"
          style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-xs font-sans" style={{ color: "rgba(234,234,234,0.85)" }}>
            Trusted by grooming businesses across World
          </span>
        </div>
      </div>
    </div>
  );
}
