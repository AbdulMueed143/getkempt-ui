"use client";

import { CheckCircle2, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { UPCOMING_BOOKINGS } from "@/lib/mock/dashboard";
import type { UpcomingBooking, BookingStatus } from "@/types/dashboard";

/* ── Status config ───────────────────────────────── */
const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  upcoming: {
    label: "Upcoming",
    color: "#1B3163",
    bg: "#EEF1F8",
    border: "#CBD5ED",
  },
  "in-progress": {
    label: "In progress",
    color: "#A16207",
    bg: "#FEF9C3",
    border: "#FDE047",
  },
  completed: {
    label: "Completed",
    color: "#047857",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  cancelled: {
    label: "Cancelled",
    color: "#B91C1C",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
};

export function UpcomingBookings() {
  return (
    <div
      className="bg-white rounded-2xl flex flex-col h-full overflow-hidden"
      style={{
        border: "1px solid #E8E4DA",
        boxShadow:
          "0 1px 2px rgba(11,18,32,0.04), 0 1px 3px rgba(11,18,32,0.04)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: "1px solid #F0EEE6" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: "#EEF1F8",
              border: "1px solid #CBD5ED",
            }}
          >
            <Calendar size={17} className="text-[#1B3163]" strokeWidth={2.25} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-[#0B1220] leading-tight">
              Upcoming Bookings
            </h2>
            <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">
              Today&apos;s remaining appointments
            </p>
          </div>
        </div>
        <span
          className="text-[11px] font-black px-2.5 py-1 rounded-full leading-none"
          style={{
            background: "linear-gradient(135deg, #1B3163, #2A4A8C)",
            color: "#EAEAEA",
          }}
        >
          {UPCOMING_BOOKINGS.length}
        </span>
      </div>

      {/* List */}
      {UPCOMING_BOOKINGS.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2 px-5">
          <CheckCircle2 size={28} className="text-[#86B0A5]" />
          <p className="text-sm font-semibold text-[#0B1220]">
            All caught up
          </p>
          <p className="text-xs text-[#6B7280] text-center">
            No more bookings today.
          </p>
        </div>
      ) : (
        <ul
          className="flex-1 overflow-y-auto divide-y"
          style={{ borderColor: "#F0EEE6" }}
        >
          {UPCOMING_BOOKINGS.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </ul>
      )}

      {/* Footer */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderTop: "1px solid #F0EEE6" }}
      >
        <Link
          href="/bookings"
          className="flex items-center justify-center gap-1.5 w-full text-xs font-bold py-2.5 rounded-lg transition-colors text-[#1B3163] bg-[#EEF1F8] hover:bg-[#DDE4F1]"
        >
          View all bookings
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

/* ── Individual booking row ─────────────────────── */
function BookingRow({ booking }: { booking: UpcomingBooking }) {
  const status = STATUS_CONFIG[booking.status];
  const serviceNames = booking.services.map((s) => s.name).join(", ");

  return (
    <li className="px-5 py-3.5 flex gap-3 group hover:bg-[#FAF8F3] transition-colors">
      {/* Client avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ring-2 ring-white"
        style={{
          backgroundColor: booking.clientAvatarColor,
          color: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(11,18,32,0.15)",
        }}
      >
        {booking.clientInitials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className="text-sm font-bold truncate text-[#0B1220]">
            {booking.clientName}
          </p>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 leading-none"
            style={{
              color: status.color,
              backgroundColor: status.bg,
              border: `1px solid ${status.border}`,
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Services */}
        <p className="text-xs truncate mb-1.5 text-[#4B5563] font-medium">
          {serviceNames}
        </p>

        {/* Time + staff + price */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] text-[#6B7280] font-medium">
            <Clock size={11} />
            {booking.startTime} – {booking.endTime}
          </span>
          <span className="text-[11px] text-[#6B7280]">·</span>
          <span className="text-[11px] text-[#6B7280] font-medium truncate">
            {booking.staffName}
          </span>
          <span className="ml-auto text-[13px] font-bold text-[#0B1220]">
            ${booking.totalPrice}
          </span>
        </div>
      </div>

      {/* Complete button — appears on hover */}
      <button
        className={cn(
          "shrink-0 self-center p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 text-[#047857] hover:bg-[#ECFDF5]"
        )}
        title="Mark as complete"
        aria-label={`Mark ${booking.clientName} booking as complete`}
      >
        <CheckCircle2 size={18} />
      </button>
    </li>
  );
}
