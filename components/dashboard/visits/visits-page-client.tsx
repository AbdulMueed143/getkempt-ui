"use client";

import { useState, useMemo, useCallback } from "react";
import {
  CalendarCheck2, CheckCircle2, XCircle,
  RotateCcw, ChevronDown, ChevronUp, Filter,
} from "lucide-react";
import { VisitsStats } from "./visits-stats";
import { AppointmentRow } from "./appointment-row";
import { MOCK_APPOINTMENTS } from "@/lib/mock/visits";
import { MOCK_STAFF } from "@/lib/mock/staff";
import type { AppointmentRecord, AppointmentStatus } from "@/types/visits";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";

type StatusFilter = "all" | "pending" | "completed" | "no_show" | "cancelled";

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all:       "All",
  pending:   "Needs Review",
  completed: "Attended",
  no_show:   "No-shows",
  cancelled: "Cancelled",
};

/* ── Date grouping ─────────────────────────────────────────── */

function localDateStr(isoUtc: string): string {
  return new Date(isoUtc).toLocaleDateString("en-CA"); // YYYY-MM-DD in local tz
}

function groupLabel(dateStr: string): string {
  const today     = new Date().toLocaleDateString("en-CA");
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA");
  if (dateStr === today)     return "Today";
  if (dateStr === yesterday) return "Yesterday";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-AU", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
  });
}

function groupAppointments(
  appts: AppointmentRecord[]
): { dateStr: string; label: string; items: AppointmentRecord[] }[] {
  const map = new Map<string, AppointmentRecord[]>();
  for (const a of appts) {
    const d = localDateStr(a.scheduledAt);
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(a);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // newest first
    .map(([dateStr, items]) => ({
      dateStr,
      label: groupLabel(dateStr),
      items: items.sort((a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      ),
    }));
}

export function VisitsPageClient() {
  const toast = useToast();

  const [appointments, setAppointments] = useState<AppointmentRecord[]>(MOCK_APPOINTMENTS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [staffFilter,  setStaffFilter]  = useState<string>("all");
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  /* ── Counts for filter tabs ── */
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (staffFilter  !== "all" && a.staffId !== staffFilter) return false;
      return true;
    });
  }, [appointments, statusFilter, staffFilter]);

  const groups = useMemo(() => groupAppointments(filtered), [filtered]);

  /* ── Selection helpers ── */
  const visibleIds = filtered.map((a) => a.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleIds));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /* ── Update status ── */
  const updateStatus = useCallback(
    (id: string, status: AppointmentStatus, note?: string) => {
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status, note, statusUpdatedAt: new Date().toISOString() }
            : a
        )
      );
      if (status === "completed") {
        toast.success({ title: "Marked as attended" });
      } else if (status === "no_show") {
        toast.info({ title: "Marked as no-show" });
      } else if (status === "pending") {
        toast.info({ title: "Status reset to pending" });
      }
    },
    [toast]
  );

  /* ── Bulk mark ── */
  function bulkMark(status: AppointmentStatus) {
    const ids = Array.from(selectedIds);
    setAppointments((prev) =>
      prev.map((a) =>
        ids.includes(a.id)
          ? { ...a, status, statusUpdatedAt: new Date().toISOString() }
          : a
      )
    );
    toast.success({
      title: `${ids.length} appointment${ids.length > 1 ? "s" : ""} updated`,
      message: status === "completed" ? "Marked as attended" : "Marked as no-show",
    });
    setSelectedIds(new Set());
  }

  function toggleCollapseDate(dateStr: string) {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      next.has(dateStr) ? next.delete(dateStr) : next.add(dateStr);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review past appointments and mark whether clients attended
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shrink-0">
          <CalendarCheck2 className="w-3.5 h-3.5" />
          Times shown in shop timezone
        </div>
      </div>

      {/* ── Stats ── */}
      <VisitsStats appointments={appointments} />

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Status tab bar */}
        <div className="flex overflow-x-auto border-b border-gray-100">
          {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                statusFilter === key
                  ? "border-[#1B3163] text-[#1B3163]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
              )}
            >
              {STATUS_FILTER_LABELS[key]}
              {key === "pending" && pendingCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}

          {/* Expand filters button */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="ml-auto px-4 py-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors shrink-0"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable staff filter */}
        {showFilters && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
            <label className="text-xs font-medium text-gray-600 shrink-0">Staff</label>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3163]"
            >
              <option value="all">All staff</option>
              {MOCK_STAFF.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── Bulk action bar (shown when items are selected) ── */}
        {someSelected && (
          <div className="px-4 py-2.5 bg-[#EEF1F8] border-b border-[#D5DFF0] flex items-center gap-3">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 accent-[#1B3163] cursor-pointer"
            />
            <span className="text-sm font-medium text-[#1B3163]">
              {selectedIds.size} selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => bulkMark("completed")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark all attended
              </button>
              <button
                type="button"
                onClick={() => bulkMark("no_show")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Mark all no-show
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* ── Table header (desktop) ── */}
        {!someSelected && (
          <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 accent-[#1B3163] cursor-pointer"
            />
            <div className="w-16 shrink-0" />
            <p className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client · Service</p>
            <div className="hidden lg:block w-28 shrink-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Staff</p>
            </div>
            <div className="w-40 shrink-0 text-right">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
            </div>
          </div>
        )}

        {/* ── Grouped appointment list ── */}
        {groups.length === 0 ? (
          <div className="py-14 text-center">
            <CalendarCheck2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No appointments match this filter</p>
          </div>
        ) : (
          groups.map(({ dateStr, label, items }) => {
            const isCollapsed = collapsedDates.has(dateStr);
            const pendingInGroup = items.filter((a) => a.status === "pending").length;

            return (
              <div key={dateStr}>
                {/* Date group header */}
                <button
                  type="button"
                  onClick={() => toggleCollapseDate(dateStr)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50/80 hover:bg-gray-100/60 transition-colors border-b border-gray-100"
                >
                  <span className="text-xs font-semibold text-gray-600 flex-1 text-left">
                    {label}
                  </span>
                  <span className="text-xs text-gray-400">{items.length} appointment{items.length !== 1 ? "s" : ""}</span>
                  {pendingInGroup > 0 && (
                    <span className="text-xs bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">
                      {pendingInGroup} pending
                    </span>
                  )}
                  {isCollapsed
                    ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    : <ChevronUp   className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  }
                </button>

                {/* Rows */}
                {!isCollapsed && items.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appointment={appt}
                    isSelected={selectedIds.has(appt.id)}
                    onToggleSelect={toggleSelect}
                    onUpdateStatus={updateStatus}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
