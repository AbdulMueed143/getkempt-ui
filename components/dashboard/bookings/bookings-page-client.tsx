"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Plus, ChevronLeft, ChevronRight,
  Calendar, LayoutGrid, CalendarDays,
  CheckCircle2, XCircle, Clock, AlertCircle,
  Coffee, Users,
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
import { MOCK_STAFF } from "@/lib/mock/staff";
import { useToast } from "@/hooks/use-toast";
import { useQuickActionStore } from "@/store/quick-action-store";
import { cn } from "@/lib/utils/cn";

type CalView = "day" | "week" | "month";

const VIEW_ICONS: Record<CalView, React.ElementType> = {
  day:   CalendarDays,
  week:  LayoutGrid,
  month: Calendar,
};

/* ── Break time type ─────────────────────────────────────────── */
interface BreakTime {
  id: string;
  staffId: string;
  staffName: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  reason: string;
}

/* ── Break time slideover ────────────────────────────────────── */
function AddBreakSlideover({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brk: BreakTime) => void;
}) {
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("Lunch break");

  useEffect(() => {
    if (!isOpen) {
      setStaffId(""); setDate(""); setStartTime(""); setEndTime(""); setReason("Lunch break");
    }
  }, [isOpen]);

  const STAFF = [
    { id: "s1", name: "Alex Rivera" },
    { id: "s2", name: "Jamie Chen" },
    { id: "s3", name: "Casey Williams" },
    { id: "s4", name: "Morgan Patel" },
    { id: "s5", name: "Taylor Brown" },
  ];

  const canSave = staffId && date && startTime && endTime && startTime < endTime;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8ECF4] shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#0D1B2A]">Add Break Time</h2>
            <p className="text-xs text-[#8E95A5] mt-0.5">Block off time for a staff member</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F4F2EE] transition-colors">
            <XCircle className="w-4 h-4 text-[#8E95A5]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Staff */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0D1B2A]">Staff Member</label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full rounded-xl text-sm py-2.5 px-3 bg-white border border-[#E8ECF4] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40"
            >
              <option value="">Select staff…</option>
              {STAFF.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0D1B2A]">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl text-sm py-2.5 px-3 bg-white border border-[#E8ECF4] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40"
            />
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0D1B2A]">Start</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl text-sm py-2.5 px-3 bg-white border border-[#E8ECF4] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0D1B2A]">End</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl text-sm py-2.5 px-3 bg-white border border-[#E8ECF4] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0D1B2A]">Reason</label>
            <div className="flex flex-wrap gap-2">
              {["Lunch break", "Personal", "Meeting", "Other"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    reason === r
                      ? "bg-[#0D1B2A] text-white border-[#0D1B2A]"
                      : "bg-[#F4F2EE] text-[#0D1B2A] border-[#E8ECF4] hover:border-[#C4A882]"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E8ECF4] flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#8E95A5] hover:bg-[#F4F2EE] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!canSave) return;
              const staff = STAFF.find((s) => s.id === staffId);
              onSave({
                id: `brk-${Date.now()}`,
                staffId,
                staffName: staff?.name ?? "",
                date,
                startTime,
                endTime,
                reason,
              });
              onClose();
            }}
            disabled={!canSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#C4A882] text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Coffee className="w-4 h-4" />
            Add Break
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const color = STAFF_CAL_COLORS[booking.staffId] ?? "#0D1B2A";

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
              <h3 className="text-base font-bold text-[#0D1B2A]">{booking.clientName}</h3>
              {booking.clientPhone && (
                <a href={`tel:${booking.clientPhone}`} className="text-xs text-[#C4A882] hover:underline">{booking.clientPhone}</a>
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
              <div key={label} className="flex items-center gap-2.5 text-[#6B7A99]">
                <Icon className="w-4 h-4 text-[#9FB2D9] shrink-0" />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>

          {booking.notes && (
            <p className="text-xs text-[#6B7A99] bg-[#F4F2EE] rounded-lg px-3 py-2 italic">
              &ldquo;{booking.notes}&rdquo;
            </p>
          )}

          {/* Source badge */}
          <p className="text-[10px] text-[#8E95A5] uppercase tracking-wide">
            Source: {booking.source.replace("_", " ")}
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { onEdit(booking); onClose(); }}
              className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold text-[#0D1B2A] bg-[#F4F2EE] hover:bg-[#E8ECF4] transition-colors"
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
              className="px-3 py-2 rounded-xl text-sm text-[#8E95A5] hover:bg-[#F4F2EE] transition-colors"
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

  const [bookings,    setBookings]    = useState<Booking[]>(MOCK_BOOKINGS);
  const [breaks,      setBreaks]      = useState<BreakTime[]>([]);
  const [view,        setView]        = useState<CalView>("day");
  const [curDate,     setCurDate]     = useState(today);
  const [staffFilter, setStaffFilter] = useState<string>("all");

  const [showCreate,    setShowCreate]    = useState(false);
  const [showBreak,     setShowBreak]     = useState(false);
  const [editBooking,   setEditBooking]   = useState<Booking | null>(null);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  /* ── Filtered bookings ── */
  const filteredBookings = staffFilter === "all"
    ? bookings
    : bookings.filter((b) => b.staffId === staffFilter);

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

  const handleAddBreak = useCallback(
    (brk: BreakTime) => {
      setBreaks((prev) => [...prev, brk]);
      toast.success({ title: "Break added", message: `${brk.reason} for ${brk.staffName}` });
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
      {/* ── Desktop top bar — hidden on mobile ── */}
      <div className="hidden md:flex items-center gap-2 px-1 py-2 shrink-0 flex-wrap">
        {/* Today stats */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <span className="text-[#8E95A5] font-medium mr-1">Today</span>
          {[
            { icon: CheckCircle2, label: `${stats.confirmed} confirmed`, color: "text-[#0D1B2A]" },
            { icon: CheckCircle2, label: `${stats.completed} completed`, color: "text-emerald-600" },
            { icon: XCircle,      label: `${stats.noShow} no-show`,      color: "text-rose-500" },
          ].map(({ icon: Icon, label, color }) => (
            <span key={label} className={cn("flex items-center gap-1", color)}>
              <Icon className="w-3.5 h-3.5" />{label}
            </span>
          ))}
        </div>

        <div className="flex-1" />

        {/* View switcher — desktop */}
        <div className="flex rounded-xl bg-[#F4F2EE] p-1 gap-1">
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
                    ? "bg-white text-[#0D1B2A] shadow-sm"
                    : "text-[#8E95A5] hover:text-[#0D1B2A]"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{v}</span>
              </button>
            );
          })}
        </div>

        {/* Break button */}
        <button
          type="button"
          onClick={() => setShowBreak(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#0D1B2A] bg-[#F4F2EE] border border-[#E8ECF4] hover:bg-[#E8ECF4] transition-colors"
        >
          <Coffee className="w-4 h-4" />
          Break
        </button>

        {/* New booking button */}
        <button
          type="button"
          onClick={() => { setEditBooking(null); setShowCreate(true); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#0D1B2A] bg-[#C4A882] hover:bg-[#0D1B2A] hover:text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* ── Desktop calendar nav bar — hidden on mobile ── */}
      <div className="hidden md:flex items-center gap-2 px-1 py-2 shrink-0 border-b border-[#E8ECF4]">
        <button type="button" onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-[#F4F2EE] transition-colors">
          <ChevronLeft className="w-4 h-4 text-[#6B7A99]" />
        </button>
        <button type="button" onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-[#F4F2EE] transition-colors">
          <ChevronRight className="w-4 h-4 text-[#6B7A99]" />
        </button>
        <h2 className="text-sm font-semibold text-[#0D1B2A] flex-1">{navLabel()}</h2>
        <button
          type="button"
          onClick={goToday}
          className="text-xs font-semibold text-[#0D1B2A] bg-[#F4F2EE] hover:bg-[#E8ECF4] px-3 py-1.5 rounded-lg transition-colors"
        >
          Today
        </button>
      </div>

      {/* ── Mobile compact header — visible only on mobile ── */}
      <div className="flex md:hidden items-center gap-2 px-2 py-2 shrink-0 border-b border-[#E8ECF4]">
        <h2 className="text-sm font-semibold text-[#0D1B2A] flex-1 truncate">{navLabel()}</h2>
        <button
          type="button"
          onClick={() => setShowBreak(true)}
          className="p-2 rounded-lg text-[#0D1B2A] bg-[#F4F2EE] border border-[#E8ECF4]"
          aria-label="Add break"
        >
          <Coffee className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => { setEditBooking(null); setShowCreate(true); }}
          className="p-2 rounded-lg text-[#0D1B2A] bg-[#C4A882] shadow-sm"
          aria-label="New booking"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* ── Staff filter chips ── */}
      <div className="flex items-center gap-1.5 px-1 py-1.5 shrink-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => setStaffFilter("all")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all shrink-0",
            staffFilter === "all"
              ? "bg-[#0D1B2A] text-white border-[#0D1B2A]"
              : "bg-white text-[#8E95A5] border-[#E8ECF4] hover:border-[#C4A882]"
          )}
        >
          <Users className="w-3 h-3" />
          All Staff
        </button>
        {MOCK_STAFF.map((s) => {
          const color = STAFF_CAL_COLORS[s.id] ?? "#0D1B2A";
          const active = staffFilter === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStaffFilter(active ? "all" : s.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all shrink-0",
                active
                  ? "text-white border-transparent"
                  : "bg-white text-[#6B7A99] border-[#E8ECF4] hover:border-[#C4A882]"
              )}
              style={active ? { backgroundColor: color, borderColor: color } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              {s.firstName}
            </button>
          );
        })}
      </div>

      {/* ── Calendar body ── */}
      <div className="flex-1 min-h-0 overflow-hidden bg-white rounded-xl border border-[#E8ECF4] mt-0.5 mb-0 md:mb-0">
        {view === "month" && (
          <MonthView
            currentDate={curDate}
            bookings={filteredBookings}
            onDayClick={(d) => { setCurDate(d); setView("day"); }}
            onBooking={setDetailBooking}
          />
        )}

        {view === "week" && (
          <WeekView
            monday={monday}
            bookings={filteredBookings}
            onBooking={setDetailBooking}
          />
        )}

        {view === "day" && (
          <DayView
            date={curDate}
            bookings={filteredBookings}
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

      {/* ── Add break slide-over ── */}
      <AddBreakSlideover
        isOpen={showBreak}
        onClose={() => setShowBreak(false)}
        onSave={handleAddBreak}
      />

      {/* ── Mobile bottom navigation bar ── */}
      <div className="md:hidden shrink-0 border-t border-[#E8ECF4] bg-white/95 backdrop-blur-md safe-area-bottom">
        <div className="flex items-center justify-between px-3 py-2">
          {/* Prev */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-[#0D1B2A] active:bg-[#F4F2EE] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-medium">Prev</span>
          </button>

          {/* Today */}
          <button
            type="button"
            onClick={goToday}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#0D1B2A] bg-[#F4F2EE] active:bg-[#E8ECF4] transition-colors"
          >
            Today
          </button>

          {/* View switcher — compact */}
          <div className="flex rounded-xl bg-[#F4F2EE] p-0.5 gap-0.5">
            {(["day", "week", "month"] as CalView[]).map((v) => {
              const Icon = VIEW_ICONS[v];
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    view === v
                      ? "bg-white text-[#0D1B2A] shadow-sm"
                      : "text-[#8E95A5]"
                  )}
                  aria-label={v}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Next */}
          <button
            type="button"
            onClick={() => navigate(1)}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-[#0D1B2A] active:bg-[#F4F2EE] transition-colors"
          >
            <span className="text-xs font-medium">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
