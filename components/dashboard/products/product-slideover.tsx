"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Tag, DollarSign, Boxes, Settings2, AlertTriangle } from "lucide-react";
import { productSchema, type ProductSchema } from "@/lib/validations/product";
import { LOW_STOCK_PRESETS } from "@/lib/mock/products";
import { PRODUCT_CATEGORY_LABELS } from "@/types/product";
import type { Product, ProductCategory } from "@/types/product";
import { ImageUpload } from "@/components/ui/image-upload";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils/cn";

const CATEGORIES: ProductCategory[] = [
  "hair_care", "skin_care", "styling", "grooming",
  "tools", "accessories", "gift", "other",
];

interface ProductSlideoverProps {
  isOpen:   boolean;
  onClose:  () => void;
  onSave:   (values: ProductSchema, editingId?: string) => void;
  editing?: Product | null;
}

const DEFAULTS: ProductSchema = {
  image:             undefined,
  name:              "",
  category:          "hair_care",
  description:       "",
  sku:               "",
  brand:             "",
  price:             0,
  cost:              null,
  taxable:           true,
  trackInventory:    true,
  stockQuantity:     0,
  lowStockThreshold: 5,
  status:            "active",
};

export function ProductSlideover({ isOpen, onClose, onSave, editing }: ProductSlideoverProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULTS,
  });

  const watchedTrack = watch("trackInventory");

  useEffect(() => {
    if (editing) {
      reset({
        image:             editing.image,
        name:              editing.name,
        category:          editing.category,
        description:       editing.description,
        sku:               editing.sku,
        brand:             editing.brand ?? "",
        price:             editing.price,
        cost:              editing.cost,
        taxable:           editing.taxable,
        trackInventory:    editing.trackInventory,
        stockQuantity:     editing.stockQuantity,
        lowStockThreshold: editing.lowStockThreshold,
        status:            editing.status,
      });
    } else {
      reset(DEFAULTS);
    }
  }, [editing, reset]);

  const onSubmit = (values: ProductSchema) => {
    onSave(values, editing?.id);
    onClose();
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-[540px] z-50 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ backgroundColor: "#FFFFFF", boxShadow: "-4px 0 24px rgba(27,49,99,0.12)" }}
      >
        <div className="flex items-center justify-between px-6 py-5 shrink-0" style={{ borderBottom: "1px solid #E8E4DA" }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#1B3163" }}>
              {editing ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
              {editing ? "Update retail product details" : "Add a merch item you sell at the counter"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#F0EEE6", color: "#1B3163" }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ── Identity ── */}
            <SlidSection icon={<Tag size={15} />} title="Product Details">
              <FieldWrap label="Product Image">
                <Controller
                  control={control}
                  name="image"
                  render={({ field }) => (
                    <ImageUpload
                      aspect="landscape"
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v ?? undefined)}
                      hint="Shown on product cards and at checkout"
                      maxSizeMB={5}
                    />
                  )}
                />
              </FieldWrap>

              <FieldWrap label="Product Name" error={errors.name?.message} required>
                <SlidInput placeholder="e.g. Matte Clay Pomade" {...register("name")} hasError={!!errors.name} />
              </FieldWrap>

              <FieldWrap label="Brand" error={errors.brand?.message}>
                <SlidInput placeholder="e.g. Kempt Grooming Co." {...register("brand")} hasError={!!errors.brand} />
              </FieldWrap>

              <FieldWrap label="Category" error={errors.category?.message} required>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => (
                        <label
                          key={cat}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm"
                          style={{
                            border:          `1.5px solid ${field.value === cat ? "#1B3163" : "#E8E4DA"}`,
                            backgroundColor: field.value === cat ? "#EEF1F8" : "#FAF8F3",
                            color:           field.value === cat ? "#1B3163" : "#6B7A99",
                            fontWeight:      field.value === cat ? 600 : 400,
                          }}
                        >
                          <input
                            type="radio"
                            className="accent-[#1B3163] shrink-0"
                            value={cat}
                            checked={field.value === cat}
                            onChange={() => field.onChange(cat)}
                          />
                          {PRODUCT_CATEGORY_LABELS[cat]}
                        </label>
                      ))}
                    </div>
                  )}
                />
              </FieldWrap>

              <FieldWrap label="SKU / Barcode" error={errors.sku?.message}>
                <SlidInput placeholder="e.g. STY-CLAY-100" {...register("sku")} hasError={!!errors.sku} />
              </FieldWrap>

              <FieldWrap label="Description" error={errors.description?.message}>
                <textarea
                  placeholder="Short description shown at checkout"
                  rows={3}
                  className="w-full rounded-lg text-sm px-4 py-2.5 resize-none"
                  style={{ backgroundColor: "#FAF8F3", border: "1px solid #E8E4DA", color: "#1B3163", outline: "none" }}
                  {...register("description")}
                />
              </FieldWrap>
            </SlidSection>

            {/* ── Pricing ── */}
            <SlidSection icon={<DollarSign size={15} />} title="Pricing">
              <FieldWrap label="Retail Price (AUD, incl. GST)" error={errors.price?.message} required>
                <SlidInput
                  type="number" step="0.01" min="0" placeholder="0.00"
                  icon={<DollarSign size={15} />}
                  {...register("price", { valueAsNumber: true })}
                  hasError={!!errors.price}
                />
              </FieldWrap>

              <FieldWrap label="Wholesale Cost (optional)" error={errors.cost?.message}>
                <SlidInput
                  type="number" step="0.01" min="0" placeholder="Used for margin reporting"
                  icon={<DollarSign size={15} />}
                  {...register("cost", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })}
                  hasError={!!errors.cost}
                />
              </FieldWrap>

              <label className="flex items-center justify-between cursor-pointer py-2">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#1B3163" }}>Taxable (GST)</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                    Price includes 10% GST. Turn off for GST-free items.
                  </p>
                </div>
                <Controller
                  name="taxable"
                  control={control}
                  render={({ field }) => <Toggle checked={field.value} onChange={field.onChange} />}
                />
              </label>
            </SlidSection>

            {/* ── Inventory ── */}
            <SlidSection icon={<Boxes size={15} />} title="Inventory">
              <label className="flex items-center justify-between cursor-pointer py-2">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#1B3163" }}>Track inventory</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                    Count stock down on each sale and warn when low
                  </p>
                </div>
                <Controller
                  name="trackInventory"
                  control={control}
                  render={({ field }) => (
                    <Toggle
                      checked={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        if (!val) {
                          setValue("stockQuantity", null);
                          setValue("lowStockThreshold", null);
                        } else {
                          setValue("stockQuantity", 0);
                          setValue("lowStockThreshold", 5);
                        }
                      }}
                    />
                  )}
                />
              </label>

              {watchedTrack && (
                <>
                  <FieldWrap label="Stock on hand" error={errors.stockQuantity?.message} required>
                    <SlidInput
                      type="number" min="0" placeholder="0"
                      {...register("stockQuantity", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })}
                      hasError={!!errors.stockQuantity}
                    />
                  </FieldWrap>

                  <FieldWrap label="Low-stock alert at" error={errors.lowStockThreshold?.message}>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {LOW_STOCK_PRESETS.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setValue("lowStockThreshold", n, { shouldValidate: true })}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              backgroundColor: watch("lowStockThreshold") === n ? "#1B3163" : "#F0EEE6",
                              color:           watch("lowStockThreshold") === n ? "#EAEAEA" : "#1B3163",
                              border:          `1px solid ${watch("lowStockThreshold") === n ? "#1B3163" : "#E8E4DA"}`,
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <SlidInput
                        type="number" min="0" placeholder="Or type a custom threshold"
                        {...register("lowStockThreshold", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })}
                        hasError={!!errors.lowStockThreshold}
                      />
                    </div>
                  </FieldWrap>
                </>
              )}
            </SlidSection>

            {/* ── Availability ── */}
            <SlidSection icon={<Settings2 size={15} />} title="Availability">
              <FieldWrap label="Status" error={errors.status?.message} required>
                <SlidSelect {...register("status")} hasError={!!errors.status}>
                  <option value="active">Active — available to sell</option>
                  <option value="inactive">Inactive — hidden at checkout</option>
                </SlidSelect>
              </FieldWrap>
            </SlidSection>

          </form>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 shrink-0" style={{ borderTop: "1px solid #E8E4DA" }}>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#F0EEE6", color: "#1B3163", border: "1px solid #E8E4DA" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: "#D5B584", color: "#1B3163" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1B3163"; (e.currentTarget as HTMLButtonElement).style.color = "#EAEAEA"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#D5B584"; (e.currentTarget as HTMLButtonElement).style.color = "#1B3163"; }}
          >
            {isSubmitting ? "Saving…" : editing ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Scoped micro-components (match service slideover) ── */
function SlidSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5 space-y-4" style={{ borderBottom: "1px solid #F0EEE6" }}>
      <div className="flex items-center gap-2">
        <span style={{ color: "#1B3163" }}>{icon}</span>
        <h3 className="text-sm font-semibold" style={{ color: "#1B3163" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FieldWrap({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "#6B7280" }}>
        {label}{required && <span className="text-[#D5B584] ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3 shrink-0" />{error}</p>}
    </div>
  );
}

interface SlidInputProps extends React.InputHTMLAttributes<HTMLInputElement> { hasError?: boolean; icon?: React.ReactNode; }
const SlidInput = React.forwardRef<HTMLInputElement, SlidInputProps>(({ hasError, icon, ...props }, ref) => (
  <div className="relative flex items-center">
    {icon && <span className="absolute left-3 pointer-events-none" style={{ color: "#9FB2D9" }}>{icon}</span>}
    <input
      ref={ref}
      className="w-full rounded-lg text-sm py-2.5 transition-all"
      style={{ paddingLeft: icon ? "2.25rem" : "1rem", paddingRight: "1rem", backgroundColor: "#FAF8F3", border: `1px solid ${hasError ? "#EF4444" : "#E8E4DA"}`, color: "#1B3163", outline: "none" }}
      onFocus={(e) => { e.currentTarget.style.border = "1px solid #1B3163"; e.currentTarget.style.backgroundColor = "white"; }}
      onBlur={(e) => { e.currentTarget.style.border = `1px solid ${hasError ? "#EF4444" : "#E8E4DA"}`; e.currentTarget.style.backgroundColor = "#FAF8F3"; }}
      {...props}
    />
  </div>
));
SlidInput.displayName = "SlidInput";

interface SlidSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { hasError?: boolean; }
const SlidSelect = React.forwardRef<HTMLSelectElement, SlidSelectProps>(({ hasError, children, ...props }, ref) => (
  <select ref={ref} className="w-full rounded-lg text-sm py-2.5 px-4 appearance-none" style={{ backgroundColor: "#FAF8F3", border: `1px solid ${hasError ? "#EF4444" : "#E8E4DA"}`, color: "#1B3163", outline: "none" }} {...props}>{children}</select>
));
SlidSelect.displayName = "SlidSelect";
