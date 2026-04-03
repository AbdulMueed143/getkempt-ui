"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { label: "Features",     href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing",      href: "#pricing" },
  { label: "FAQ",          href: "#faq" },
];

export function LandingNavbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#0D1B2A]/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-[#C4A882]/10"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/assets/logo_partial_white.svg"
            alt="GetKempt"
            width={120}
            height={32}
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-white/60 hover:text-[#C4A882] transition-colors duration-300 font-medium tracking-wide"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white font-medium transition-colors duration-300 px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-gradient-to-r from-[#C4A882] to-[#D5B584] text-[#0D1B2A] hover:from-[#D5C4A8] hover:to-[#E5C594] px-5 py-2 rounded-xl transition-all duration-300"
          >
            Get started free →
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg text-white/70 hover:text-[#C4A882] hover:bg-white/5 transition-colors"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0D1B2A]/98 backdrop-blur-xl border-t border-[#C4A882]/10 px-4 pb-6 pt-2 space-y-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-white/60 hover:text-[#C4A882] font-medium text-sm transition-colors border-b border-white/5"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/login"
              className="text-center py-2.5 text-sm font-medium text-white/70 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-center py-3 text-sm font-semibold bg-gradient-to-r from-[#C4A882] to-[#D5B584] text-[#0D1B2A] rounded-xl"
            >
              Get started free →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
