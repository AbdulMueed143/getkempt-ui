"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Plus, ChevronLeft, ChevronRight,
  Calendar, LayoutGrid, CalendarDays,
  CheckCircle2, XCircle, Clock, AlertCircle,
} from "lucide-react";
import { MonthView }  from "./month-view";
import { WeekView }   from "./week-view";
import { DayView }    from "./day-view";
import { CreateBookingSlideover } from "./create-booking-slideover";
import { MOCK_BOOKINGS } from "@/lib/mock/bookings";
import type { Booking } from "@/types/booking";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
  STAFF_CAL_COLORS,
} from "@/types/booking";
import {
  weekStart, weekDays as getWeekDays, isSameDay,
  formatMonthYear, formatWeekRange, formatShortDate,
} from "@/lib/utils/booking-slots";
import { useToast } from "@/hooks/use-toast";
import { useQuickActionStore } from "@/store/quick-action-store";
import { cn } from "@/lib/utils/cn";

type CalView = "day" | "week" | "month";

const VIEW_ICONS: Record<CalView, React.ElementType> = {
  day:   CalendarDays,
  week:  LayoutGrid,
  month: Calendar,
};

/* ── Booking detail popup ───────────────────────────────────── */
function BookingDetailPopup({
  booking,
  onClose,
  onEdit,
  onCancel,
}: {
  booking: Booking;
  onClose:  () => void;
  onEdit:   (b: Booking) => void;
  onCancel: (id: string) => void;
}) {
  const s = BOOKING_STATUS_STYLES[booking.status];
  const color = STAFF_CAL_COLORS[booking.staffId] ?? "#1B3163";

  const start = new Date(booking.startAt).toLocaleTimeString("en-AU", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
  const end = new Date(booking.endAt).toLocaleTimeString("en-AU", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
  const dateStr = new Date(booking.startAt).toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Colour accent */}
        <div className="h-1.5" style={{ backgroundColor: color }} />

        <div className="p-5 space-y-4">
          {/* Client + status */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">{booking.clientName}</h3>
              {booking.clientPhone && (
                <a href={`tel:${booking.clientPhone}`} className="text-xs text-[#1B3163] hover:underline">{booking.clientPhone}</a>
              )}
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0"
              style={{ color: s.text, backgroundColor: s.bg, borderColor: s.border }}
            >
              {BOOKING_STATUS_LABELS[booking.status]}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            {[
              { icon: CalendarDays, label: dateStr },
              { icon: Clock,        label: `${start} – ${end} (${booking.durationMinutes}m)` },
              { icon: () => <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />, label: booking.staffName },
              { icon: AlertCircle,  label: booking.serviceName },
              { icon: CheckCircle2, label: `$${booking.price}` },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-gray-600">
                <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>

          {booking.notes && (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 italic">
              "{booking.notes}"
            </p>
          )}

          {/* Source badge */}
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            Source: {booking.source.replace("_", " ")}
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { onEdit(booking); onClose(); }}
              className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold text-[#1B3163] bg-[#EEF1F8] hover:bg-[#D5DFF0] transition-colors"
            >
              Edit
            </button>
            {booking.status !== "cancelled" && (
              <button
                type="button"
                onClick={() => { onCancel(booking.id); onClose(); }}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export function BookingsPageClient() {
  const toast   = useToast();
  const today   = new Date();

  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [view,     setView]     = useState<CalView>("week");
  const [curDate,  setCurDate]  = useState(today);

  const [showCreate,   setShowCreate]   = useState(false);
  const [editBooking,  setEditBooking]  = useState<Booking | null>(null);
  const [detailBooking,setDetailBooking]= useState<Booking | null>(null);

  /* Open create slideover automatically when navigated from a quick action */
  const { pendingAction, clear: clearPending } = useQuickActionStore();
  useEffect(() => {
    if (pendingAction === "booking") {
      setShowCreate(true);
      clearPending();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Navigation ── */
  function navigate(dir: 1 | -1) {
    setCurDate((d) => {
      const next = new Date(d);
      if (view === "day")   next.setDate(next.getDate()  + dir);
      if (view === "week")  next.setDate(next.getDate()  + dir * 7);
      if (view === "month") next.setMonth(next.getMonth()+ dir);
      return next;
    });
  }

  function goToday() { setCurDate(new Date()); }

  /* ── Label for header ── */
  function navLabel() {
    if (view === "day")   return formatShortDate(curDate);
    if (view === "week")  return formatWeekRange(weekStart(curDate));
    return formatMonthYear(curDate);
  }

  /* ── Booking mutations ── */
  const handleSave = useCallback(
    (data: Omit<Booking, "id" | "createdAt">) => {
      if (editBooking) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === editBooking.id ? { ...b, ...data } : b
          )
        );
        toast.success({ title: "Booking updated" });
        setEditBooking(null);
      } else {
        const newBk: Booking = {
          ...data,
          id:        `bk-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        setBookings((prev) => [...prev, newBk]);
        toast.success({ title: "Booking confirmed", message: `${data.clientName} — ${data.serviceName}` });
      }
    },
    [editBooking, toast]
  );

  const handleCancel = useCallback(
    (id: string) => {
      setBookings((prev) =>
        prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b)
      );
      toast.info({ title: "Booking cancelled" });
    },
    [toast]
  );

  /* ── Today stats (mini bar) ── */
  const todayBks = bookings.filter((b) => isSameDay(new Date(b.startAt), today));
  const stats = {
    confirmed: todayBks.filter((b) => b.status === "confirmed").length,
    completed: todayBks.filter((b) => b.status === "completed").length,
    cancelled: todayBks.filter((b) => b.status === "cancelled").length,
    noShow:    todayBks.filter((b) => b.status === "no_show").length,
  };

  /* ── Week/month start for views ── */
  const monday = weekStart(curDate);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] min-h-0 -mt-1">
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-1 py-2 shrink-0 flex-wrap">
        {/* Today stats */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <span className="text-gray-500 font-medium mr-1">Today</span>
          {[
            { icon: CheckCircle2, label: `${stats.confirmed} confirmed`, color: "text-[#1B3163]" },
            { icon: CheckCircle2, label: `${stats.completed} completed`, color: "text-emerald-600" },
            { icon: XCircle,      label: `${stats.noShow} no-show`,      color: "text-rose-500" },
          ].map(({ icon: Icon, label, color }) => (
            <span key={label} className={cn("flex items-center gap-1", color)}>
              <Icon className="w-3.5 h-3.5" />{label}
            </span>
          ))}
        </div>

        <div className="flex-1" />

        {/* View switcher */}
        <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
          {(["day", "week", "month"] as CalView[]).map((v) => {
            const Icon = VIEW_ICONS[v];
            return (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                  view === v
                    ? "bg-white text-[#1B3163] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{v}</span>
              </button>
            );
          })}
        </div>

        {/* New booking button */}
        <button
          type="button"
          onClick={() => { setEditBooking(null); setShowCreate(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-[#1B3163] hover:bg-[#152748] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Booking</span>
        </button>
      </div>

      {/* ── Calendar nav bar ── */}
      <div className="flex items-center gap-2 px-1 py-2 shrink-0 border-b border-gray-100">
        <button type="button" onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button type="button" onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
        <h2 className="text-sm font-semibold text-gray-800 flex-1">{navLabel()}</h2>
        <button
          type="button"
          onClick={goToday}
          className="text-xs font-semibold text-[#1B3163] bg-[#EEF1F8] hover:bg-[#D5DFF0] px-3 py-1.5 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* ── Calendar body ── */}
      <div className="flex-1 min-h-0 overflow-hidden bg-white rounded-xl border border-gray-100 mt-1">
        {view === "month" && (
          <MonthView
            currentDate={curDate}
            bookings={bookings}
            onDayClick={(d) => { setCurDate(d); setView("day"); }}
            onBooking={setDetailBooking}
          />
        )}

        {view === "week" && (
          <WeekView
            monday={monday}
            bookings={bookings}
            onBooking={setDetailBooking}
          />
        )}

        {view === "day" && (
          <DayView
            date={curDate}
            bookings={bookings}
            onBooking={setDetailBooking}
          />
        )}
      </div>

      {/* ── Booking detail popup ── */}
      {detailBooking && (
        <BookingDetailPopup
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
          onEdit={(b) => { setEditBooking(b); setShowCreate(true); }}
          onCancel={handleCancel}
        />
      )}

      {/* ── Create / edit slide-over ── */}
      <CreateBookingSlideover
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setEditBooking(null); }}
        onSave={handleSave}
        allBookings={bookings}
        editBooking={editBooking}
      />
    </div>
  );
}
