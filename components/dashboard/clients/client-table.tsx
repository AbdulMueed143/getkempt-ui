"use client";

import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Mail } from "lucide-react";
import type { Client } from "@/types/client";
import { hasUpcomingBooking, isNewClient, isActiveClient } from "@/types/client";
import { formatDate, relativePast, relativeUpcoming, daysUntil } from "@/lib/utils/date";
import { MOCK_STAFF } from "@/lib/mock/staff";

const PAGE_SIZE = 25;

/* ── Sort config ─────────────────────────────────────────── */
type SortField = "name" | "totalBookings" | "lastBookingDate" | "joinedAt";
type SortDir   = "asc" | "desc";

/* ── Staff lookup map ────────────────────────────────────── */
const STAFF_MAP = Object.fromEntries(
  MOCK_STAFF.map((s) => [s.id, `${s.firstName} ${s.lastName}`])
);

/* ── Avatar initials colour ─────────────────────────────── */
const AVATAR_COLORS = [
  { bg: "#EEF1F8", color: "#1B3163" },
  { bg: "#DCFCE7", color: "#15803D" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#F3E8FF", color: "#6B21A8" },
  { bg: "#CCFBF1", color: "#0F766E" },
];

function avatarColor(id: string) {
  const idx = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

/* ── Sort icon ───────────────────────────────────────────── */
function SortIcon({ field, active, dir }: { field: string; active: SortField; dir: SortDir }) {
  if (field !== active) return <ChevronsUpDown size={12} style={{ color: "#C5CEDF" }} />;
  return dir === "asc"
    ? <ChevronUp   size={12} style={{ color: "#1B3163" }} />
    : <ChevronDown size={12} style={{ color: "#1B3163" }} />;
}

/* ── Props ───────────────────────────────────────────────── */
interface ClientTableProps {
  clients:        Client[];
  selectedIds:    Set<string>;
  onToggleSelect: (id: string)   => void;
  onSelectAll:    (ids: string[]) => void;
  onClearAll:     ()              => void;
  onSendToOne:    (client: Client) => void;
}

export function ClientTable({
  clients, selectedIds, onToggleSelect, onSelectAll, onClearAll, onSendToOne,
}: ClientTableProps) {
  const [page,    setPage]    = useState(1);
  const [sortBy,  setSortBy]  = useState<SortField>("joinedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  /* ── Sorted list ─────────────────────────────────── */
  const sorted = useMemo(() => {
    return [...clients].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") {
        cmp = `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`);
      } else if (sortBy === "totalBookings") {
        cmp = a.totalBookings - b.totalBookings;
      } else if (sortBy === "lastBookingDate") {
        cmp = (a.lastBookingDate ?? "").localeCompare(b.lastBookingDate ?? "");
      } else if (sortBy === "joinedAt") {
        cmp = a.joinedAt.localeCompare(b.joinedAt);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [clients, sortBy, sortDir]);

  /* ── Pagination ──────────────────────────────────── */
  const totalPages    = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage      = Math.min(page, totalPages);
  const start         = (safePage - 1) * PAGE_SIZE;
  const paginated     = sorted.slice(start, start + PAGE_SIZE);
  const allPageIds    = paginated.map((c) => c.id);
  const allSelected   = allPageIds.every((id) => selectedIds.has(id)) && paginated.length > 0;
  const someSelected  = allPageIds.some((id) => selectedIds.has(id));

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-0 bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E8ECF4" }}>

      {/* ── Table ──────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 720, borderCollapse: "collapse" }}>

          {/* Head */}
          <thead>
            <tr style={{ backgroundColor: "#F8F9FC", borderBottom: "1px solid #E8ECF4" }}>

              {/* Select all */}
              <th className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={() => allSelected ? onClearAll() : onSelectAll(allPageIds)}
                  className="rounded accent-[#1B3163] cursor-pointer"
                  aria-label="Select all on this page"
                />
              </th>

              <ThCell label="Client"        field="name"            active={sortBy} dir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E95A5" }}>Phone</th>
              <ThCell label="Visits"        field="totalBookings"   active={sortBy} dir={sortDir} onSort={toggleSort} align="right" />
              <ThCell label="Last Visit"    field="lastBookingDate" active={sortBy} dir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E95A5" }}>Next Booking</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "#8E95A5" }}>Staff</th>
              <ThCell label="Joined"        field="joinedAt"        active={sortBy} dir={sortDir} onSort={toggleSort} />
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-sm" style={{ color: "#8E95A5" }}>
                  No clients match your filters.
                </td>
              </tr>
            ) : (
              paginated.map((client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  isSelected={selectedIds.has(client.id)}
                  onToggle={() => onToggleSelect(client.id)}
                  onSendEmail={() => onSendToOne(client)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ─────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 text-xs flex-wrap gap-2"
        style={{ borderTop: "1px solid #F0F3FA", color: "#8E95A5" }}
      >
        <span>
          Showing {sorted.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, sorted.length)} of {sorted.length} clients
        </span>
        <div className="flex items-center gap-1">
          <PageButton label="← Prev" disabled={safePage <= 1}           onClick={() => setPage((p) => p - 1)} />
          <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: "#EEF1F8", color: "#1B3163" }}>
            {safePage} / {totalPages}
          </span>
          <PageButton label="Next →" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)} />
        </div>
      </div>
    </div>
  );
}

/* ── Row ───────────────────────────────────────────────────── */
interface RowProps {
  client:     Client;
  isSelected: boolean;
  onToggle:   () => void;
  onSendEmail:() => void;
}

function ClientRow({ client, isSelected, onToggle, onSendEmail }: RowProps) {
  const { bg, color } = avatarColor(client.id);
  const initials = `${client.firstName[0]}${client.lastName[0]}`.toUpperCase();
  const staffName = client.preferredStaffId ? STAFF_MAP[client.preferredStaffId] : null;
  const upcoming  = hasUpcomingBooking(client);
  const isNew     = isNewClient(client);
  const inactive  = !isActiveClient(client);
  const daysAway  = upcoming ? daysUntil(client.nextBookingDate) : null;

  return (
    <tr
      className="group transition-colors"
      style={{
        backgroundColor: isSelected ? "#F5F7FC" : undefined,
        borderBottom:    "1px solid #F5F6FA",
      }}
      onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#FAFBFD"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = isSelected ? "#F5F7FC" : ""; }}
    >
      {/* Checkbox */}
      <td className="px-4 py-3 w-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="rounded accent-[#1B3163] cursor-pointer"
          aria-label={`Select ${client.firstName} ${client.lastName}`}
        />
      </td>

      {/* Client */}
      <td className="px-4 py-3" style={{ minWidth: 200 }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: bg, color }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-sm truncate" style={{ color: "#1B3163" }}>
                {client.firstName} {client.lastName}
              </span>
              {isNew && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase" style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}>
                  New
                </span>
              )}
              {inactive && !isNew && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase" style={{ backgroundColor: "#F3F4F6", color: "#8E95A5" }}>
                  Lapsed
                </span>
              )}
            </div>
            <p className="text-xs truncate" style={{ color: "#8E95A5" }}>{client.email}</p>
          </div>
        </div>
      </td>

      {/* Phone */}
      <td className="px-4 py-3 text-sm" style={{ color: "#6B7A99", whiteSpace: "nowrap" }}>
        {client.phone}
      </td>

      {/* Visits */}
      <td className="px-4 py-3 text-sm text-right font-semibold" style={{ color: "#1B3163" }}>
        {client.totalBookings}
      </td>

      {/* Last visit */}
      <td className="px-4 py-3 text-sm" style={{ color: "#6B7A99", whiteSpace: "nowrap" }}>
        {relativePast(client.lastBookingDate)}
      </td>

      {/* Next booking */}
      <td className="px-4 py-3" style={{ whiteSpace: "nowrap" }}>
        {upcoming ? (
          <span
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: (daysAway ?? 99) <= 7 ? "#DCFCE7" : "#EEF1F8",
              color:           (daysAway ?? 99) <= 7 ? "#15803D" : "#1B3163",
            }}
          >
            {relativeUpcoming(client.nextBookingDate)}
          </span>
        ) : (
          <span style={{ color: "#C5CEDF", fontSize: 13 }}>—</span>
        )}
      </td>

      {/* Staff */}
      <td className="px-4 py-3 text-sm" style={{ color: "#6B7A99" }}>
        {staffName ?? <span style={{ color: "#C5CEDF" }}>—</span>}
      </td>

      {/* Joined */}
      <td className="px-4 py-3 text-sm" style={{ color: "#8E95A5", whiteSpace: "nowrap" }}>
        {formatDate(client.joinedAt)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 w-12">
        <button
          onClick={onSendEmail}
          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: "#EEF1F8", color: "#1B3163" }}
          title={`Send email to ${client.firstName}`}
        >
          <Mail size={13} />
        </button>
      </td>
    </tr>
  );
}

/* ── Helpers ───────────────────────────────────────────────── */
interface ThCellProps {
  label:   string;
  field:   SortField;
  active:  SortField;
  dir:     SortDir;
  onSort:  (f: SortField) => void;
  align?:  "left" | "right";
}

function ThCell({ label, field, active, dir, onSort, align = "left" }: ThCellProps) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none text-${align}`}
      style={{ color: active === field ? "#1B3163" : "#8E95A5", whiteSpace: "nowrap" }}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <SortIcon field={field} active={active} dir={dir} />
      </span>
    </th>
  );
}

function PageButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ backgroundColor: "#F0F3FA", color: "#1B3163" }}
    >
      {label}
    </button>
  );
}
