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
      className="bg-white rounded-2xl flex flex-col group transition-all duration-200 hover:shadow-lg overflow-hidden border border-[#E8ECF4] shadow-sm"
      style={{ opacity: isInactive ? 0.72 : 1 }}
    >
      {/* ── Header: cover image or brand accent strip ── */}
      {pkg.image ? (
        <div className="relative h-28 shrink-0 overflow-hidden">
          <img
            src={pkg.image}
            alt={pkg.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      ) : (
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-[#0D1B2A] to-[#1B3163]" />
      )}

      <div className="flex flex-col flex-1 px-5 pt-4 pb-5 gap-3.5">

        {/* ── Header ────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">

            {/* Status badges */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {isInactive ? (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full text-[#8E95A5] bg-[#F3F4F6]">
                  Inactive
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-[#16A34A] bg-[#DCFCE7]">
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

            <h3 className="font-bold text-base leading-tight text-[#0D1B2A]">
              {pkg.name}
            </h3>
          </div>

          {/* Edit / delete — appear on hover */}
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(pkg)}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F4F2EE] border border-[#E8ECF4] text-[#0D1B2A] hover:bg-[#E8ECF4] transition-colors"
              title="Edit package"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(pkg.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-colors"
              title="Delete package"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* ── Description ───────────────────────────── */}
        {pkg.description && (
          <p className="text-xs leading-relaxed line-clamp-2 text-[#6B7A99]">
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
            <span className="text-xs italic text-[#8E95A5]">No services linked</span>
          )}
        </div>

        {/* ── Meta row ──────────────────────────────── */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-[#8E95A5]">
            <Clock size={13} className="text-[#9FB2D9]" />
            {formatDuration(effectiveDur)}
            {pkg.customDurationMinutes != null && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E]">
                custom
              </span>
            )}
          </span>
          {pkg.staffIds.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-[#8E95A5]">
              <Users size={13} className="text-[#9FB2D9]" />
              {pkg.staffIds.length} staff
            </span>
          )}
        </div>

        {/* ── Pricing footer ────────────────────────── */}
        <div className="flex items-end justify-between pt-3 mt-auto border-t border-[#F0F3FA]">
          <div>
            {isDiscounted && (
              <p className="text-xs line-through text-[#8E95A5]">
                ${formatPrice(base)}
              </p>
            )}
            <p className="text-xl font-bold text-[#0D1B2A]">
              ${formatPrice(finalPrice)}
            </p>
          </div>

          {isDiscounted && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[#DCFCE7] text-[#15803D]">
              Save ${formatPrice(saving.amount)} &nbsp;·&nbsp; {saving.percentage}% off
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
