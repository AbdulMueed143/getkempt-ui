"use client";

import { STAFF_CAL_COLORS, BOOKING_STATUS_STYLES, type Booking } from "@/types/booking";
import { bookingTop, bookingHeight } from "@/lib/utils/booking-slots";
import { cn } from "@/lib/utils/cn";

interface BookingBlockProps {
  booking:    Booking;
  lane:       number;
  totalLanes: number;
  onClick:    (booking: Booking) => void;
}

/*
 * Render a booking as an absolutely-positioned block inside a day column.
 *
 * Layout maths (all in %):
 *   left  = lane  / totalLanes * 100%  + gap
 *   width = 1     / totalLanes * 100%  - gap*2
 *
 * A 2 px inset gap on each side keeps adjacent blocks visually separated.
 */
export function BookingBlock({ booking, lane, totalLanes, onClick }: BookingBlockProps) {
  const color  = STAFF_CAL_COLORS[booking.staffId] ?? "#1B3163";
  const top    = bookingTop(booking.startAt);
  const height = bookingHeight(booking.durationMinutes);

  /* Fractional width/left so overlapping blocks tile neatly */
  const GAP_PX   = 2;
  const widthPct = 100 / totalLanes;
  const leftPct  = (lane / totalLanes) * 100;

  const startLabel = new Date(booking.startAt).toLocaleTimeString("en-AU", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  const isCancelled = booking.status === "cancelled";
  const isNoShow    = booking.status === "no_show";
  const dim         = isCancelled || isNoShow;

  return (
    <button
      type="button"
      onClick={() => onClick(booking)}
      className={cn(
        "absolute rounded-lg overflow-hidden text-left transition-all",
        "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1",
        "hover:brightness-90 hover:z-20 hover:shadow-md",
        dim && "opacity-50"
      )}
      style={{
        top:             `${top}px`,
        height:          `${height}px`,
        left:            `calc(${leftPct}% + ${GAP_PX}px)`,
        width:           `calc(${widthPct}% - ${GAP_PX * 2}px)`,
        /* Solid tinted background instead of a nearly-invisible wash */
        backgroundColor: `${color}22`,
        borderLeft:      `3px solid ${color}`,
      }}
    >
      {/* Inner content */}
      <div className="px-1.5 py-1 h-full flex flex-col overflow-hidden gap-0.5">
        {/* Client name — always shown */}
        <p
          className="text-[11px] font-bold leading-tight truncate"
          style={{ color }}
        >
          {booking.clientName}
        </p>

        {/* Service name — only if there's vertical space (≥ 34 px) */}
        {height >= 34 && (
          <p className="text-[10px] text-gray-600 leading-tight truncate">
            {booking.serviceName}
          </p>
        )}

        {/* Time label — only in taller blocks (≥ 54 px) */}
        {height >= 54 && (
          <p className="text-[10px] text-gray-400 leading-tight mt-auto truncate">
            {startLabel}
          </p>
        )}
      </div>

      {/* Status indicator dot — shown for non-confirmed bookings */}
      {booking.status !== "confirmed" && (
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full ring-1 ring-white"
          style={{ backgroundColor: BOOKING_STATUS_STYLES[booking.status].text }}
        />
      )}

      {/* Staff colour strip along the top for quick visual scanning */}
      <div
        className="absolute top-0 inset-x-0 h-0.5"
        style={{ backgroundColor: color }}
      />
    </button>
  );
}

/* ── Compact pill for month-view day cells ───────────────────── */
export function BookingPill({
  booking,
  onClick,
}: {
  booking: Booking;
  onClick: (b: Booking) => void;
}) {
  const color = STAFF_CAL_COLORS[booking.staffId] ?? "#1B3163";

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(booking); }}
      className="w-full flex items-center gap-1 px-1.5 py-0.5 rounded text-left hover:brightness-95 transition-all"
      style={{ backgroundColor: `${color}20` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-[11px] font-semibold truncate" style={{ color }}>
        {booking.clientName}
      </span>
    </button>
  );
}
