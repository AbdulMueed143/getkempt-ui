"use client";

import { useState, useMemo } from "react";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { StaffStats } from "./staff-stats";
import { StaffCard } from "./staff-card";
import { StaffSlideover } from "./staff-slideover";
import { MOCK_STAFF } from "@/lib/mock/staff";
import type { StaffMember, StaffRole, StaffStatus } from "@/types/staff";
import type { StaffSchema } from "@/lib/validations/staff";
import { useConfirm } from "@/hooks/use-confirm";
import { useToast } from "@/hooks/use-toast";

/* ── Filter option types ─────────────────────────── */
type RoleFilter   = StaffRole | "all";
type StatusFilter = StaffStatus | "all";

export function StaffPageClient() {
  const [staff,        setStaff]        = useState<StaffMember[]>(MOCK_STAFF);
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [editing,       setEditing]      = useState<StaffMember | null>(null);
  const [search,        setSearch]       = useState("");
  const [roleFilter,    setRoleFilter]   = useState<RoleFilter>("all");
  const [statusFilter,  setStatusFilter] = useState<StatusFilter>("all");

  const confirm = useConfirm();
  const toast   = useToast();

  /* ── Filtered list ───────────────────────────────── */
  const filtered = useMemo(() => {
    return staff.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.specialization.toLowerCase().includes(q);
      const matchesRole   = roleFilter   === "all" || m.role   === roleFilter;
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staff, search, roleFilter, statusFilter]);

  /* ── CRUD handlers ──────────────────────────────── */
  const handleSave = (values: StaffSchema, editingId?: string) => {
    if (editingId) {
      setStaff((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, ...values, commissionRate: values.commissionRate ?? null }
            : m
        )
      );
      toast.success({ title: "Staff member updated", message: `${values.firstName} ${values.lastName}'s details have been saved.` });
    } else {
      const newMember: StaffMember = {
        id:             `s${Date.now()}`,
        ...values,
        commissionRate: values.commissionRate ?? null,
        createdAt:      new Date().toISOString(),
      };
      setStaff((prev) => [newMember, ...prev]);
      toast.success({ title: "Staff member added", message: `${values.firstName} ${values.lastName} has been added to your team.` });
    }
  };

  const handleEdit = (member: StaffMember) => {
    setEditing(member);
    setSlideoverOpen(true);
  };

  const handleDelete = async (id: string) => {
    const member = staff.find((m) => m.id === id);
    if (!member) return;

    const ok = await confirm({
      variant:      "danger",
      title:        "Remove staff member?",
      message:      `${member.firstName} ${member.lastName} will be permanently removed from your team.`,
      detail:       "Their upcoming bookings will become unassigned. This action cannot be undone.",
      confirmLabel: "Yes, remove",
    });

    if (ok) {
      setStaff((prev) => prev.filter((m) => m.id !== id));
      toast.success({
        title:   "Staff member removed",
        message: `${member.firstName} ${member.lastName} has been removed.`,
      });
    }
  };

  const openAdd = () => {
    setEditing(null);
    setSlideoverOpen(true);
  };

  return (
    <>
      <div className="space-y-6 max-w-[1400px] mx-auto">

        {/* ── Page header ─────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1B3163" }}>
              Staff
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "#8E95A5" }}>
              Manage your team, roles and access levels
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "#D5B584", color: "#1B3163" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1B3163";
              (e.currentTarget as HTMLButtonElement).style.color = "#EAEAEA";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#D5B584";
              (e.currentTarget as HTMLButtonElement).style.color = "#1B3163";
            }}
          >
            <Plus size={16} />
            Add Staff Member
          </button>
        </div>

        {/* ── Summary stats ────────────────────────── */}
        <StaffStats staff={staff} />

        {/* ── Search + filter bar ──────────────────── */}
        <div
          className="bg-white rounded-2xl px-5 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
          style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(27,49,99,0.06)" }}
        >
          {/* Search */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#9FB2D9" }} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or specialization…"
              className="w-full rounded-xl text-sm py-2.5 pl-9 pr-4 transition-all"
              style={{
                backgroundColor: "#F0F3FA",
                border: "1px solid transparent",
                color: "#1B3163",
                outline: "none",
              }}
              onFocus={(e) => { e.currentTarget.style.border = "1px solid #1B3163"; }}
              onBlur={(e)  => { e.currentTarget.style.border = "1px solid transparent"; }}
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6" style={{ backgroundColor: "#E8ECF4" }} />

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={14} style={{ color: "#8E95A5" }} />

            {/* Role filter */}
            <FilterSelect
              value={roleFilter}
              onChange={(v) => setRoleFilter(v as RoleFilter)}
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff Member</option>
            </FilterSelect>

            {/* Status filter */}
            <FilterSelect
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </FilterSelect>

            {/* Clear */}
            {(search || roleFilter !== "all" || statusFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "#8E95A5", backgroundColor: "#F0F3FA" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Staff grid ───────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl py-16 text-center" style={{ border: "1px solid #E8ECF4" }}>
            <p className="text-base font-semibold" style={{ color: "#1B3163" }}>No staff found</p>
            <p className="text-sm mt-1" style={{ color: "#8E95A5" }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((member) => (
              <StaffCard
                key={member.id}
                member={member}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Result count */}
        {filtered.length > 0 && (
          <p className="text-xs text-right" style={{ color: "#8E95A5" }}>
            Showing {filtered.length} of {staff.length} members
          </p>
        )}
      </div>

      {/* ── Slide-over ───────────────────────────────── */}
      <StaffSlideover
        isOpen={slideoverOpen}
        onClose={() => setSlideoverOpen(false)}
        onSave={handleSave}
        editing={editing}
      />
    </>
  );
}

/* ── Tiny inline select for filter bar ──────────── */
function FilterSelect({
  value, onChange, children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs rounded-lg py-1.5 px-3 appearance-none cursor-pointer"
      style={{
        backgroundColor: "#F0F3FA",
        border: "1px solid #E8ECF4",
        color: "#1B3163",
        outline: "none",
      }}
    >
      {children}
    </select>
  );
}
