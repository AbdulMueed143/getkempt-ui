import {
  Clock, DollarSign, Pencil, Trash2, Wifi, WifiOff,
  Timer, ShieldCheck,
} from "lucide-react";
import type { Service } from "@/types/service";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/service";

interface ServiceCardProps {
  service:  Service;
  onEdit:   (service: Service) => void;
  onDelete: (id: string) => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const cat        = CATEGORY_COLORS[service.category];
  const isInactive = service.status === "inactive";

  return (
    <article
      className="bg-white rounded-2xl overflow-hidden flex flex-col group transition-shadow hover:shadow-md"
      style={{
        border:     "1px solid #E8ECF4",
        boxShadow:  "0 1px 3px rgba(27,49,99,0.06)",
        opacity:    isInactive ? 0.7 : 1,
      }}
    >
      {/* ── Header: cover image or colour strip ─────── */}
      {service.image ? (
        <div className="relative h-28 shrink-0 overflow-hidden">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          {/* Category badge overlaid on image */}
          <span
            className="absolute bottom-2 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: cat.color, backgroundColor: cat.bg + "ee" }}
          >
            {CATEGORY_LABELS[service.category]}
          </span>
        </div>
      ) : (
        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: cat.color }} />
      )}

      <div className="flex flex-col flex-1 px-5 py-4 gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Category badge (hidden when image shows it) + status */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {!service.image && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: cat.color, backgroundColor: cat.bg }}
                >
                  {CATEGORY_LABELS[service.category]}
                </span>
              )}
              {isInactive && (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ color: "#8E95A5", backgroundColor: "#F3F4F6" }}
                >
                  Inactive
                </span>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight" style={{ color: "#1B3163" }}>
              {service.name}
            </h3>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(service)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#F0F3FA", border: "1px solid #E8ECF4", color: "#1B3163" }}
              title="Edit service"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(service.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
              title="Delete service"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Description */}
        {service.description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#6B7A99" }}>
            {service.description}
          </p>
        )}

        {/* Key metrics row */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Duration */}
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "#8E95A5" }}>
            <Clock size={13} style={{ color: "#9FB2D9" }} />
            {service.durationMinutes} min
          </span>

          {/* Buffer */}
          {service.bufferMinutes > 0 && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#8E95A5" }}>
              <Timer size={13} style={{ color: "#9FB2D9" }} />
              +{service.bufferMinutes} min buffer
            </span>
          )}

          {/* Online booking */}
          <span className="flex items-center gap-1.5 text-xs" style={{ color: service.onlineBookingEnabled ? "#16A34A" : "#8E95A5" }}>
            {service.onlineBookingEnabled
              ? <Wifi size={13} />
              : <WifiOff size={13} />}
            {service.onlineBookingEnabled ? "Online" : "Walk-in only"}
          </span>
        </div>

        {/* Deposit badge */}
        {service.depositRequired && service.depositAmount != null && (
          <div
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg w-fit"
            style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", color: "#92400E" }}
          >
            <ShieldCheck size={12} />
            ${service.depositAmount} deposit required
          </div>
        )}

        {/* Footer: price */}
        <div
          className="flex items-center justify-between pt-3 mt-auto"
          style={{ borderTop: "1px solid #F0F3FA" }}
        >
          <div className="flex items-baseline gap-0.5">
            <DollarSign size={14} style={{ color: "#1B3163" }} />
            <span className="text-xl font-bold" style={{ color: "#1B3163" }}>
              {service.price.toFixed(2)}
            </span>
          </div>
          <span className="text-xs" style={{ color: "#8E95A5" }}>
            {service.staffIds.length > 0
              ? `${service.staffIds.length} staff`
              : "No staff assigned"}
          </span>
        </div>
      </div>
    </article>
  );
}
