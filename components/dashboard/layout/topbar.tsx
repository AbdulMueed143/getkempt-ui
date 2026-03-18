"use client";

import { Menu, Bell, Search } from "lucide-react";
import { ALERTS } from "@/lib/mock/dashboard";

interface TopbarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export function Topbar({ onMenuToggle, pageTitle = "Dashboard" }: TopbarProps) {
  const unreadCount = ALERTS.filter((a) => !a.read).length;

  return (
    <header
      className="sticky top-0 z-10 flex items-center gap-4 px-6 h-16 shrink-0"
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E8ECF4",
      }}
    >
      {/* ── Hamburger — mobile ───────────────────── */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg transition-colors hover:bg-gray-100"
        style={{ color: "#1B3163" }}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* ── Page title ───────────────────────────── */}
      <div className="flex-1">
        <h1
          className="text-base font-semibold font-sans"
          style={{ color: "#1B3163" }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* ── Right actions ────────────────────────── */}
      <div className="flex items-center gap-2">
      

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: "#1B3163" }}
          aria-label={`${unreadCount} unread notifications`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center leading-none"
              style={{ backgroundColor: "#D5B584", color: "#1B3163" }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
