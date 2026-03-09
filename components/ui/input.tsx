import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, leftAddon, rightAddon, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftAddon && (
          <span className="absolute left-3.5 text-royal-indigo/50 pointer-events-none select-none">
            {leftAddon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            /* Base — white fill so the field stands out clearly on dark bg */
            "w-full rounded-lg bg-white border text-midnight-navy",
            "px-4 py-3 text-sm font-sans placeholder:text-cool-gray",
            "transition-all duration-200",
            /* Border */
            hasError
              ? "border-red-400 focus:border-red-500 focus:ring-red-400/20"
              : "border-white hover:border-royal-indigo focus:border-royal-indigo",
            /* Focus */
            "focus:outline-none",
            "focus:shadow-[0_0_0_3px_rgba(27,49,99,0.2)]",
            /* Disabled */
            "disabled:opacity-50 disabled:cursor-not-allowed",
            /* Padding adjustments for addons */
            leftAddon && "pl-10",
            rightAddon && "pr-10",
            className
          )}
          {...props}
        />
        {rightAddon && (
          <span className="absolute right-3.5 text-royal-indigo/50">
            {rightAddon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
