"use client";

import Link from "next/link";
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
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ───────────────────────────── */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-[240px] z-30 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "#1B3163" }}
        aria-label="Sidebar navigation"
      >
        {/* ── Logo row ─────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Link href="/dashboard" className="flex items-center gap-2 focus-visible:outline-none">
            {/* Text logo fallback — always visible */}
            <span className="font-serif text-xl leading-none" style={{ color: "#EAEAEA" }}>
              get
            </span>
            <span className="font-serif text-xl leading-none" style={{ color: "#D5B584" }}>
              Kempt
            </span>
            <span style={{ color: "#D5B584", fontSize: "20px", lineHeight: 1 }}>.</span>
          </Link>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded transition-colors"
            style={{ color: "rgba(234,234,234,0.6)" }}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Navigation ──────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p
                className="text-[10px] font-semibold tracking-[0.15em] uppercase px-2 mb-1.5"
                style={{ color: "rgba(234,234,234,0.35)" }}
              >
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
          className="shrink-0 px-3 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-1">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: "#D5B584", color: "#1B3163" }}
            >
              {user
                ? `${user.firstName[0]}${user.lastName[0]}`
                : "GK"}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "#EAEAEA" }}
              >
                {user ? `${user.firstName} ${user.lastName}` : "Demo User"}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "rgba(234,234,234,0.45)" }}
              >
                {user?.businessName ?? "My Business"}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors"
            style={{ color: "rgba(234,234,234,0.5)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#EAEAEA";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(234,234,234,0.5)";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            }}
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

  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-all duration-150 group relative"
        style={{
          color: isActive ? "#D5B584" : "rgba(234,234,234,0.7)",
          backgroundColor: isActive ? "rgba(213,181,132,0.12)" : "transparent",
          borderLeft: isActive ? "2px solid #D5B584" : "2px solid transparent",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLAnchorElement).style.color = "#EAEAEA";
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(255,255,255,0.06)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLAnchorElement).style.color = "rgba(234,234,234,0.7)";
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
          }
        }}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon size={16} className="shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
            style={{ backgroundColor: "#D5B584", color: "#1B3163" }}
          >
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}
