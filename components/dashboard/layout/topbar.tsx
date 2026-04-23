"use client";

import { Menu, Bell, Search } from "lucide-react";
import { ALERTS } from "@/lib/mock/dashboard";

interface TopbarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
  pageSubtitle?: string;
}

export function Topbar({
  onMenuToggle,
  pageTitle = "Dashboard",
  pageSubtitle,
}: TopbarProps) {
  const unreadCount = ALERTS.filter((a) => !a.read).length;

  return (
    <header
      className="sticky top-0 z-10 flex items-center gap-3 px-4 lg:px-7 h-16 shrink-0"
      style={{
        backgroundColor: "rgba(245, 243, 238, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #E8E4DA",
      }}
    >
      {/* ── Hamburger — mobile ───────────────────── */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 -ml-1 rounded-lg transition-colors hover:bg-black/5 text-[#0B1220]"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* ── Page title ───────────────────────────── */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold font-sans text-[#0B1220] truncate leading-tight">
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <p className="hidden sm:block text-[11px] font-medium text-[#6B7280] truncate leading-tight mt-0.5">
            {pageSubtitle}
          </p>
        )}
      </div>

      {/* ── Right actions ────────────────────────── */}
      <div className="flex items-center gap-1.5">
        {/* Search (desktop) */}
        <button
          className="hidden md:inline-flex items-center gap-2 px-3 h-9 rounded-lg transition-colors text-[#4B5563] bg-white border border-[#E8E4DA] hover:border-[#C4A882]/40 hover:text-[#0B1220]"
          aria-label="Search"
        >
          <Search size={15} />
          <span className="text-xs font-medium">Search</span>
          <kbd className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F5F3EE] border border-[#E8E4DA] text-[#6B7280] ml-2">
            ⌘K
          </kbd>
        </button>

        {/* Search (mobile — icon only) */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors hover:bg-black/5 text-[#0B1220]"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-black/5 text-[#0B1220]"
          aria-label={`${unreadCount} unread notifications`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-black flex items-center justify-center leading-none"
              style={{
                background: "linear-gradient(135deg, #C4A882, #D5B584)",
                color: "#0D1B2A",
                boxShadow: "0 1px 4px rgba(196,168,130,0.4)",
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
