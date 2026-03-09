"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { UPCOMING_BOOKINGS } from "@/lib/mock/dashboard";
import type { UpcomingBooking, BookingStatus } from "@/types/dashboard";

/* ── Status config ───────────────────────────────── */
const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  upcoming:    { label: "Upcoming",    color: "#1B3163", bg: "#EEF1F8" },
  "in-progress": { label: "In progress", color: "#D97706", bg: "#FEF3C7" },
  completed:   { label: "Completed",   color: "#16A34A", bg: "#DCFCE7" },
  cancelled:   { label: "Cancelled",   color: "#DC2626", bg: "#FEE2E2" },
};

export function UpcomingBookings() {
  return (
    <div
      className="bg-white rounded-2xl flex flex-col h-full"
      style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(27,49,99,0.06)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: "1px solid #F0F3FA" }}
      >
        <div>
          <h2 className="text-base font-semibold" style={{ color: "#1B3163" }}>
            Upcoming Bookings
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#8E95A5" }}>
            Today&apos;s remaining appointments
          </p>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "#1B3163", color: "#EAEAEA" }}
        >
          {UPCOMING_BOOKINGS.length}
        </span>
      </div>

      {/* List */}
      <ul className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "#F0F3FA" }}>
        {UPCOMING_BOOKINGS.map((booking) => (
          <BookingRow key={booking.id} booking={booking} />
        ))}
      </ul>

      {/* Footer */}
      <div
        className="px-5 py-3 shrink-0"
        style={{ borderTop: "1px solid #F0F3FA" }}
      >
        <button
          className="w-full text-xs font-medium py-2 rounded-lg transition-colors"
          style={{ color: "#1B3163", backgroundColor: "#F0F3FA" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#E8ECF4";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F0F3FA";
          }}
        >
          View all bookings →
        </button>
      </div>
    </div>
  );
}

/* ── Individual booking row ─────────────────────── */
function BookingRow({ booking }: { booking: UpcomingBooking }) {
  const status = STATUS_CONFIG[booking.status];
  const serviceNames = booking.services.map((s) => s.name).join(", ");
  const totalDuration = booking.services.reduce((acc, s) => acc + s.duration, 0);

  return (
    <li className="px-5 py-4 flex gap-3 group">
      {/* Client avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: booking.clientAvatarColor, color: "#EAEAEA" }}
      >
        {booking.clientInitials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold truncate" style={{ color: "#1B3163" }}>
            {booking.clientName}
          </p>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
            style={{ color: status.color, backgroundColor: status.bg }}
          >
            {status.label}
          </span>
        </div>

        {/* Services */}
        <p className="text-xs truncate mb-2" style={{ color: "#8E95A5" }}>
          {serviceNames}
        </p>

        {/* Time + staff + price */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#8E95A5" }}>
            <Clock size={11} />
            {booking.startTime} – {booking.endTime}
          </span>
          <span className="text-xs" style={{ color: "#8E95A5" }}>
            · {booking.staffName}
          </span>
          <span className="ml-auto text-xs font-semibold" style={{ color: "#1B3163" }}>
            ${booking.totalPrice}
          </span>
        </div>
      </div>

      {/* Complete button — appears on hover */}
      <button
        className={cn(
          "shrink-0 self-center p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        )}
        style={{ color: "#16A34A" }}
        title="Mark as complete"
        aria-label={`Mark ${booking.clientName} booking as complete`}
      >
        <CheckCircle2 size={18} />
      </button>
    </li>
  );
}
