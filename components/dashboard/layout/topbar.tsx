"use client";

import { Menu, Bell } from "lucide-react";
import { ALERTS } from "@/lib/mock/dashboard";

interface TopbarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export function Topbar({ onMenuToggle, pageTitle = "Dashboard" }: TopbarProps) {
  const unreadCount = ALERTS.filter((a) => !a.read).length;

  return (
    <header
      className="sticky top-0 z-10 flex items-center gap-4 px-5 lg:px-7 h-16 shrink-0 bg-white/80 backdrop-blur-md"
      style={{ borderBottom: "1px solid #E8ECF4" }}
    >
      {/* ── Hamburger — mobile ───────────────────── */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg transition-colors hover:bg-[#F0F3FA] text-[#0D1B2A]"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* ── Page title ───────────────────────────── */}
      <div className="flex-1">
        <h1 className="text-base font-semibold font-sans text-[#0D1B2A]">
          {pageTitle}
        </h1>
      </div>

      {/* ── Right actions ────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-[#F0F3FA] text-[#0D1B2A]"
          aria-label={`${unreadCount} unread notifications`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center leading-none bg-[#C4A882] text-[#0D1B2A]">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
