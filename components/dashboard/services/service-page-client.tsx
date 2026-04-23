"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { ServiceStats } from "./service-stats";
import { ServiceCard } from "./service-card";
import { ServiceSlideover } from "./service-slideover";
import { MOCK_SERVICES } from "@/lib/mock/services";
import { MOCK_STAFF } from "@/lib/mock/staff";
import type { Service } from "@/types/service";
import { CATEGORY_LABELS, type ServiceCategory } from "@/types/service";
import type { ServiceSchema } from "@/lib/validations/service";
import { useConfirm } from "@/hooks/use-confirm";
import { useToast } from "@/hooks/use-toast";
import { useQuickActionStore } from "@/store/quick-action-store";

type CategoryFilter = ServiceCategory | "all";
type StatusFilter   = "all" | "active" | "inactive";

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all",       label: "All categories" },
  { value: "hair",      label: CATEGORY_LABELS.hair },
  { value: "barber",    label: CATEGORY_LABELS.barber },
  { value: "nails",     label: CATEGORY_LABELS.nails },
  { value: "beauty",    label: CATEGORY_LABELS.beauty },
  { value: "lash_brow", label: CATEGORY_LABELS.lash_brow },
  { value: "massage",   label: CATEGORY_LABELS.massage },
  { value: "other",     label: CATEGORY_LABELS.other },
];

/* Minimal staff record needed by slideover */
const STAFF_LIST = MOCK_STAFF.map((s) => ({
  id:        s.id,
  firstName: s.firstName,
  lastName:  s.lastName,
}));

export function ServicePageClient() {
  const [services,      setServices]      = useState<Service[]>(MOCK_SERVICES);
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [editing,       setEditing]       = useState<Service | null>(null);

  /* Open add-service slideover automatically when navigated from a quick action */
  const { pendingAction, clear: clearPending } = useQuickActionStore();
  useEffect(() => {
    if (pendingAction === "service") {
      setSlideoverOpen(true);
      clearPending();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [search,        setSearch]        = useState("");
  const [catFilter,     setCatFilter]     = useState<CategoryFilter>("all");
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>("all");

  const confirm = useConfirm();
  const toast   = useToast();

  /* ── Derived list ──────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter((s) => {
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      const matchCat    = catFilter === "all" || s.category === catFilter;
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [services, search, catFilter, statusFilter]);

  /* ── Handlers ──────────────────────────────────── */
  const handleSave = (values: ServiceSchema, editingId?: string) => {
    if (editingId) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, ...values, depositAmount: values.depositAmount ?? null }
            : s
        )
      );
      toast.success({ title: "Service updated", message: `"${values.name}" has been saved.` });
    } else {
      const newService: Service = {
        id:        `svc-${Date.now()}`,
        ...values,
        depositAmount: values.depositAmount ?? null,
        createdAt: new Date().toISOString(),
      };
      setServices((prev) => [newService, ...prev]);
      toast.success({ title: "Service added", message: `"${values.name}" is now in your menu.` });
    }
  };

  const handleEdit = (service: Service) => {
    setEditing(service);
    setSlideoverOpen(true);
  };

  const handleDelete = async (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service) return;

    const ok = await confirm({
      variant:      "danger",
      title:        "Delete service?",
      message:      `"${service.name}" will be permanently removed from your booking menu.`,
      detail:       "Any upcoming bookings tied to this service will need to be reassigned manually.",
      confirmLabel: "Yes, delete",
    });

    if (ok) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success({ title: "Service deleted", message: `"${service.name}" has been removed.` });
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setSlideoverOpen(true);
  };

  /* ── Render ────────────────────────────────────── */
  return (
    <>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* ── Page header ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A]">Services</h1>
            <p className="text-sm mt-0.5 text-[#6B7280]">
              Manage your booking menu — pricing, timing, and availability.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-[#C4A882] text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-white shadow-sm"
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>

        {/* ── Stats ────────────────────────────────── */}
        <ServiceStats services={services} />

        {/* ── Filters ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9FB2D9]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="w-full rounded-xl text-sm py-2.5 pl-9 pr-4 bg-white border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40 transition-all duration-200 placeholder:text-[#6B7280]"
            />
          </div>

          {/* Category filter */}
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value as CategoryFilter)}
            className="rounded-xl text-sm py-2.5 px-3 appearance-none bg-white border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40 cursor-pointer"
            style={{ minWidth: 160 }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-xl text-sm py-2.5 px-3 appearance-none bg-white border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40 cursor-pointer"
            style={{ minWidth: 140 }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* ── Service grid ─────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E4DA]">
            <p className="text-sm text-[#6B7280]">
              {search || catFilter !== "all" || statusFilter !== "all"
                ? "No services match your filters."
                : "No services yet. Add your first one!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Slide-over ───────────────────────────── */}
      <ServiceSlideover
        isOpen={slideoverOpen}
        onClose={() => { setSlideoverOpen(false); setEditing(null); }}
        onSave={handleSave}
        editing={editing}
        staffList={STAFF_LIST}
      />
    </>
  );
}
