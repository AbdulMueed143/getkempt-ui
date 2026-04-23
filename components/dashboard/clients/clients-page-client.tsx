"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, Send, X as ClearIcon } from "lucide-react";
import { ClientStats } from "./client-stats";
import { ClientTable } from "./client-table";
import { BroadcastSlideover, type AudienceCounts } from "./broadcast-slideover";
import { MOCK_CLIENTS } from "@/lib/mock/clients";
import { MOCK_STAFF } from "@/lib/mock/staff";
import type { Client } from "@/types/client";
import { hasUpcomingBooking, isActiveClient } from "@/types/client";
import type { CampaignAudience } from "@/types/campaign";

/* ── Filter types ────────────────────────────────────────── */
type StatusFilter   = "all" | "active" | "inactive" | "upcoming";
type StaffFilter    = string | "all";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all",      label: "All clients" },
  { value: "active",   label: "Active (90 days)" },
  { value: "inactive", label: "Lapsed" },
  { value: "upcoming", label: "Upcoming booking" },
];

export function ClientsPageClient() {
  /* ── State ─────────────────────────────────────────────── */
  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>("all");
  const [staffFilter,   setStaffFilter]   = useState<StaffFilter>("all");
  const [selectedIds,   setSelectedIds]   = useState<Set<string>>(new Set());
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastAud,  setBroadcastAud]  = useState<CampaignAudience>("all");

  /* ── Filtered client list ──────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_CLIENTS.filter((c) => {
      const matchSearch = !q || (
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
      const matchStatus =
        statusFilter === "all"      ? true :
        statusFilter === "active"   ? isActiveClient(c) :
        statusFilter === "inactive" ? !isActiveClient(c) :
        statusFilter === "upcoming" ? hasUpcomingBooking(c) : true;

      const matchStaff = staffFilter === "all" || c.preferredStaffId === staffFilter;

      return matchSearch && matchStatus && matchStaff;
    });
  }, [search, statusFilter, staffFilter]);

  /* ── Audience counts for the broadcast form ─────────────── */
  const audienceCounts: AudienceCounts = useMemo(() => {
    const staffCounts: Record<string, number> = {};
    MOCK_STAFF.forEach((s) => {
      staffCounts[s.id] = MOCK_CLIENTS.filter((c) => c.preferredStaffId === s.id).length;
    });
    return {
      all:      MOCK_CLIENTS.length,
      upcoming: MOCK_CLIENTS.filter((c) => hasUpcomingBooking(c)).length,
      staff:    staffCounts,
      selected: selectedIds.size,
    };
  }, [selectedIds]);

  /* ── Selection handlers ────────────────────────────────── */
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /* ── Quick email to a single client ────────────────────── */
  const handleSendToOne = (client: Client) => {
    setSelectedIds(new Set([client.id]));
    setBroadcastAud("selected");
    setBroadcastOpen(true);
  };

  /* ── Open broadcast with explicit audience ──────────────── */
  const openBroadcast = (audience: CampaignAudience) => {
    setBroadcastAud(audience);
    setBroadcastOpen(true);
  };

  /* ── Derived ────────────────────────────────────────────── */
  const selectedCount   = selectedIds.size;
  const selectedClients = MOCK_CLIENTS.filter((c) => selectedIds.has(c.id));

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <>
      <div className="space-y-5 max-w-[1400px] mx-auto">

        {/* ── Page header ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A]">All Clients</h1>
            <p className="text-sm mt-0.5 text-[#6B7280]">
              {MOCK_CLIENTS.length} clients across all staff members
            </p>
          </div>
          <button
            onClick={() => openBroadcast("all")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-[#C4A882] text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-white shadow-sm"
          >
            <Send size={15} />
            Send Campaign
          </button>
        </div>

        {/* ── Stats ────────────────────────────────── */}
        <ClientStats clients={MOCK_CLIENTS} />

        {/* ── Filters ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1" style={{ minWidth: 200 }}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9FB2D9]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone…"
              className="w-full rounded-xl text-sm py-2.5 pl-9 pr-4 bg-white border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40 transition-all duration-200 placeholder:text-[#6B7280]"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-xl text-sm py-2.5 px-3 appearance-none bg-white border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40 cursor-pointer"
            style={{ minWidth: 160 }}
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Staff */}
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="rounded-xl text-sm py-2.5 px-3 appearance-none bg-white border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40 cursor-pointer"
            style={{ minWidth: 160 }}
          >
            <option value="all">All staff</option>
            {MOCK_STAFF.map((s) => (
              <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
            ))}
          </select>
        </div>

        {/* ── Selection action bar ──────────────────── */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-[#F5F3EE] border border-[#E8E4DA]">
            <span className="text-sm font-medium text-[#0D1B2A]">
              {selectedCount} client{selectedCount !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openBroadcast("selected")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[#0D1B2A] text-white hover:bg-[#1B3163] transition-colors"
              >
                <Send size={14} />
                Send to selected
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm bg-white text-[#6B7280] border border-[#E8E4DA] hover:bg-[#F0EEE6] transition-colors"
              >
                <ClearIcon size={13} />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* ── Quick audience shortcuts ──────────────── */}
        {selectedCount === 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium py-1 text-[#6B7280]">Quick send to:</span>
            <ShortcutChip
              label={`All ${MOCK_CLIENTS.length} clients`}
              onClick={() => openBroadcast("all")}
            />
            <ShortcutChip
              label={`${audienceCounts.upcoming} with upcoming bookings`}
              onClick={() => openBroadcast("upcoming")}
            />
            {MOCK_STAFF.slice(0, 3).map((s) => (
              <ShortcutChip
                key={s.id}
                label={`${s.firstName}'s clients (${audienceCounts.staff[s.id] ?? 0})`}
                onClick={() => openBroadcast("staff")}
              />
            ))}
          </div>
        )}

        {/* ── Client table ─────────────────────────── */}
        <ClientTable
          clients={filtered}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
          onSendToOne={handleSendToOne}
        />
      </div>

      {/* ── Broadcast slideover ──────────────────────── */}
      <BroadcastSlideover
        isOpen={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        counts={audienceCounts}
        presetAudience={broadcastAud}
        presetClients={selectedClients}
      />
    </>
  );
}

function ShortcutChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all bg-[#F5F3EE] text-[#0D1B2A] border border-[#E8E4DA] hover:bg-[#E8E4DA]"
    >
      <Send size={10} />
      {label}
    </button>
  );
}
