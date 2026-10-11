"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ProductStats } from "./product-stats";
import { ProductCard } from "./product-card";
import { ProductSlideover } from "./product-slideover";
import { MOCK_PRODUCTS } from "@/lib/mock/products";
import type { Product } from "@/types/product";
import { PRODUCT_CATEGORY_LABELS, type ProductCategory } from "@/types/product";
import type { ProductSchema } from "@/lib/validations/product";
import { useConfirm } from "@/hooks/use-confirm";
import { useToast } from "@/hooks/use-toast";
import { useQuickActionStore } from "@/store/quick-action-store";

type CategoryFilter = ProductCategory | "all";
type StatusFilter   = "all" | "active" | "inactive";

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All categories" },
  ...(Object.keys(PRODUCT_CATEGORY_LABELS) as ProductCategory[]).map((c) => ({
    value: c,
    label: PRODUCT_CATEGORY_LABELS[c],
  })),
];

function fromSchema(values: ProductSchema): Omit<Product, "id" | "createdAt"> {
  return {
    name:              values.name,
    category:          values.category,
    description:       values.description,
    image:             values.image,
    sku:               values.sku ?? "",
    brand:             values.brand?.trim() ? values.brand.trim() : undefined,
    price:             values.price,
    cost:              values.cost,
    taxable:           values.taxable,
    trackInventory:    values.trackInventory,
    stockQuantity:     values.trackInventory ? values.stockQuantity ?? 0 : null,
    lowStockThreshold: values.trackInventory ? values.lowStockThreshold : null,
    status:            values.status,
  };
}

export function ProductPageClient() {
  const [products,      setProducts]      = useState<Product[]>(MOCK_PRODUCTS);
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [editing,       setEditing]       = useState<Product | null>(null);
  const [search,        setSearch]        = useState("");
  const [catFilter,     setCatFilter]     = useState<CategoryFilter>("all");
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>("all");

  const { pendingAction, clear: clearPending } = useQuickActionStore();
  useEffect(() => {
    if (pendingAction === "product") {
      setSlideoverOpen(true);
      clearPending();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const confirm = useConfirm();
  const toast   = useToast();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q);
      const matchCat    = catFilter === "all" || p.category === catFilter;
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [products, search, catFilter, statusFilter]);

  const handleSave = (values: ProductSchema, editingId?: string) => {
    if (editingId) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...fromSchema(values) } : p))
      );
      toast.success({ title: "Product updated", message: `"${values.name}" has been saved.` });
    } else {
      const newProduct: Product = {
        id: `prd-${Date.now()}`,
        ...fromSchema(values),
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      toast.success({ title: "Product added", message: `"${values.name}" is now in your shop.` });
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setSlideoverOpen(true);
  };

  const handleDelete = async (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const ok = await confirm({
      variant:      "danger",
      title:        "Delete product?",
      message:      `"${product.name}" will be removed from your shop and checkout.`,
      confirmLabel: "Yes, delete",
    });

    if (ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success({ title: "Product deleted", message: `"${product.name}" has been removed.` });
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setSlideoverOpen(true);
  };

  return (
    <>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B2A]">Products</h1>
            <p className="text-sm mt-0.5 text-[#6B7280]">
              Manage the merch you sell at the counter — pricing, stock, and margins.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/checkout"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-[#E8E4DA] text-[#0D1B2A] hover:bg-[#F5F3EE] transition-colors"
            >
              <ShoppingBag size={16} />
              Open checkout
            </Link>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 bg-[#C4A882] text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-white shadow-sm"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </div>

        <ProductStats products={products} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9FB2D9]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, SKU, brand…"
              className="w-full rounded-xl text-sm py-2.5 pl-9 pr-4 bg-white border border-[#E8E4DA] text-[#0D1B2A] outline-none focus:border-[#C4A882]/40 transition-all duration-200 placeholder:text-[#6B7280]"
            />
          </div>
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

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E4DA]">
            <p className="text-sm text-[#6B7280]">
              {search || catFilter !== "all" || statusFilter !== "all"
                ? "No products match your filters."
                : "No products yet. Add your first one!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <ProductSlideover
        isOpen={slideoverOpen}
        onClose={() => { setSlideoverOpen(false); setEditing(null); }}
        onSave={handleSave}
        editing={editing}
      />
    </>
  );
}
