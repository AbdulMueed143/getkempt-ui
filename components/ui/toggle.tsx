"use client";

import { cn } from "@/lib/utils/cn";

interface ToggleProps {
  checked:    boolean;
  onChange:   (value: boolean) => void;
  disabled?:  boolean;
  className?: string;
}

/**
 * Accessible toggle switch.
 *
 * Uses a 2px padding on the track so the knob is always fully contained —
 * no transform math needed, no overflow risk.
 *
 * Track: 44 × 24 px  |  Knob: 20 × 20 px  |  Gap: 2 px each side.
 */
export function Toggle({ checked, onChange, disabled = false, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative shrink-0 rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3163] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        width:           44,
        height:          24,
        padding:         2,
        backgroundColor: checked ? "#1B3163" : "#D1D5DB",
      }}
    >
      {/* Knob — translate within the padded track */}
      <span
        className="block rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{
          width:     20,
          height:    20,
          /* Off: stays at x=0 (left padding provides the 2px gap).
             On:  travels 20px so right edge sits at padding-right boundary. */
          transform: `translateX(${checked ? 20 : 0}px)`,
        }}
      />
    </button>
  );
}
