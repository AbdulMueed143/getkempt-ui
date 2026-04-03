"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
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
      style={{ border: "1px solid #E8ECF4", boxShadow: "0 1px 3px rgba(27,49,99,0.06)" }}
    >
      <h2 className="text-base font-semibold mb-4" style={{ color: "#1B3163" }}>
        Quick Actions
      </h2>

      <ul className="space-y-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.id}>
              <button
                type="button"
                onClick={() => handleClick(action.id, action.href)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all group text-left"
                style={{ backgroundColor: "#F8F9FC" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F0F3FA";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F8F9FC";
                }}
              >
                {/* Icon bubble */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${action.accentColor}18` }}
                >
                  <Icon size={17} style={{ color: action.accentColor }} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "#1B3163" }}>
                    {action.label}
                  </p>
                  <p className="text-xs" style={{ color: "#8E95A5" }}>
                    {action.description}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight
                  size={16}
                  className="shrink-0 transition-transform group-hover:translate-x-0.5"
                  style={{ color: "#8E95A5" }}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
