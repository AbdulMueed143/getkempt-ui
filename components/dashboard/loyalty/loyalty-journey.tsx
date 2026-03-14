import { ChevronRight, Hash, DollarSign } from "lucide-react";
import type { LoyaltyProgram } from "@/types/loyalty";
import { programTierColor } from "@/types/loyalty";

interface LoyaltyJourneyProps {
  programs: LoyaltyProgram[];
}

/**
 * Visual timeline showing every active program in sequence order.
 * Each "step" represents one rung of the loyalty ladder that clients
 * work through one at a time.
 */
export function LoyaltyJourney({ programs }: LoyaltyJourneyProps) {
  const active = [...programs]
    .filter((p) => p.status === "active")
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  if (active.length === 0) return null;

  return (
    <div
      className="bg-white rounded-2xl px-5 py-4"
      style={{ border: "1px solid #E8ECF4" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "#1B3163" }}>Client journey</h3>
          <p className="text-xs mt-0.5" style={{ color: "#8E95A5" }}>
            Clients progress through these programs in order — one at a time
          </p>
        </div>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "#EEF1F8", color: "#1B3163" }}
        >
          {active.length} active program{active.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Horizontal scroll on small screens */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-0" style={{ minWidth: active.length * 140 }}>
          {active.map((program, idx) => {
            const tier = programTierColor(program.sequenceOrder);
            const isLast = idx === active.length - 1;
            return (
              <div key={program.id} className="flex items-center">
                {/* Step node */}
                <div
                  className="flex flex-col items-center gap-2 px-3 py-3 rounded-2xl"
                  style={{
                    minWidth:        130,
                    backgroundColor: tier.accentBg,
                    border:          `1.5px solid ${tier.accent}22`,
                  }}
                >
                  {/* Tier badge */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: tier.accent, color: "#FFFFFF" }}
                  >
                    {program.sequenceOrder}
                  </div>

                  {/* Trigger pill */}
                  <div className="flex items-center gap-1">
                    {program.triggerType === "visits"
                      ? <Hash size={11} style={{ color: tier.accent }} />
                      : <DollarSign size={11} style={{ color: tier.accent }} />}
                    <span className="text-[11px] font-semibold" style={{ color: tier.accent }}>
                      {program.triggerType === "visits"
                        ? `${program.triggerValue} visits`
                        : `$${program.triggerValue} spent`}
                    </span>
                  </div>

                  {/* Reward label */}
                  <p
                    className="text-[11px] text-center leading-snug font-medium"
                    style={{ color: "#1B3163", maxWidth: 100 }}
                  >
                    {program.rewardLabel}
                  </p>
                </div>

                {/* Connector arrow */}
                {!isLast && (
                  <div className="flex items-center shrink-0 px-1">
                    <ChevronRight size={18} style={{ color: "#C5CEDF" }} />
                  </div>
                )}
              </div>
            );
          })}

          {/* "And beyond" placeholder */}
          <div className="flex items-center pl-1">
            <ChevronRight size={18} style={{ color: "#E8ECF4" }} />
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-medium"
              style={{ border: "1.5px dashed #C5CEDF", color: "#8E95A5" }}
            >
              +
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
