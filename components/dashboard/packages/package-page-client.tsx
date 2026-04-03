"use client";

import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { PackageStats } from "./package-stats";
import { PackageCard } from "./package-card";
import { PackageSlideover } from "./package-slideover";
import { MOCK_PACKAGES } from "@/lib/mock/packages";
import { MOCK_SERVICES } from "@/lib/mock/services";
import { MOCK_STAFF } from "@/lib/mock/staff";
import type { Package, PackageStatus } from "@/types/package";
import type { PackageSchema } from "@/lib/validations/package";
import { useConfirm } from "@/hooks/use-confirm";
import { useToast } from "@/hooks/use-toast";

type StatusFilter = "all" | PackageStatus;

const STAFF_LIST = MOCK_STAFF.map((s) => ({
  id:        s.id,
  firstName: s.firstName,
  lastName:  s.lastName,
}));

export function PackagePageClient() {
  const [packages,     setPackages]     = useState<Package[]>(MOCK_PACKAGES);
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [editing,       setEditing]      = useState<Package | null>(null);
  const [search,        setSearch]       = useState("");
  const [statusFilter,  setStatusFilter] = useState<StatusFilter>("all");

  const confirm = useConfirm();
  const toast   = useToast();

  /* ── Derived list ──────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return packages.filter((p) => {
      const matchSearch  = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchStatus  = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [packages, search, statusFilter]);

  /* ── Handlers ──────────────────────────────────── */
  const handleSave = (values: PackageSchema, editingId?: string) => {
    if (editingId) {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === editingId ? { ...p, ...values } : p
        )
      );
      toast.success({
        title:   "Package updated",
        message: `"${values.name}" has been saved.`,
      });
    } else {
      const newPkg: Package = {
        id:        `pkg-${Date.now()}`,
        ...values,
        createdAt: new Date().toISOString(),
      };
      setPackages((prev) => [newPkg, ...prev]);
      toast.success({
        title:   "Package created",
        message: `"${values.name}" is now available in your booking menu.`,
      });
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditing(pkg);
    setSlideoverOpen(true);
  };

  const handleDelete = async (id: string) => {
    const pkg = packages.find((p) => p.id === id);
    if (!pkg) return;

    const ok = await confirm({
      variant:      "danger",
      title:        "Delete package?",
      message:      `"${pkg.name}" will be permanently removed from your booking menu.`,
      detail:       "Any upcoming bookings tied to this package will need to be managed separately.",
      confirmLabel: "Yes, delete",
    });

    if (ok) {
      setPackages((prev) => prev.filter((p) => p.id !== id));
      toast.success({
        title:   "Package deleted",
        message: `"${pkg.name}" has been removed.`,
      });
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
            <h1 className="text-2xl font-bold text-[#0D1B2A]">Packages</h1>
            <p className="text-sm mt-0.5 text-[#8E95A5]">
              Bundle services into discounted offerings to increase bookings and average spend.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-[#C4A882] text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-white shadow-sm"
          >
            <Plus size={16} />
            Create Package
          </button>
        </div>

        {/* ── Stats ────────────────────────────────── */}
        <PackageStats packages={packages} services={MOCK_SERVICES} />

        {/* ── Filters ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9FB2D9]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search packages…"
              className="w-full rounded-xl text-sm py-2.5 pl-9 pr-4 bg-white border border-[#E8ECF4] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40 transition-all duration-200 placeholder:text-[#8E95A5]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-xl text-sm py-2.5 px-3 appearance-none bg-white border border-[#E8ECF4] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40 cursor-pointer"
            style={{ minWidth: 140 }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* ── Package grid ─────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8ECF4]">
            <p className="text-sm text-[#8E95A5]">
              {search || statusFilter !== "all"
                ? "No packages match your filters."
                : "No packages yet. Create your first bundle!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                services={MOCK_SERVICES}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Slide-over ───────────────────────────── */}
      <PackageSlideover
        isOpen={slideoverOpen}
        onClose={() => { setSlideoverOpen(false); setEditing(null); }}
        onSave={handleSave}
        editing={editing}
        services={MOCK_SERVICES}
        staffList={STAFF_LIST}
      />
    </>
  );
}
