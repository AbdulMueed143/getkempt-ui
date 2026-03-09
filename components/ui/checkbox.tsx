import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  hasError?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, hasError, className, id, ...props }, ref) => {
    const checkboxId = id ?? `checkbox-${Math.random().toString(36).slice(2)}`;

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="peer absolute opacity-0 w-5 h-5 cursor-pointer"
            {...props}
          />
          <div
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center",
              "transition-all duration-150",
              hasError ? "border-red-400/60" : "border-white/20",
              "peer-checked:bg-warm-sand peer-checked:border-warm-sand",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-royal-indigo peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-midnight-navy",
              "peer-hover:border-royal-indigo/60"
            )}
          >
            <Check
              size={12}
              strokeWidth={3}
              className="text-midnight-navy opacity-0 peer-checked:opacity-100 transition-opacity"
            />
          </div>
        </div>
        {label && (
          <label
            htmlFor={checkboxId}
            className="text-sm text-cool-gray cursor-pointer leading-relaxed select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
