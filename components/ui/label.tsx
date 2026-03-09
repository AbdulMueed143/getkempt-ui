import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ required, children, className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "block text-xs font-medium text-cool-gray tracking-wide uppercase mb-1.5",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-warm-sand ml-1" aria-hidden="true">*</span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";
