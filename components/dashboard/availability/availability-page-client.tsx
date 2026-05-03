"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CalendarCog,
  Search,
  CalendarDays,
  RefreshCw,
  ChevronDown,
  X,
  Check,
  Globe2,
} from "lucide-react";
import { AvailabilityStats } from "./availability-stats";
import { WeeklyScheduleEditor } from "./weekly-schedule-editor";
import { OverridesList } from "./overrides-list";
import { OverrideSlideover } from "./override-slideover";
import { MOCK_WEEKLY_SCHEDULES, MOCK_OVERRIDES } from "@/lib/mock/availability";
import { MOCK_STAFF } from "@/lib/mock/staff";
import type { WeeklySchedule, AvailabilityOverride } from "@/types/availability";
import type { OverrideFormValues } from "@/lib/validations/availability";
import type { StaffMember } from "@/types/staff";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils/cn";

type MobileTab = "schedule" | "overrides";

export function AvailabilityPageClient() {
  const toast = useToast();
  const confirm = useConfirm();

  /* ── State ── */
  const [schedules, setSchedules] = useState<WeeklySchedule[]>(MOCK_WEEKLY_SCHEDULES);
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>(MOCK_OVERRIDES);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(MOCK_STAFF[0].id);
  const [staffSearch, setStaffSearch] = useState("");
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<AvailabilityOverride | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("schedule");
  const [staffSheetOpen, setStaffSheetOpen] = useState(false);

  /* ── Derived ── */
  const selectedStaff = MOCK_STAFF.find((s) => s.id === selectedStaffId)!;
  const selectedSchedule = schedules.find((s) => s.staffId === selectedStaffId);
  const staffOverrides = overrides.filter((o) => o.staffId === selectedStaffId);
  const today = new Date().toISOString().split("T")[0];
  const upcomingOverridesForStaff = staffOverrides.filter((o) => o.date >= today).length;

  const filteredStaff = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    if (!q) return MOCK_STAFF;
    return MOCK_STAFF.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.specialization.toLowerCase().includes(q),
    );
  }, [staffSearch]);

  /* ── Handlers: weekly schedule ── */
  async function handleSaveSchedule(updated: WeeklySchedule) {
    await new Promise((r) => setTimeout(r, 400));
    setSchedules((prev) => prev.map((s) => (s.staffId === updated.staffId ? updated : s)));
    toast.success({
      title: "Schedule saved",
      message: `${selectedStaff.firstName}'s weekly schedule has been updated.`,
    });
  }

  /* ── Handlers: overrides ── */
  function openAddOverride() {
    setEditingOverride(null);
    setSlideoverOpen(true);
  }

  function openEditOverride(override: AvailabilityOverride) {
    setEditingOverride(override);
    setSlideoverOpen(true);
  }

  function handleSaveOverride(values: OverrideFormValues, editingId?: string) {
    if (editingId) {
      setOverrides((prev) =>
        prev.map((o) =>
          o.id === editingId
            ? {
                ...o,
                date: values.date,
                isWorking: values.isWorking,
                slots: values.slots.map((s, i) => ({
                  id: `${editingId}-slot-${i}`,
                  ...s,
                  type: s.type ?? "work",
                })),
                note: values.note ?? "",
              }
            : o,
        ),
      );
      toast.success({
        title: "Override updated",
        message: `Date override for ${formatDateShort(values.date)} updated.`,
      });
    } else {
      const newOverride: AvailabilityOverride = {
        id: `ov-${Date.now()}`,
        staffId: values.staffId,
        date: values.date,
        isWorking: values.isWorking,
        slots: values.slots.map((s, i) => ({
          id: `new-slot-${i}`,
          ...s,
          type: s.type ?? "work",
        })),
        note: values.note ?? "",
        createdAt: new Date().toISOString(),
      };
      setOverrides((prev) => [...prev, newOverride]);
      toast.success({
        title: "Override added",
        message: `Date override for ${formatDateShort(values.date)} saved.`,
      });
    }
  }

  async function handleDeleteOverride(id: string) {
    const override = overrides.find((o) => o.id === id);
    if (!override) return;
    const confirmed = await confirm({
      variant: "danger",
      title: "Delete override?",
      message: `Remove the override for ${formatDateShort(override.date)}?`,
      detail: "The staff member's regular weekly schedule will apply on that date.",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    setOverrides((prev) => prev.filter((o) => o.id !== id));
    toast.success({ title: "Override deleted" });
  }

  /* Shared props for OverridesList */
  const overrideListProps = {
    overrides: staffOverrides,
    onAdd: openAddOverride,
    onEdit: openEditOverride,
    onDelete: handleDeleteOverride,
  };

  /* Shared WeeklyScheduleEditor */
  const weeklyEditor = selectedSchedule ? (
    <WeeklyScheduleEditor
      key={selectedStaffId}
      initialSchedule={selectedSchedule}
      onSave={handleSaveSchedule}
    />
  ) : (
    <div className="bg-white rounded-2xl border border-dashed border-[#E5E2D9] p-10 text-center">
      <CalendarCog className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
      <p className="text-[#94A3B8] text-sm">No schedule found for this staff member.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ─────────── PAGE HEADER ─────────── */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-[#C4A882]">
            Manage
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-0.5 leading-tight">
            Availability
          </h1>
          <p className="hidden sm:block text-sm text-[#64748B] mt-1">
            Set weekly hours and one-off date overrides per staff member.
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#64748B] bg-white px-3 py-1.5 rounded-full border border-[#E5E2D9] shrink-0">
          <Globe2 className="w-3.5 h-3.5 text-[#1B3163]" />
          AEDT · stored as UTC
        </div>
      </header>

      {/* ─────────── STATS ─────────── */}
      <AvailabilityStats schedules={schedules} overrides={overrides} />

      {/* ════════════════════════════════════════════
          MOBILE LAYOUT (< lg)
          ════════════════════════════════════════════ */}
      <div className="lg:hidden space-y-3">
        {/* Staff selector — single button instead of chip-strip */}
        <button
          type="button"
          onClick={() => setStaffSheetOpen(true)}
          className="w-full bg-white rounded-2xl border border-[#E5E2D9] px-4 py-3 flex items-center gap-3 hover:border-[#1B3163]/40 transition-colors text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          aria-haspopup="dialog"
        >
          {/* Avatar */}
          <span
            className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center text-sm font-bold shrink-0"
            style={
              !selectedStaff.avatarImage
                ? {
                    backgroundColor: selectedStaff.avatarColor + "22",
                    color: selectedStaff.avatarColor,
                  }
                : undefined
            }
          >
            {selectedStaff.avatarImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedStaff.avatarImage}
                alt={selectedStaff.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                {selectedStaff.firstName[0]}
                {selectedStaff.lastName[0]}
              </>
            )}
          </span>

          {/* Name + meta */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#C4A882]">
                Editing
              </p>
              <span className="text-[10px] text-[#94A3B8]">·</span>
              <p className="text-[10px] font-medium text-[#94A3B8]">
                {MOCK_STAFF.length} staff
              </p>
            </div>
            <p className="text-sm font-bold text-[#0F172A] truncate mt-0.5">
              {selectedStaff.firstName} {selectedStaff.lastName}
            </p>
            <p className="text-[11px] text-[#64748B] truncate">
              {selectedStaff.specialization}
              {upcomingOverridesForStaff > 0 && (
                <>
                  {" · "}
                  <span className="text-amber-600 font-medium">
                    {upcomingOverridesForStaff} upcoming override
                    {upcomingOverridesForStaff > 1 ? "s" : ""}
                  </span>
                </>
              )}
            </p>
          </div>

          <span className="text-[11px] font-semibold text-[#1B3163] shrink-0 inline-flex items-center gap-1">
            Switch
            <ChevronDown className="w-3.5 h-3.5" />
          </span>
        </button>

        {/* Tab bar */}
        <MobileTabBar
          active={mobileTab}
          onChange={setMobileTab}
          overrideCount={upcomingOverridesForStaff}
        />

        {/* Tab content */}
        <div className="pt-1">
          {mobileTab === "schedule" && weeklyEditor}
          {mobileTab === "overrides" && <OverridesList {...overrideListProps} />}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          DESKTOP LAYOUT (lg+)
          ════════════════════════════════════════════ */}
      <div className="hidden lg:flex gap-6 items-start">
        <StaffSidebar
          staff={MOCK_STAFF}
          filtered={filteredStaff}
          search={staffSearch}
          onSearch={setStaffSearch}
          selectedId={selectedStaffId}
          onSelect={setSelectedStaffId}
          overrides={overrides}
        />

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
            {weeklyEditor}
            <OverridesList {...overrideListProps} />
          </div>
        </div>
      </div>

      {/* Mobile staff bottom sheet */}
      <StaffBottomSheet
        open={staffSheetOpen}
        onClose={() => setStaffSheetOpen(false)}
        staff={MOCK_STAFF}
        filtered={filteredStaff}
        search={staffSearch}
        onSearch={setStaffSearch}
        selectedId={selectedStaffId}
        onSelect={(id) => {
          setSelectedStaffId(id);
          setMobileTab("schedule");
          setStaffSheetOpen(false);
        }}
        overrides={overrides}
      />

      {/* Override slide-over */}
      <OverrideSlideover
        isOpen={slideoverOpen}
        onClose={() => setSlideoverOpen(false)}
        onSave={handleSaveOverride}
        staffId={selectedStaffId}
        staffName={`${selectedStaff.firstName} ${selectedStaff.lastName}`}
        editing={editingOverride}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Mobile tab bar
 * ───────────────────────────────────────────────────────────── */

interface MobileTabBarProps {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
  overrideCount: number;
}

function MobileTabBar({ active, onChange, overrideCount }: MobileTabBarProps) {
  return (
    <div className="flex bg-white rounded-2xl border border-[#E5E2D9] p-1 gap-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <TabButton
        label="Weekly"
        sublabel="Recurring"
        icon={<CalendarDays className="w-4 h-4" />}
        active={active === "schedule"}
        onClick={() => onChange("schedule")}
      />
      <TabButton
        label="Overrides"
        sublabel="One-off dates"
        icon={<RefreshCw className="w-4 h-4" />}
        badge={overrideCount}
        active={active === "overrides"}
        onClick={() => onChange("overrides")}
      />
    </div>
  );
}

interface TabButtonProps {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

function TabButton({ label, sublabel, icon, active, onClick, badge }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all",
        active
          ? "bg-[#1B3163] text-white shadow-sm"
          : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F2EC]",
      )}
    >
      {icon}
      <span className="flex flex-col items-start leading-tight">
        <span>{label}</span>
        <span className={cn("text-[10px] font-medium", active ? "text-white/70" : "text-[#94A3B8]")}>
          {sublabel}
        </span>
      </span>
      {badge != null && badge > 0 && (
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ml-auto sm:ml-0",
            active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Mobile staff bottom sheet — replaces the horizontal chip strip
 * with a focused, scrollable list. Far easier to scan, never
 * fights vertical page scroll.
 * ───────────────────────────────────────────────────────────── */

interface StaffBottomSheetProps {
  open: boolean;
  onClose: () => void;
  staff: StaffMember[];
  filtered: StaffMember[];
  search: string;
  onSearch: (v: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  overrides: AvailabilityOverride[];
}

function StaffBottomSheet({
  open,
  onClose,
  staff,
  filtered,
  search,
  onSearch,
  selectedId,
  onSelect,
  overrides,
}: StaffBottomSheetProps) {
  const today = new Date().toISOString().split("T")[0];

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm animate-in fade-in duration-150"
      />

      {/* Sheet */}
      <div className="relative mt-auto bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[85dvh] animate-in slide-in-from-bottom duration-200">
        {/* Grab handle */}
        <div className="pt-2 pb-1 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-[#E5E2D9]" />
        </div>

        <div className="px-4 sm:px-5 pb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#C4A882]">
              Pick staff
            </p>
            <h2 className="text-base font-bold text-[#0F172A]">
              {staff.length} staff member{staff.length === 1 ? "" : "s"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-[#F4F2EC] flex items-center justify-center text-[#475569] hover:bg-[#EAE7DE]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search by name or role…"
              className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:bg-white focus:border-transparent placeholder:text-[#94A3B8]"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-[max(env(safe-area-inset-bottom),1rem)]">
          {filtered.length === 0 ? (
            <p className="text-sm text-[#94A3B8] text-center py-10">No staff match that search.</p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((member) => {
                const isSelected = member.id === selectedId;
                const hasOverride = overrides.some(
                  (o) => o.staffId === member.id && o.date === today,
                );
                const onLeave = member.status === "on_leave";
                return (
                  <li key={member.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(member.id)}
                      className={cn(
                        "w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                        isSelected
                          ? "bg-[#EEF1F8]"
                          : "hover:bg-[#F4F2EC] active:bg-[#EAE7DE]",
                      )}
                    >
                      <span
                        className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold shrink-0"
                        style={
                          !member.avatarImage
                            ? {
                                backgroundColor: member.avatarColor + "22",
                                color: member.avatarColor,
                              }
                            : undefined
                        }
                      >
                        {member.avatarImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.avatarImage}
                            alt={member.firstName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </>
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm font-semibold truncate",
                            isSelected ? "text-[#1B3163]" : "text-[#0F172A]",
                          )}
                        >
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-[11px] text-[#64748B] truncate flex items-center gap-1.5 mt-0.5">
                          {member.specialization}
                          {onLeave && (
                            <span className="text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full font-semibold leading-none">
                              On leave
                            </span>
                          )}
                          {hasOverride && (
                            <span className="text-amber-700 font-medium">· override today</span>
                          )}
                        </p>
                      </div>

                      {isSelected && (
                        <span className="w-7 h-7 rounded-full bg-[#1B3163] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Desktop staff sidebar
 * ───────────────────────────────────────────────────────────── */

interface StaffSidebarProps {
  staff: StaffMember[];
  filtered: StaffMember[];
  search: string;
  onSearch: (v: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  overrides: AvailabilityOverride[];
}

function StaffSidebar({
  staff,
  filtered,
  search,
  onSearch,
  selectedId,
  onSelect,
  overrides,
}: StaffSidebarProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="w-60 shrink-0 bg-white rounded-2xl border border-[#E5E2D9] overflow-hidden flex flex-col shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {/* Header + search */}
      <div className="px-4 py-3 border-b border-[#EAE7DE]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider">Staff</h3>
          <span className="text-[10px] font-semibold text-[#64748B] bg-[#F4F2EC] px-1.5 py-0.5 rounded-full">
            {staff.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search staff…"
            className="w-full text-xs pl-7 pr-3 py-1.5 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:bg-white focus:border-transparent placeholder:text-[#94A3B8]"
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
        {filtered.length === 0 && (
          <p className="text-xs text-[#94A3B8] text-center py-6 px-4">No staff match your search</p>
        )}

        {filtered.map((member) => {
          const isSelected = member.id === selectedId;
          const hasOverride = overrides.some(
            (o) => o.staffId === member.id && o.date === today,
          );

          return (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelect(member.id)}
              className={cn(
                "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b border-[#F4F2EC] last:border-0",
                isSelected ? "bg-[#EEF1F8]" : "hover:bg-[#FAF8F3]",
              )}
            >
              <span
                className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold"
                style={
                  !member.avatarImage
                    ? { backgroundColor: member.avatarColor + "22", color: member.avatarColor }
                    : undefined
                }
              >
                {member.avatarImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.avatarImage}
                    alt={member.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </>
                )}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold leading-tight truncate",
                    isSelected ? "text-[#1B3163]" : "text-[#0F172A]",
                  )}
                >
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-xs text-[#64748B] truncate mt-0.5">{member.specialization}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <StatusPill status={member.status} />
                  {hasOverride && (
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wide">
                      Override
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Status pill
 * ───────────────────────────────────────────────────────────── */

function StatusPill({ status }: { status: StaffMember["status"] }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full leading-none">
        <span className="w-1 h-1 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }
  if (status === "on_leave") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full leading-none">
        <span className="w-1 h-1 rounded-full bg-amber-500" />
        Leave
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-full leading-none">
      Inactive
    </span>
  );
}

/* ── Utility ─────────────────────────────────────────────────────────── */

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}
