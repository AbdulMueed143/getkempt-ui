import type { LucideIcon } from "lucide-react";

/* ── Stats ─────────────────────────────────────── */
export interface StatCardData {
  id: string;
  label: string;
  value: string;
  subValue?: string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
    label: string;
  };
  icon: LucideIcon;
  accentColor: string;
}

/* ── Chart ─────────────────────────────────────── */
export interface ChartDataPoint {
  date: string;
  displayDate: string;
  bookings: number;
  revenue: number;
  loyaltyVisits: number;
}

/* ── Bookings ──────────────────────────────────── */
export type BookingStatus = "upcoming" | "in-progress" | "completed" | "cancelled";

export interface BookingService {
  name: string;
  duration: number; // minutes
}

export interface UpcomingBooking {
  id: string;
  clientName: string;
  clientInitials: string;
  clientAvatarColor: string;
  staffName: string;
  staffInitials: string;
  services: BookingService[];
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalPrice: number;
}

/* ── Quick Actions ─────────────────────────────── */
export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  accentColor: string;
}

/* ── Alerts ────────────────────────────────────── */
export type AlertSeverity = "warning" | "info" | "error" | "success";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  time: string;
  actionLabel?: string;
  actionHref?: string;
  read: boolean;
}

/* ── Nav ───────────────────────────────────────── */
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  /** When true the item is non-navigable and shows a "Soon" badge */
  comingSoon?: boolean;
  /** Short sentence shown in the hover tooltip for coming-soon items */
  comingSoonDescription?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}
