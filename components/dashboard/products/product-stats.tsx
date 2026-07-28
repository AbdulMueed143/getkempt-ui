import { Boxes, CheckCircle2, AlertTriangle, Wallet } from "lucide-react";
import type { Product } from "@/types/product";
import { isLowStock, isOutOfStock } from "@/types/product";
import { formatMoney } from "@/lib/utils/currency";

interface ProductStatsProps {
  products: Product[];
}

export function ProductStats({ products }: ProductStatsProps) {
  const total  = products.length;
  const active = products.filter((p) => p.status === "active").length;
  const lowOrOut = products.filter(
    (p) => isOutOfStock(p) || isLowStock(p)
  ).length;

  const stockValue = products.reduce(
    (sum, p) => sum + (p.trackInventory ? (p.stockQuantity ?? 0) * (p.cost ?? 0) : 0),
    0
  );

  const stats = [
    {
      icon:      <Boxes size={18} />,
      label:     "Total Products",
      value:     total,
      iconColor: "#0D1B2A",
      iconBg:    "#E8E4DA",
    },
    {
      icon:      <CheckCircle2 size={18} />,
      label:     "Active",
      value:     active,
      iconColor: "#16A34A",
      iconBg:    "#DCFCE7",
    },
    {
      icon:      <AlertTriangle size={18} />,
      label:     "Low / out of stock",
      value:     lowOrOut,
      iconColor: "#D97706",
      iconBg:    "#FEF3C7",
    },
    {
      icon:      <Wallet size={18} />,
      label:     "Stock value (cost)",
      value:     formatMoney(stockValue),
      iconColor: "#1B3163",
      iconBg:    "#EEF1F8",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-[#E8E4DA] shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}
          >
            {stat.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs truncate text-[#6B7280]">{stat.label}</p>
            <p className="text-lg font-bold leading-tight truncate text-[#0D1B2A]">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
