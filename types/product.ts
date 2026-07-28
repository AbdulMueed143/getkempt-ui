/* ── Retail product / merch ──────────────────────────────────────────────
 *
 * A "product" is physical stock the shop sells over the counter — pomade,
 * beard oil, shampoo, tools, gift sets, etc. Products are NOT bookable; they
 * are added to a sale at checkout (see types/checkout.ts).
 *
 * Money is stored here as a plain AUD number for the mock/demo. The backend
 * contract uses integer cents (`priceCents`) — see docs/PRODUCTS_AND_CHECKOUT.md.
 * ---------------------------------------------------------------------------*/

export type ProductCategory =
  | "hair_care"
  | "skin_care"
  | "styling"
  | "grooming"
  | "tools"
  | "accessories"
  | "gift"
  | "other";

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  hair_care:   "Hair Care",
  skin_care:   "Skin Care",
  styling:     "Styling",
  grooming:    "Grooming",
  tools:       "Tools",
  accessories: "Accessories",
  gift:        "Gift Sets",
  other:       "Other",
};

export const PRODUCT_CATEGORY_COLORS: Record<
  ProductCategory,
  { color: string; bg: string }
> = {
  hair_care:   { color: "#1B3163", bg: "#EEF1F8" },
  skin_care:   { color: "#6B21A8", bg: "#F3E8FF" },
  styling:     { color: "#92400E", bg: "#FEF3C7" },
  grooming:    { color: "#065F46", bg: "#D1FAE5" },
  tools:       { color: "#0F766E", bg: "#CCFBF1" },
  accessories: { color: "#9D174D", bg: "#FCE7F3" },
  gift:        { color: "#B45309", bg: "#FEF9C3" },
  other:       { color: "#374151", bg: "#F3F4F6" },
};

export type ProductStatus = "active" | "inactive";

export interface Product {
  id: string;

  /* Identity */
  name:        string;
  category:    ProductCategory;
  description: string;
  image?:      string;    // data URL or CDN URL
  /** Stock-keeping unit / scannable barcode. Optional but recommended. */
  sku:         string;
  brand?:      string;

  /* Pricing (AUD, GST-inclusive retail price) */
  price:   number;
  /** Wholesale cost — powers margin reporting. Not shown to customers. */
  cost:    number | null;
  /** Whether GST applies to this product (true for almost all retail goods). */
  taxable: boolean;

  /* Inventory */
  trackInventory:    boolean;
  /** Units on hand. `null` when `trackInventory` is false. */
  stockQuantity:     number | null;
  /** Warn / flag when stock drops to or below this. `null` = no alert. */
  lowStockThreshold: number | null;

  /* Availability */
  status: ProductStatus;

  createdAt: string;
}

export interface ProductFormValues {
  name:              string;
  category:          ProductCategory;
  description:       string;
  image?:            string;
  sku:               string;
  brand?:            string;
  price:             number;
  cost:              number | null;
  taxable:           boolean;
  trackInventory:    boolean;
  stockQuantity:     number | null;
  lowStockThreshold: number | null;
  status:            ProductStatus;
}

/** Convenience: is this product sold out (only meaningful when tracked). */
export function isOutOfStock(p: Product): boolean {
  return p.trackInventory && (p.stockQuantity ?? 0) <= 0;
}

/** Convenience: is stock at or below the low-stock threshold. */
export function isLowStock(p: Product): boolean {
  return (
    p.trackInventory &&
    p.lowStockThreshold != null &&
    (p.stockQuantity ?? 0) > 0 &&
    (p.stockQuantity ?? 0) <= p.lowStockThreshold
  );
}
