"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Zap } from "lucide-react";
import { QUICK_ACTIONS } from "@/lib/mock/dashboard";
import { useQuickActionStore, type QuickActionTarget } from "@/store/quick-action-store";

/** Maps a quick-action id to the Zustand signal it sends before navigating. */
const ACTION_SIGNALS: Record<string, QuickActionTarget | null> = {
  "add-booking": "booking",
  "add-staff":   "staff",
  "add-service": "service",
  "set-hours":   null, // direct navigation only, no slideover to open
};

export function QuickActions() {
  const router  = useRouter();
  const trigger = useQuickActionStore((s) => s.trigger);

  function handleClick(actionId: string, href: string) {
    const signal = ACTION_SIGNALS[actionId];
    if (signal) trigger(signal);
    router.push(href);
  }

  return (
    <div
      className="bg-white rounded-2xl p-5"
      style={{
        border: "1px solid #E8E4DA",
        boxShadow:
          "0 1px 2px rgba(11,18,32,0.04), 0 1px 3px rgba(11,18,32,0.04)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: "#FDF5E8",
            border: "1px solid #F2E4C1",
          }}
        >
          <Zap
            size={16}
            className="text-[#8A6D2F]"
            strokeWidth={2.25}
            fill="#C4A882"
          />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-[#0B1220] leading-tight">
            Quick Actions
          </h2>
          <p className="text-[11px] font-medium text-[#6B7280] mt-0.5">
            Get things done fast
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.id}>
              <button
                type="button"
                onClick={() => handleClick(action.id, action.href)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all group text-left bg-[#FAF8F3] hover:bg-white hover:border-[#C4A882]/40 border border-transparent hover:shadow-sm"
              >
                {/* Icon bubble */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${action.accentColor}18`,
                    border: `1px solid ${action.accentColor}30`,
                  }}
                >
                  <Icon
                    size={17}
                    style={{ color: action.accentColor }}
                    strokeWidth={2.25}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#0B1220] leading-tight">
                    {action.label}
                  </p>
                  <p className="text-[11px] mt-0.5 text-[#6B7280] font-medium leading-tight">
                    {action.description}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight
                  size={16}
                  className="shrink-0 transition-all text-[#9CA3AF] group-hover:text-[#C4A882] group-hover:translate-x-0.5"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
