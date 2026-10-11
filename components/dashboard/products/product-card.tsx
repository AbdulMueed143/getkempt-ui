import { DollarSign, Pencil, Trash2, Package, AlertTriangle, XCircle } from "lucide-react";
import type { Product } from "@/types/product";
import {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_CATEGORY_COLORS,
  isLowStock,
  isOutOfStock,
} from "@/types/product";

interface ProductCardProps {
  product:  Product;
  onEdit:   (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const cat        = PRODUCT_CATEGORY_COLORS[product.category];
  const isInactive = product.status === "inactive";
  const outOfStock = isOutOfStock(product);
  const lowStock   = isLowStock(product);

  const margin =
    product.cost != null && product.price > 0
      ? Math.round(((product.price - product.cost) / product.price) * 100)
      : null;

  return (
    <article
      className="bg-white rounded-2xl overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-lg border border-[#E8E4DA] shadow-sm"
      style={{ opacity: isInactive ? 0.7 : 1 }}
    >
      {product.image ? (
        <div className="relative h-28 shrink-0 overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <span
            className="absolute bottom-2 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: cat.color, backgroundColor: cat.bg + "ee" }}
          >
            {PRODUCT_CATEGORY_LABELS[product.category]}
          </span>
        </div>
      ) : (
        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: cat.color }} />
      )}

      <div className="flex flex-col flex-1 px-5 py-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {!product.image && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: cat.color, backgroundColor: cat.bg }}
                >
                  {PRODUCT_CATEGORY_LABELS[product.category]}
                </span>
              )}
              {isInactive && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-[#6B7280] bg-[#F3F4F6]">
                  Inactive
                </span>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight text-[#0D1B2A]">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-xs mt-0.5 text-[#9FB2D9]">{product.brand}</p>
            )}
          </div>

          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(product)}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F5F3EE] border border-[#E8E4DA] text-[#0D1B2A] hover:bg-[#E8E4DA] transition-colors"
              title="Edit product"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-colors"
              title="Delete product"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {product.description && (
          <p className="text-xs leading-relaxed line-clamp-2 text-[#6B7A99]">
            {product.description}
          </p>
        )}

        {/* Stock + SKU row */}
        <div className="flex items-center gap-4 flex-wrap">
          {product.trackInventory ? (
            outOfStock ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                <XCircle size={13} /> Out of stock
              </span>
            ) : lowStock ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#D97706]">
                <AlertTriangle size={13} /> Low · {product.stockQuantity} left
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <Package size={13} className="text-[#9FB2D9]" />
                {product.stockQuantity} in stock
              </span>
            )
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <Package size={13} className="text-[#9FB2D9]" /> Not tracked
            </span>
          )}

          {product.sku && (
            <span className="text-xs text-[#9FB2D9] font-mono">{product.sku}</span>
          )}
        </div>

        {/* Footer: price + margin */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-[#F0EEE6]">
          <div className="flex items-baseline gap-0.5">
            <DollarSign size={14} className="text-[#0D1B2A]" />
            <span className="text-xl font-bold text-[#0D1B2A]">
              {product.price.toFixed(2)}
            </span>
          </div>
          {margin != null && (
            <span className="text-xs text-[#6B7280]">{margin}% margin</span>
          )}
        </div>
      </div>
    </article>
  );
}
