"use client";

import { useState, useMemo } from "react";
import {
  CalendarCog,
  Search,
  CheckCircle2,
  CircleDashed,
  CalendarDays,
  RefreshCw,
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

  /* ── Derived ── */
  const selectedStaff = MOCK_STAFF.find((s) => s.id === selectedStaffId)!;
  const selectedSchedule = schedules.find((s) => s.staffId === selectedStaffId);
  const staffOverrides = overrides.filter((o) => o.staffId === selectedStaffId);

  const filteredStaff = useMemo(() => {
    const q = staffSearch.toLowerCase();
    return MOCK_STAFF.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.specialization.toLowerCase().includes(q)
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
            : o
        )
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
    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
      <CalendarCog className="w-8 h-8 text-gray-200 mx-auto mb-2" />
      <p className="text-gray-400 text-sm">No schedule found for this staff member.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage weekly schedules and date-specific overrides for your team
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 shrink-0">
          <CalendarCog className="w-3.5 h-3.5" />
          AEDT · stored as UTC
        </div>
      </div>

      {/* ── Stats ── */}
      <AvailabilityStats schedules={schedules} overrides={overrides} />

      {/* ════════════════════════════════════════════
          MOBILE LAYOUT  (hidden on lg+)
          ════════════════════════════════════════════ */}
      <div className="lg:hidden space-y-4">
        {/* Staff selector */}
        <MobileStaffSelector
          staff={MOCK_STAFF}
          filtered={filteredStaff}
          search={staffSearch}
          onSearch={setStaffSearch}
          selectedId={selectedStaffId}
          onSelect={(id) => {
            setSelectedStaffId(id);
            setMobileTab("schedule"); // reset tab on staff change
          }}
          overrides={overrides}
        />

        {/* Selected staff context bar */}
        <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              backgroundColor: selectedStaff.avatarColor + "22",
              color: selectedStaff.avatarColor,
            }}
          >
            {selectedStaff.firstName[0]}{selectedStaff.lastName[0]}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {selectedStaff.firstName} {selectedStaff.lastName}
            </p>
            <p className="text-xs text-gray-400 truncate">{selectedStaff.specialization}</p>
          </div>
          <div className="ml-auto text-xs text-gray-400 shrink-0">
            {staffOverrides.filter((o) => o.date >= new Date().toISOString().split("T")[0]).length} overrides
          </div>
        </div>

        {/* Schedule / Overrides tab bar */}
        <MobileTabBar
          active={mobileTab}
          onChange={setMobileTab}
          overrideCount={
            staffOverrides.filter((o) => o.date >= new Date().toISOString().split("T")[0]).length
          }
        />

        {/* Tab content */}
        {mobileTab === "schedule" && weeklyEditor}
        {mobileTab === "overrides" && <OverridesList {...overrideListProps} />}
      </div>

      {/* ════════════════════════════════════════════
          DESKTOP LAYOUT  (hidden below lg)
          ════════════════════════════════════════════ */}
      <div className="hidden lg:flex gap-6 items-start">
        {/* Staff sidebar */}
        <StaffSidebar
          staff={MOCK_STAFF}
          filtered={filteredStaff}
          search={staffSearch}
          onSearch={setStaffSearch}
          selectedId={selectedStaffId}
          onSelect={setSelectedStaffId}
          overrides={overrides}
        />

        {/* Content grid */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
            {weeklyEditor}
            <OverridesList {...overrideListProps} />
          </div>
        </div>
      </div>

      {/* Override slide-over (shared) */}
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

/* ── Mobile Staff Selector ────────────────────────────────────────────
 * Search input + horizontal scroll chips.
 * Works for any team size — the chip strip scrolls.
 * ─────────────────────────────────────────────────────────────────── */

interface MobileStaffSelectorProps {
  staff: StaffMember[];
  filtered: StaffMember[];
  search: string;
  onSearch: (v: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  overrides: AvailabilityOverride[];
}

function MobileStaffSelector({
  staff,
  filtered,
  search,
  onSearch,
  selectedId,
  onSelect,
  overrides,
}: MobileStaffSelectorProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Staff
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
            {staff.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search staff…"
            className="w-full text-sm pl-8 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:bg-white focus:border-transparent placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Horizontal chip strip */}
      <div className="px-4 pb-3 overflow-x-auto flex gap-2 [-webkit-overflow-scrolling:touch]">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 py-2 whitespace-nowrap">No staff found</p>
        ) : (
          filtered.map((member) => {
            const isSelected = member.id === selectedId;
            const hasOverride = overrides.some(
              (o) => o.staffId === member.id && o.date === today
            );

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelect(member.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap transition-all shrink-0",
                  isSelected
                    ? "bg-[#1B3163] text-white border-[#1B3163] shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#1B3163]"
                )}
              >
                {/* Avatar */}
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(255,255,255,0.2)"
                      : member.avatarColor + "22",
                    color: isSelected ? "white" : member.avatarColor,
                  }}
                >
                  {member.firstName[0]}
                </span>

                {member.firstName}

                {/* Status indicators */}
                {member.status === "on_leave" && (
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded-full font-normal",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-600"
                    )}
                  >
                    Leave
                  </span>
                )}
                {hasOverride && (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      isSelected ? "bg-amber-300" : "bg-amber-400"
                    )}
                    title="Has override today"
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ── Mobile Tab Bar ───────────────────────────────────────────────────── */

interface MobileTabBarProps {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
  overrideCount: number;
}

function MobileTabBar({ active, onChange, overrideCount }: MobileTabBarProps) {
  return (
    <div className="flex bg-white rounded-xl border border-gray-100 p-1 gap-1">
      <TabButton
        label="Weekly Schedule"
        icon={<CalendarDays className="w-4 h-4" />}
        active={active === "schedule"}
        onClick={() => onChange("schedule")}
      />
      <TabButton
        label="Date Overrides"
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
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

function TabButton({ label, icon, active, onClick, badge }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all",
        active
          ? "bg-[#1B3163] text-white shadow-sm"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      )}
    >
      {icon}
      <span className="hidden xs:inline sm:inline">{label}</span>
      {badge != null && badge > 0 && (
        <span
          className={cn(
            "text-xs px-1.5 py-0.5 rounded-full font-semibold leading-none",
            active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-600"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/* ── Desktop Staff Sidebar ────────────────────────────────────────────── */

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
    <div className="w-56 shrink-0 bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
      {/* Header + search */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Staff</h3>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
            {staff.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search staff…"
            className="w-full text-xs pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1B3163] focus:bg-white focus:border-transparent placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-6 px-4">No staff match your search</p>
        )}

        {filtered.map((member) => {
          const isSelected = member.id === selectedId;
          const hasOverride = overrides.some(
            (o) => o.staffId === member.id && o.date === today
          );

          return (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelect(member.id)}
              className={cn(
                "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b border-gray-50 last:border-0",
                isSelected ? "bg-[#EEF1F8]" : "hover:bg-gray-50"
              )}
            >
              <span
                className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold"
                style={!member.avatarImage ? { backgroundColor: member.avatarColor + "22", color: member.avatarColor } : undefined}
              >
                {member.avatarImage
                  ? <img src={member.avatarImage} alt={member.firstName} className="w-full h-full object-cover" />
                  : <>{member.firstName[0]}{member.lastName[0]}</>
                }
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium leading-tight truncate",
                    isSelected ? "text-[#1B3163]" : "text-gray-800"
                  )}
                >
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{member.specialization}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <StatusIcon status={member.status} />
                  {hasOverride && (
                    <span className="text-xs text-amber-600 font-medium">override today</span>
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

/* ── Status icon ──────────────────────────────────────────────────────── */

function StatusIcon({ status }: { status: StaffMember["status"] }) {
  if (status === "active") return <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />;
  if (status === "on_leave") {
    return (
      <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium leading-none">
        On leave
      </span>
    );
  }
  return <CircleDashed className="w-3 h-3 text-gray-300 shrink-0" />;
}

/* ── Utility ──────────────────────────────────────────────────────────── */

function formatDateShort(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}
