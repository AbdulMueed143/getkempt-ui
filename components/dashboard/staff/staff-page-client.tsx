"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { StaffStats } from "./staff-stats";
import { StaffCard } from "./staff-card";
import { StaffSlideover } from "./staff-slideover";
import { MOCK_STAFF } from "@/lib/mock/staff";
import type { StaffMember, StaffRole, StaffStatus } from "@/types/staff";
import type { StaffSchema } from "@/lib/validations/staff";
import { useConfirm } from "@/hooks/use-confirm";
import { useToast } from "@/hooks/use-toast";
import { useQuickActionStore } from "@/store/quick-action-store";

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

  /* Open add-staff slideover automatically when navigated from a quick action */
  const { pendingAction, clear: clearPending } = useQuickActionStore();
  useEffect(() => {
    if (pendingAction === "staff") {
      setSlideoverOpen(true);
      clearPending();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0D1B2A]">
              Staff
            </h2>
            <p className="text-sm mt-0.5 text-[#6B7280]">
              Manage your team, roles and access levels
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-[#C4A882] text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-white shadow-sm"
          >
            <Plus size={16} />
            Add Staff Member
          </button>
        </div>

        {/* ── Summary stats ────────────────────────── */}
        <StaffStats staff={staff} />

        {/* ── Search + filter bar ──────────────────── */}
        <div className="bg-white rounded-2xl px-5 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center border border-[#E8E4DA] shadow-sm">
          {/* Search */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9FB2D9]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or specialization…"
              className="w-full rounded-xl text-sm py-2.5 pl-9 pr-4 transition-all duration-200 bg-[#F5F3EE] border border-transparent text-[#0D1B2A] outline-none focus:border-[#C4A882]/40 focus:bg-white placeholder:text-[#6B7280]"
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-[#E8E4DA]" />

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={14} className="text-[#6B7280]" />

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
                className="text-xs px-3 py-1.5 rounded-lg transition-colors text-[#6B7280] bg-[#F5F3EE] hover:bg-[#E8E4DA]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Staff grid ───────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl py-16 text-center border border-[#E8E4DA]">
            <p className="text-base font-semibold text-[#0D1B2A]">No staff found</p>
            <p className="text-sm mt-1 text-[#6B7280]">
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
          <p className="text-xs text-right text-[#6B7280]">
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
      className="text-xs rounded-lg py-1.5 px-3 appearance-none cursor-pointer bg-[#F5F3EE] border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40"
    >
      {children}
    </select>
  );
}
