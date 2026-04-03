"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X, LogOut } from "lucide-react";
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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ───────────────────────────── */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[240px] z-30 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto"  ,
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "#0D1B2A" }}
        aria-label="Sidebar navigation"
      >
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #C4A882 1px, transparent 1px), linear-gradient(#C4A882 1px, transparent 1px)",
            backgroundSize: "48px 24px",
          }}
        />

        {/* ── Logo row ─────────────────────────────── */}
        <div
          className="relative z-10 flex items-center justify-between px-5 py-5 shrink-0"
          style={{ borderBottom: "1px solid rgba(196,168,130,0.1)" }}
        >
          <Link href="/dashboard" className="inline-block focus-visible:outline-none">
            <Image
              src="/assets/logo_partial_white.svg"
              alt="Get Kempt"
              width={110}
              height={52}
              priority
            />
          </Link>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded transition-colors text-white/50 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ──────────────────────────── */}
        <nav className="relative z-10 flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase px-2 mb-2 text-[#C4A882]/40">
                {section.title}
              </p>
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
          className="relative z-10 shrink-0 px-3 py-4"
          style={{ borderTop: "1px solid rgba(196,168,130,0.1)" }}
        >
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-[#C4A882] text-[#0D1B2A]">
              {user
                ? `${user.firstName[0]}${user.lastName[0]}`
                : "GK"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white/90">
                {user ? `${user.firstName} ${user.lastName}` : "Demo User"}
              </p>
              <p className="text-xs truncate text-white/40">
                {user?.businessName ?? "My Business"}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-all duration-200 text-white/40 hover:text-white hover:bg-white/[0.04]"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Individual nav item ─────────────────────────── */
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

  /* ── Coming-soon: non-navigable with tooltip ── */
  if (item.comingSoon) {
    return (
      <li className="group/soon relative">
        <div
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm cursor-default select-none text-white/25"
          style={{ borderLeft: "2px solid transparent" }}
        >
          <Icon size={16} className="shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          <span className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full leading-none shrink-0 bg-amber-500/15 text-amber-400">
            Soon
          </span>
        </div>

        {/* Tooltip — appears to the right of the sidebar */}
        {item.comingSoonDescription && (
          <div
            className={cn(
              "pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50",
              "w-56 rounded-xl p-3 shadow-2xl",
              "opacity-0 group-hover/soon:opacity-100 transition-opacity duration-200",
              "bg-[#0D1B2A] border border-[#C4A882]/15"
            )}
          >
            {/* Arrow pointing left */}
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-[#0D1B2A] border-l border-b border-[#C4A882]/15" />
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                Coming soon
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-white/55">
              {item.comingSoonDescription}
            </p>
          </div>
        )}
      </li>
    );
  }

  /* ── Active / regular item ── */
  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-all duration-200 group relative",
          isActive
            ? "text-[#C4A882] bg-[#C4A882]/[0.08] border-l-2 border-[#C4A882]"
            : "text-white/60 border-l-2 border-transparent hover:text-white/90 hover:bg-white/[0.04]"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon size={16} className="shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none bg-[#C4A882] text-[#0D1B2A]">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}
