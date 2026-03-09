import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, hasError, className, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-lg bg-white border text-midnight-navy",
            "px-4 py-3 pr-10 text-sm font-sans",
            "transition-all duration-200 cursor-pointer",
            hasError
              ? "border-red-400 focus:border-red-500"
              : "border-white hover:border-royal-indigo focus:border-royal-indigo",
            "focus:outline-none",
            "focus:shadow-[0_0_0_3px_rgba(27,49,99,0.2)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled style={{ background: "#2A2E3A", color: "#EAEAEA" }}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: "#1B3163", color: "#EAEAEA" }}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-royal-indigo/50 pointer-events-none"
        />
      </div>
    );
  }
);

Select.displayName = "Select";
