import { Clock, Pencil, Trash2, Wifi, WifiOff, Users } from "lucide-react";
import type { Package } from "@/types/package";
import type { Service } from "@/types/service";
import { CATEGORY_COLORS } from "@/types/service";
import {
  calculateBasePrice,
  calculateBaseDuration,
  calculateFinalPrice,
  calculateSaving,
  formatDuration,
  formatPrice,
} from "@/lib/utils/package-calculations";

interface PackageCardProps {
  pkg:      Package;
  services: Service[];
  onEdit:   (pkg: Package) => void;
  onDelete: (id: string) => void;
}

export function PackageCard({ pkg, services, onEdit, onDelete }: PackageCardProps) {
  const included  = services.filter((s) => pkg.serviceIds.includes(s.id));
  const base      = calculateBasePrice(included);
  const baseDur   = calculateBaseDuration(included);
  const effectiveDur = pkg.customDurationMinutes ?? baseDur;
  const finalPrice   = calculateFinalPrice(
    base,
    pkg.discountEnabled ? pkg.discountType : null,
    pkg.discountEnabled ? pkg.discountValue : null
  );
  const saving      = calculateSaving(base, finalPrice);
  const isDiscounted = saving.amount > 0;
  const isInactive   = pkg.status === "inactive";

  return (
    <article
      className="bg-white rounded-2xl flex flex-col group transition-shadow hover:shadow-md overflow-hidden"
      style={{
        border:    "1px solid #E8ECF4",
        boxShadow: "0 1px 3px rgba(27,49,99,0.06)",
        opacity:   isInactive ? 0.72 : 1,
      }}
    >
      {/* ── Brand accent strip ─────────────────────── */}
      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: "#1B3163" }} />

      <div className="flex flex-col flex-1 px-5 pt-4 pb-5 gap-3.5">

        {/* ── Header ────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">

            {/* Status badges */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {isInactive ? (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ color: "#8E95A5", backgroundColor: "#F3F4F6" }}
                >
                  Inactive
                </span>
              ) : (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: "#16A34A", backgroundColor: "#DCFCE7" }}
                >
                  Active
                </span>
              )}
              <span className="flex items-center gap-1 text-[10px]" style={{ color: pkg.onlineBookingEnabled ? "#16A34A" : "#8E95A5" }}>
                {pkg.onlineBookingEnabled
                  ? <Wifi size={10} />
                  : <WifiOff size={10} />}
                {pkg.onlineBookingEnabled ? "Online booking" : "Walk-in only"}
              </span>
            </div>

            <h3 className="font-bold text-base leading-tight" style={{ color: "#1B3163" }}>
              {pkg.name}
            </h3>
          </div>

          {/* Edit / delete — appear on hover */}
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(pkg)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#F0F3FA", border: "1px solid #E8ECF4", color: "#1B3163" }}
              title="Edit package"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(pkg.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
              title="Delete package"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* ── Description ───────────────────────────── */}
        {pkg.description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#6B7A99" }}>
            {pkg.description}
          </p>
        )}

        {/* ── Service chips ─────────────────────────── */}
        <div className="flex flex-wrap gap-1.5">
          {included.length > 0 ? (
            included.map((svc) => {
              const cat = CATEGORY_COLORS[svc.category];
              return (
                <span
                  key={svc.id}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ color: cat.color, backgroundColor: cat.bg }}
                >
                  {svc.name}
                </span>
              );
            })
          ) : (
            <span className="text-xs italic" style={{ color: "#8E95A5" }}>No services linked</span>
          )}
        </div>

        {/* ── Meta row ──────────────────────────────── */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "#8E95A5" }}>
            <Clock size={13} style={{ color: "#9FB2D9" }} />
            {formatDuration(effectiveDur)}
            {pkg.customDurationMinutes != null && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
              >
                custom
              </span>
            )}
          </span>
          {pkg.staffIds.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#8E95A5" }}>
              <Users size={13} style={{ color: "#9FB2D9" }} />
              {pkg.staffIds.length} staff
            </span>
          )}
        </div>

        {/* ── Pricing footer ────────────────────────── */}
        <div
          className="flex items-end justify-between pt-3 mt-auto"
          style={{ borderTop: "1px solid #F0F3FA" }}
        >
          <div>
            {isDiscounted && (
              <p className="text-xs line-through" style={{ color: "#8E95A5" }}>
                ${formatPrice(base)}
              </p>
            )}
            <p className="text-xl font-bold" style={{ color: "#1B3163" }}>
              ${formatPrice(finalPrice)}
            </p>
          </div>

          {isDiscounted && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-xl"
              style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}
            >
              Save ${formatPrice(saving.amount)} &nbsp;·&nbsp; {saving.percentage}% off
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
