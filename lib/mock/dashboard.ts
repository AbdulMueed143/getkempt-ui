import {
  LayoutDashboard,
  UserPlus,
  Scissors,
  PackagePlus,
  Gift,
  Users,
  Settings,
  Store,
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  Clock,
  CalendarPlus,
  UserRoundPlus,
  ListPlus,
  AlarmClock,
  CalendarRange,
  BookOpen,
  BarChart3,
  BellRing,
  Star,
  CreditCard,
  FileText,
  Globe,
  UserCircle2,
  Plug2,
  ListOrdered,
  TicketPercent,
} from "lucide-react";
import type {
  StatCardData,
  ChartDataPoint,
  UpcomingBooking,
  QuickAction,
  AlertItem,
  NavSection,
} from "@/types/dashboard";

/* ── Navigation ─────────────────────────────────── */
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard",    href: "/dashboard", icon: LayoutDashboard },
      { label: "All Bookings", href: "/bookings",  icon: CalendarRange, badge: 3 },
      { label: "All Clients",  href: "/clients",   icon: Users },
      {
        label: "Reports & Analytics",
        href: "/reports",
        icon: BarChart3,
        comingSoon: true,
        comingSoonDescription:
          "Revenue by staff, service & date range. Rebooking rates, peak-hour heatmaps, and capacity utilisation charts you can export to CSV.",
      },
    ],
  },
  {
    title: "Manage",
    items: [
      { label: "Staff",          href: "/staff",        icon: UserPlus },
      { label: "Availability",   href: "/availability", icon: Clock },
      { label: "Visits",         href: "/visits",       icon: CalendarCheck2 },
      { label: "Services",       href: "/services",     icon: Scissors },
      { label: "Packages",       href: "/packages",     icon: PackagePlus },
      { label: "Loyalty System", href: "/loyalty",      icon: Gift },
      // {
      //   label: "Waitlist",
      //   href: "/waitlist",
      //   icon: ListOrdered,
      //   comingSoon: true,
      //   comingSoonDescription:
      //     "Let clients join a waitlist when a slot is fully booked. The moment a cancellation comes in the next eligible client is notified automatically.",
      // },
      // {
      //   label: "Gift Cards",
      //   href: "/gift-cards",
      //   icon: TicketPercent,
      //   comingSoon: true,
      //   comingSoonDescription:
      //     "Create and sell digital gift cards in any denomination. Clients redeem them at checkout — balances are tracked automatically against their account.",
      // },
    ],
  },
  {
    title: "Communicate",
    items: [
      { label: "Automated Reminders", href: "/reminders", icon: BellRing },
      {
        label: "Reviews",
        href: "/reviews",
        icon: Star,
        comingSoon: true,
        comingSoonDescription:
          "Automatically request a Google or in-app review after every completed appointment. Track average rating and respond to feedback from one place.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        label: "Checkout & POS",
        href: "/checkout",
        icon: CreditCard,
        comingSoon: true,
        comingSoonDescription:
          "Accept deposits at booking time and collect balances in-store. Supports tap, card, and cash with automatic receipt generation and tip tracking.",
      },
      {
        label: "Invoices & Tax",
        href: "/invoices",
        icon: FileText,
        comingSoon: true,
        comingSoonDescription:
          "Generate GST-compliant invoices for every transaction. Bulk export to Xero or MYOB at month-end with a single click.",
      },
    ],
  },
  // {
  //   title: "Online Presence",
  //   items: [
  //     {
  //       label: "Booking Widget",
  //       href: "/booking-widget",
  //       icon: Globe,
  //       comingSoon: true,
  //       comingSoonDescription:
  //         "Embed a public booking page on your website or share a short link anywhere. Clients self-book in under 60 seconds — no app download required.",
  //     },
  //     {
  //       label: "Client Portal",
  //       href: "/client-portal",
  //       icon: UserCircle2,
  //       comingSoon: true,
  //       comingSoonDescription:
  //         "Give each client their own login to manage upcoming bookings, view loyalty rewards, update contact details, and download past invoices.",
  //     },
  //   ],
  // },
  {
    title: "Settings",
    items: [
      { label: "Store Settings", href: "/settings/store",   icon: Settings },
      { label: "Store Profile",  href: "/settings/profile", icon: Store },
      {
        label: "Integrations",
        href: "/settings/integrations",
        icon: Plug2,
        comingSoon: true,
        comingSoonDescription:
          "Connect Google Calendar, Xero, Mailchimp, Stripe, and Square through a single integrations hub — no developer needed.",
      },
    ],
  },
];

/* ── Stat Cards ─────────────────────────────────── */
export const STAT_CARDS: StatCardData[] = [
  {
    id: "todays-bookings",
    label: "Today's Bookings",
    value: "12",
    subValue: "3 in progress",
    trend: { direction: "up", value: "8%", label: "vs yesterday" },
    icon: CalendarDays,
    accentColor: "#1B3163",
  },
  {
    id: "upcoming",
    label: "Upcoming Today",
    value: "8",
    subValue: "Next at 2:30 PM",
    trend: { direction: "neutral", value: "Same", label: "as yesterday" },
    icon: AlarmClock,
    accentColor: "#D5B584",
  },
  {
    id: "completed",
    label: "Completed",
    value: "4",
    subValue: "of 12 booked",
    trend: { direction: "up", value: "33%", label: "completion rate" },
    icon: ClipboardList,
    accentColor: "#22C55E",
  },
  {
    id: "revenue",
    label: "Today's Revenue",
    value: "$1,240",
    subValue: "4 transactions",
    trend: { direction: "up", value: "12%", label: "vs yesterday" },
    icon: Gift,
    accentColor: "#9FB2D9",
  },
];

/* ── Chart Data — last 7 days ───────────────────── */
export const CHART_DATA: ChartDataPoint[] = [
  { date: "2026-03-03", displayDate: "Mon 3", bookings: 14, revenue: 1820, loyaltyVisits: 8 },
  { date: "2026-03-04", displayDate: "Tue 4", bookings: 9,  revenue: 1100, loyaltyVisits: 5 },
  { date: "2026-03-05", displayDate: "Wed 5", bookings: 18, revenue: 2400, loyaltyVisits: 11 },
  { date: "2026-03-06", displayDate: "Thu 6", bookings: 12, revenue: 1560, loyaltyVisits: 7 },
  { date: "2026-03-07", displayDate: "Fri 7", bookings: 22, revenue: 3100, loyaltyVisits: 15 },
  { date: "2026-03-08", displayDate: "Sat 8", bookings: 6,  revenue: 720,  loyaltyVisits: 3 },
  { date: "2026-03-09", displayDate: "Sun 9", bookings: 12, revenue: 1240, loyaltyVisits: 6 },
];

/* ── Upcoming Bookings ──────────────────────────── */
export const UPCOMING_BOOKINGS: UpcomingBooking[] = [
  {
    id: "b1",
    clientName: "Mueez M.",
    clientInitials: "MM",
    clientAvatarColor: "#1B3163",
    staffName: "Alex",
    staffInitials: "AL",
    services: [
      { name: "Haircut", duration: 30 },
      { name: "Styling", duration: 15 },
    ],
    startTime: "2:30 PM",
    endTime: "3:15 PM",
    status: "upcoming",
    totalPrice: 65,
  },
  {
    id: "b2",
    clientName: "Sarah K.",
    clientInitials: "SK",
    clientAvatarColor: "#D5B584",
    staffName: "Jamie",
    staffInitials: "JM",
    services: [
      { name: "Colour", duration: 60 },
      { name: "Blowout", duration: 30 },
    ],
    startTime: "3:30 PM",
    endTime: "5:00 PM",
    status: "upcoming",
    totalPrice: 180,
  },
  {
    id: "b3",
    clientName: "James T.",
    clientInitials: "JT",
    clientAvatarColor: "#22C55E",
    staffName: "Alex",
    staffInitials: "AL",
    services: [{ name: "Beard Trim", duration: 20 }],
    startTime: "5:15 PM",
    endTime: "5:35 PM",
    status: "upcoming",
    totalPrice: 30,
  },
  {
    id: "b4",
    clientName: "Priya N.",
    clientInitials: "PN",
    clientAvatarColor: "#9FB2D9",
    staffName: "Casey",
    staffInitials: "CS",
    services: [
      { name: "Manicure", duration: 45 },
      { name: "Pedicure", duration: 45 },
    ],
    startTime: "6:00 PM",
    endTime: "7:30 PM",
    status: "upcoming",
    totalPrice: 110,
  },
  {
    id: "b5",
    clientName: "David L.",
    clientInitials: "DL",
    clientAvatarColor: "#86B0A5",
    staffName: "Alex",
    staffInitials: "AL",
    services: [{ name: "Haircut", duration: 30 }],
    startTime: "7:30 PM",
    endTime: "8:00 PM",
    status: "upcoming",
    totalPrice: 45,
  },
];

/* ── Quick Actions ──────────────────────────────── */
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "add-booking",
    label: "New Booking",
    description: "Schedule an appointment for a client",
    icon: CalendarPlus,
    href: "/bookings",
    accentColor: "#1B3163",
  },
  {
    id: "add-staff",
    label: "Add Staff",
    description: "Add a new team member",
    icon: UserRoundPlus,
    href: "/staff",
    accentColor: "#D5B584",
  },
  {
    id: "add-service",
    label: "Add Service",
    description: "Create a new service offering",
    icon: ListPlus,
    href: "/services",
    accentColor: "#9FB2D9",
  },
  {
    id: "set-hours",
    label: "Set Availability",
    description: "Manage staff schedules & hours",
    icon: Clock,
    href: "/availability",
    accentColor: "#22C55E",
  },
];

/* ── Alerts ─────────────────────────────────────── */
export const ALERTS: AlertItem[] = [
  {
    id: "a1",
    severity: "warning",
    title: "Staff availability gap",
    description: "Alex hasn't set availability for tomorrow.",
    time: "10 min ago",
    actionLabel: "Resolve",
    actionHref: "/availability",
    read: false,
  },
  {
    id: "a2",
    severity: "warning",
    title: "Unassigned bookings",
    description: "3 bookings have no staff member assigned.",
    time: "32 min ago",
    actionLabel: "Assign now",
    actionHref: "/bookings",
    read: false,
  },
  {
    id: "a3",
    severity: "info",
    title: "New client registered",
    description: "Priya N. signed up via your booking link.",
    time: "1 hr ago",
    actionLabel: "View client",
    actionHref: "/clients",
    read: true,
  },
  {
    id: "a4",
    severity: "success",
    title: "Loyalty milestone reached",
    description: "David L. earned a free haircut reward.",
    time: "2 hrs ago",
    read: true,
  },
];
