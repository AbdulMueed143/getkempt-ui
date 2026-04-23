import {
  Percent, DollarSign, Gift, Scissors,
  Hash, ShoppingBag, Store, MapPin,
  Calendar, Clock, Pencil, Trash2,
  TrendingUp,
} from "lucide-react";
import type { LoyaltyProgram, RewardType, TriggerType } from "@/types/loyalty";
import { programTierColor, REWARD_TYPE_LABELS } from "@/types/loyalty";
import { formatDate } from "@/lib/utils/date";

/* ── Icon helpers ────────────────────────────────────────── */
const REWARD_ICONS: Record<RewardType, typeof Percent> = {
  percentage: Percent,
  fixed:      DollarSign,
  free_visit: Scissors,
  free_item:  Gift,
};

const TRIGGER_ICONS: Record<TriggerType, typeof Hash> = {
  visits: Hash,
  spend:  ShoppingBag,
};

/* ── Component ───────────────────────────────────────────── */
interface LoyaltyProgramCardProps {
  program:  LoyaltyProgram;
  onEdit:   (p: LoyaltyProgram) => void;
  onDelete: (id: string) => void;
}

export function LoyaltyProgramCard({ program, onEdit, onDelete }: LoyaltyProgramCardProps) {
  const tier       = programTierColor(program.sequenceOrder);
  const RewardIcon = REWARD_ICONS[program.rewardType];
  const TrigIcon   = TRIGGER_ICONS[program.triggerType];
  const isInactive = program.status !== "active";
  const isDraft    = program.status === "draft";
  const redeemRate = program.totalEarned > 0
    ? Math.round((program.totalRedeemed / program.totalEarned) * 100)
    : 0;

  return (
    <article
      className="bg-white rounded-2xl flex flex-col overflow-hidden group transition-shadow hover:shadow-md"
      style={{
        border:   "1px solid #E8E4DA",
        boxShadow: "0 1px 3px rgba(27,49,99,0.05)",
        opacity:  isInactive ? 0.72 : 1,
      }}
    >
      {/* Tier accent bar */}
      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: tier.accent }} />

      <div className="flex flex-col flex-1 px-5 pt-4 pb-5 gap-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Sequence badge */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: tier.accent, color: "#FFFFFF" }}
            >
              {program.sequenceOrder}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm leading-tight" style={{ color: "#1B3163" }}>
                  {program.name}
                </h3>
                {/* Status pill */}
                {isDraft ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7A99" }}>Draft</span>
                ) : isInactive ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>Inactive</span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#DCFCE7", color: "#15803D" }}>Active</span>
                )}
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: tier.accent, fontWeight: 600 }}>
                {tier.label}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(program)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#F0EEE6", border: "1px solid #E8E4DA", color: "#1B3163" }}
              title="Edit program"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(program.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
              title="Delete program"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Description */}
        {program.description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#6B7A99" }}>
            {program.description}
          </p>
        )}

        {/* Info rows */}
        <div className="space-y-2">

          {/* Trigger */}
          <InfoRow
            icon={<TrigIcon size={14} />}
            iconColor={tier.accent}
            label={program.triggerType === "visits"
              ? `After ${program.triggerValue} visits`
              : `After spending $${program.triggerValue}`}
            sub="Eligibility trigger"
          />

          {/* Reward */}
          <InfoRow
            icon={<RewardIcon size={14} />}
            iconColor="#1B3163"
            label={program.rewardLabel}
            sub={REWARD_TYPE_LABELS[program.rewardType]}
          />

          {/* Location */}
          <InfoRow
            icon={program.redeemLocation === "own_shop" ? <Store size={14} /> : <MapPin size={14} />}
            iconColor="#6B7280"
            label={program.redeemLocation === "own_shop"
              ? "Redeemable at your shop"
              : `Redeemable at ${program.partnerName}`}
            sub={program.partnerAddress ?? undefined}
          />

          {/* Expiry info */}
          {(program.rewardExpiryDays || program.programExpiryDate) && (
            <InfoRow
              icon={<Clock size={14} />}
              iconColor="#D97706"
              label={program.rewardExpiryDays
                ? `Reward valid for ${program.rewardExpiryDays} days once earned`
                : undefined}
              extra={program.programExpiryDate
                ? <span className="text-[11px]" style={{ color: "#D97706" }}>
                    Program ends {formatDate(program.programExpiryDate)}
                  </span>
                : undefined}
            />
          )}
        </div>

        {/* Stats footer */}
        <div
          className="flex items-center justify-between pt-3 mt-auto"
          style={{ borderTop: "1px solid #F0EEE6" }}
        >
          <Stat label="Earned"   value={program.totalEarned}   />
          <div style={{ width: 1, height: 28, backgroundColor: "#F0EEE6" }} />
          <Stat label="Redeemed" value={program.totalRedeemed} />
          <div style={{ width: 1, height: 28, backgroundColor: "#F0EEE6" }} />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-bold flex items-center gap-0.5" style={{ color: "#1B3163" }}>
              <TrendingUp size={12} /> {redeemRate}%
            </span>
            <span className="text-[10px]" style={{ color: "#6B7280" }}>Redeem rate</span>
          </div>
        </div>

      </div>
    </article>
  );
}

/* ── Micro-components ───────────────────────────────────── */
function InfoRow({
  icon, iconColor, label, sub, extra,
}: {
  icon:       React.ReactNode;
  iconColor:  string;
  label?:     string;
  sub?:       string;
  extra?:     React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0" style={{ color: iconColor }}>{icon}</span>
      <div className="min-w-0">
        {label && <p className="text-xs font-medium leading-snug" style={{ color: "#1B3163" }}>{label}</p>}
        {sub   && <p className="text-[11px] leading-snug"         style={{ color: "#6B7280" }}>{sub}</p>}
        {extra}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-sm font-bold" style={{ color: "#1B3163" }}>{value}</span>
      <span className="text-[10px]"       style={{ color: "#6B7280" }}>{label}</span>
    </div>
  );
}

// React import needed for JSX in the helper functions
import React from "react";
