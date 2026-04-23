"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_SECTIONS } from "@/lib/mock/dashboard";
import { useAuth } from "@/hooks/use-auth";
import type { NavItem } from "@/types/dashboard";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <>
      {/* ── Mobile backdrop ─────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ───────────────────────────── */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[260px] z-30 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          backgroundColor: "#0D1B2A",
          borderRight: "1px solid rgba(196,168,130,0.08)",
        }}
        aria-label="Sidebar navigation"
      >
        {/* Subtle warm ambient glow in the top area */}
        <div
          className="absolute top-0 left-0 right-0 h-40 pointer-events-none opacity-70"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(196,168,130,0.06), transparent 70%)",
          }}
        />

        {/* ── Logo row ─────────────────────────────── */}
        <div
          className="relative z-10 flex items-center justify-between px-5 py-6 shrink-0"
          style={{ borderBottom: "1px solid rgba(196,168,130,0.08)" }}
        >
          <Link href="/dashboard" className="inline-block focus-visible:outline-none">
            <Image
              src="/assets/logo_partial_white.svg"
              alt="Get Kempt"
              width={115}
              height={32}
              priority
            />
          </Link>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg transition-colors text-white/60 hover:text-white hover:bg-white/5"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ──────────────────────────── */}
        {/* overflow-y-auto + overflow-x-hidden prevents the
            horizontal scrollbar browsers would otherwise create. */}
        <nav className="scrollbar-dark relative z-10 flex-1 overflow-y-auto overflow-x-hidden py-5 px-3 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 px-2 mb-2">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#C4A882]/70">
                  {section.title}
                </p>
                <div
                  className="flex-1 h-px"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(196,168,130,0.15), transparent)",
                  }}
                />
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    onClick={onClose}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── User footer ─────────────────────────── */}
        <div
          className="relative z-10 shrink-0 p-3"
          style={{ borderTop: "1px solid rgba(196,168,130,0.08)" }}
        >
          <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-2">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg, #C4A882, #D5B584)",
                color: "#0D1B2A",
              }}
            >
              {user
                ? `${user.firstName[0]}${user.lastName[0]}`
                : "GK"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">
                {user ? `${user.firstName} ${user.lastName}` : "Demo User"}
              </p>
              <p className="text-[11px] truncate text-white/55">
                {user?.businessName ?? "My Business"}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 text-white/60 hover:text-white hover:bg-white/[0.06] group"
          >
            <span className="flex items-center gap-2.5">
              <LogOut size={15} />
              <span className="font-medium">Sign out</span>
            </span>
            <ChevronRight
              size={14}
              className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#C4A882]"
            />
          </button>
        </div>
      </aside>
    </>
  );
}

/* ─────────────────────────────────────────────────
   Individual nav item — regular, active & coming-soon
   ───────────────────────────────────────────────── */
function SidebarNavItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  /* ── Coming-soon: non-navigable with portal-based tooltip ── */
  if (item.comingSoon) {
    return <ComingSoonItem item={item} />;
  }

  /* ── Active / regular item ── */
  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative font-medium",
          isActive
            ? "text-[#0D1B2A] bg-gradient-to-r from-[#C4A882] to-[#D5B584] shadow-lg shadow-[#C4A882]/20"
            : "text-white/75 hover:text-white hover:bg-white/[0.06]"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon
          size={16}
          className={cn(
            "shrink-0 transition-colors",
            isActive ? "text-[#0D1B2A]" : "text-white/60 group-hover:text-[#C4A882]"
          )}
        />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span
            className={cn(
              "text-[10px] font-black px-1.5 py-0.5 rounded-md leading-none",
              isActive
                ? "bg-[#0D1B2A]/15 text-[#0D1B2A]"
                : "bg-[#C4A882] text-[#0D1B2A]"
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}

/* ─────────────────────────────────────────────────
   Coming-soon nav item — uses a portal tooltip so
   it escapes the sidebar's overflow-hidden container.
   ───────────────────────────────────────────────── */
function ComingSoonItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function handleEnter() {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
  }

  function handleLeave() {
    setCoords(null);
  }

  return (
    <li className="relative">
      <div
        ref={triggerRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        tabIndex={0}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-default select-none text-white/45 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C4A882]/50"
      >
        <Icon size={16} className="shrink-0 opacity-70" />
        <span className="flex-1 truncate font-medium">{item.label}</span>
        <span className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-md leading-none shrink-0 bg-amber-500/15 text-amber-300">
          Soon
        </span>
      </div>

      {/* Portal tooltip — only desktop, to avoid hover issues on touch */}
      {mounted && coords && item.comingSoonDescription &&
        createPortal(
          <div
            className="hidden lg:block pointer-events-none fixed z-[100] w-64 rounded-xl p-3.5 shadow-2xl animate-in fade-in duration-150"
            style={{
              top: coords.top,
              left: coords.left,
              transform: "translateY(-50%)",
              backgroundColor: "#0D1B2A",
              border: "1px solid rgba(196,168,130,0.22)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
            }}
            role="tooltip"
          >
            <div
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45"
              style={{
                backgroundColor: "#0D1B2A",
                borderLeft: "1px solid rgba(196,168,130,0.22)",
                borderBottom: "1px solid rgba(196,168,130,0.22)",
              }}
            />
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300">
                Coming soon
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-white/70">
              {item.comingSoonDescription}
            </p>
          </div>,
          document.body,
        )}
    </li>
  );
}
